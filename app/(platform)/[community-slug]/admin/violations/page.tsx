import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { getCommunityBySlug, getProfileByClerkId } from "@/lib/supabase/queries";
import { ViolationsManager } from "./violations-manager";

export default async function AdminViolationsPage({
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
  if (!profile || profile.role !== "ADMIN") {
    redirect(`/${communitySlug}`);
  }

  const supabase = await createClient();

  // Fetch violations with related data
  const { data: violations } = await supabase
    .from("violations")
    .select(`
      *,
      profile:profiles!violations_profile_id_fkey(id, display_name, avatar_url),
      issuer:profiles!violations_issued_by_fkey(id, display_name),
      appeal_reviewer:profiles!violations_appeal_reviewed_by_fkey(id, display_name)
    `)
    .eq("community_id", community.id)
    .order("created_at", { ascending: false });

  // Fetch enforcement statuses
  const { data: enforcementStatuses } = await supabase
    .from("user_enforcement_status")
    .select(`
      *,
      profile:profiles!user_enforcement_status_profile_id_fkey(id, display_name, avatar_url)
    `)
    .eq("community_id", community.id)
    .neq("status", "good_standing")
    .order("updated_at", { ascending: false });

  // Get stats
  const stats = {
    totalViolations: violations?.length || 0,
    pendingAppeals: violations?.filter((v) => v.appeal_status === "pending").length || 0,
    suspendedUsers: enforcementStatuses?.filter((e) => e.status === "suspended").length || 0,
    bannedUsers: enforcementStatuses?.filter((e) => e.status === "banned").length || 0,
  };

  return (
    <div className="container max-w-6xl py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Violation Tracking</h1>
        <p className="text-muted-foreground">
          Manage violations, strikes, and user enforcement
        </p>
      </div>

      <ViolationsManager 
        violations={violations || []} 
        enforcementStatuses={enforcementStatuses || []}
        stats={stats}
        communityId={community.id}
        communitySlug={communitySlug}
      />
    </div>
  );
}
