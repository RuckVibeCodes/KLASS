import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { getCommunityBySlug, getProfileByClerkId } from "@/lib/supabase/queries";
import { ReportsManager } from "./reports-manager";

export default async function AdminReportsPage({
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

  // Fetch reports with related data
  const { data: reports } = await supabase
    .from("reports")
    .select(`
      *,
      reporter:profiles!reports_reporter_profile_id_fkey(id, display_name, avatar_url),
      reported:profiles!reports_reported_profile_id_fkey(id, display_name, avatar_url),
      resolver:profiles!reports_resolved_by_fkey(id, display_name)
    `)
    .eq("community_id", community.id)
    .order("created_at", { ascending: false });

  // Get stats
  const stats = {
    pending: reports?.filter((r) => r.status === "pending").length || 0,
    reviewing: reports?.filter((r) => r.status === "reviewing").length || 0,
    resolved: reports?.filter((r) => r.status === "resolved").length || 0,
    dismissed: reports?.filter((r) => r.status === "dismissed").length || 0,
    total: reports?.length || 0,
  };

  return (
    <div className="container max-w-6xl py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Content Reports</h1>
        <p className="text-muted-foreground">
          Review and manage reported content in your community
        </p>
      </div>

      <ReportsManager 
        reports={reports || []} 
        stats={stats}
        communityId={community.id}
      />
    </div>
  );
}
