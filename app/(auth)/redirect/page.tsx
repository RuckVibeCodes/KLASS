import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function RedirectPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check if user has any community memberships
  const supabase = await createClient();
  
  const { data: profile } = await supabase
    .from("profiles")
    .select("community_id, communities(slug)")
    .eq("clerk_user_id", userId)
    .limit(1)
    .single();

  if (profile?.communities?.slug) {
    // User has a community, redirect to it
    redirect(`/${profile.communities.slug}`);
  }

  // No community found, send to create one
  redirect("/create-community");
}
