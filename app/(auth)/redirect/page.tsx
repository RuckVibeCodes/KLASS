import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";

export default async function RedirectPage() {
  const { userId } = await auth();

  console.log("[Redirect] Clerk userId:", userId);

  if (!userId) {
    redirect("/sign-in");
  }

  // Check if user has any community memberships (use admin client to bypass RLS)
  const supabase = await createAdminClient();
  
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("community_id, communities(slug)")
    .eq("clerk_user_id", userId)
    .limit(1)
    .single();

  console.log("[Redirect] Profile lookup:", { profile, error });

  // communities is returned as object when using foreign key relation
  const community = profile?.communities as unknown as { slug: string } | null;
  if (community?.slug) {
    // User has a community, redirect to it
    redirect(`/${community.slug}`);
  }

  // No community found, send to create one
  redirect("/create-community");
}
