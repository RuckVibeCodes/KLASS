import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { getCommunityBySlug, getProfileByClerkId } from "@/lib/supabase/queries";
import { UserViolationsView } from "./user-violations-view";

export default async function UserViolationsPage({
  params,
}: {
  params: Promise<{ "community-slug": string }>;
}) {
  const { userId } = await auth();
  const resolvedParams = await params;
  const communitySlug = resolvedParams["community-slug"];

  if (!userId) {
    redirect("/sign-in");
  }

  const community = await getCommunityBySlug(communitySlug);
  if (!community) {
    redirect("/");
  }

  const profile = await getProfileByClerkId(userId, community.id);
  if (!profile) {
    redirect(`/${communitySlug}`);
  }

  const supabase = await createClient();

  // Fetch user's violations
  const { data: violations } = await supabase
    .from("violations")
    .select(`
      *,
      issuer:profiles!violations_issued_by_fkey(id, display_name),
      appeal_reviewer:profiles!violations_appeal_reviewed_by_fkey(id, display_name)
    `)
    .eq("community_id", community.id)
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false });

  // Fetch enforcement status
  const { data: enforcement } = await supabase
    .from("user_enforcement_status")
    .select("*")
    .eq("community_id", community.id)
    .eq("profile_id", profile.id)
    .single();

  return (
    <div className="container max-w-3xl py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Violations</h1>
        <p className="text-muted-foreground">
          View your community standing and violation history
        </p>
      </div>

      <UserViolationsView
        violations={violations || []}
        enforcement={enforcement}
        communityId={community.id}
        communitySlug={communitySlug}
      />
    </div>
  );
}
