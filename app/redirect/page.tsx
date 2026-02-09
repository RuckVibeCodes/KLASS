import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";

export default async function RedirectPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const supabase = await createClient();

  // Find the user's communities/profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select(`
      id,
      role,
      community:communities(id, slug, name)
    `)
    .eq("clerk_user_id", userId)
    .order("created_at", { ascending: false });

  if (!profiles || profiles.length === 0) {
    // No communities yet - redirect to create one
    redirect("/create-community");
  }

  // If user is admin of any community, prefer that one
  const adminProfile = profiles.find((p) => p.role === "ADMIN");
  
  if (adminProfile?.community) {
    redirect(`/${(adminProfile.community as { slug: string }).slug}`);
  }

  // Otherwise, go to their most recent community
  const firstProfile = profiles[0];
  if (firstProfile?.community) {
    redirect(`/${(firstProfile.community as { slug: string }).slug}`);
  }

  // Fallback: create a community
  redirect("/create-community");
}
