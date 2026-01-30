import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  MessageSquare,
  BookOpen,
  FolderOpen,
  Calendar,
  TrendingUp,
  Settings,
  Palette,
  ArrowRight,
  ClipboardList,
  Sparkles,
  Target,
} from "lucide-react";
import Link from "next/link";
import {
  getCommunityBySlug,
  getProfileByClerkId,
  getCommunityStats,
  getRecentMembers,
} from "@/lib/supabase/queries";
import { createAdminClient } from "@/lib/supabase/server";
import { getMemberSignals } from "@/lib/member-signals";
import { NeedsAttentionPanel } from "@/components/admin/needs-attention-panel";
import { OnboardingChecklistWrapper } from "./onboarding-checklist-wrapper";

// Revalidate every 5 minutes
export const revalidate = 300;

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ "community-slug": string }>;
}) {
  const { userId } = await auth();
  const resolvedParams = await params;
  const communitySlug = resolvedParams["community-slug"];

  const isDemo = communitySlug === "demo";

  if (!userId && !isDemo) {
    redirect("/sign-in");
  }

  // Use cached query for community
  const community = await getCommunityBySlug(communitySlug);

  if (!community) redirect("/");

  // Use cached query for profile (skip for unauthenticated demo visitors)
  const profile = userId
    ? await getProfileByClerkId(userId, community.id)
    : null;

  // For demo mode, allow unauthenticated access to view admin dashboard
  // For regular communities, require a profile
  if (!profile && !isDemo) {
    redirect(`/${communitySlug}`);
  }

  // Get stats, recent members, and member signals using consolidated cached queries
  const supabase = await createAdminClient();
  const { getCreatorOnboardingStatus } = await import("@/actions/onboarding");
  const [stats, recentMembers, signals, onboardingResult] = await Promise.all([
    getCommunityStats(community.id),
    getRecentMembers(community.id, 5),
    getMemberSignals(supabase, community.id),
    getCreatorOnboardingStatus(community.id),
  ]);
  const onboardingStatus = onboardingResult.data;

  const baseUrl = `/${communitySlug}`;

  return (
    <div className="container py-6">
      {/* Demo Banner */}
      {isDemo && (
        <div className="mb-6 rounded-lg border border-violet-500/30 bg-violet-500/10 p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-400" />
            <div>
              <p className="font-medium text-violet-300">
                Demo Admin Dashboard
              </p>
              <p className="text-sm text-violet-400/80">
                This is what community owners see. Manage content, view analytics, and configure your community — all from one place.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Creator Onboarding Checklist */}
      {onboardingStatus && !onboardingStatus.onboardingDismissed && !isDemo && (
        <div className="mb-6">
          <OnboardingChecklistWrapper
            communitySlug={communitySlug}
            communityId={community.id}
            status={onboardingStatus}
          />
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your community settings and content
          </p>
        </div>
        <Link href={`${baseUrl}/admin/settings`}>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Members"
          value={stats.totalMembers}
          icon={Users}
          href={`${baseUrl}/admin/members`}
        />
        <StatCard
          title="Paid Members"
          value={stats.paidMembers}
          icon={TrendingUp}
          trend={stats.totalMembers ? Math.round((stats.paidMembers / stats.totalMembers) * 100) : 0}
          href={`${baseUrl}/admin/members`}
        />
        <StatCard
          title="Posts"
          value={stats.totalPosts}
          icon={MessageSquare}
          href={`${baseUrl}/admin/content/posts`}
        />
        <StatCard
          title="Programs"
          value={stats.totalPrograms}
          icon={BookOpen}
          href={`${baseUrl}/admin/content/programs`}
        />
      </div>

      {/* Needs Attention Panel */}
      <div className="mb-8">
        <NeedsAttentionPanel signals={signals} communitySlug={communitySlug} />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href={`${baseUrl}/admin/branding`}>
              <Button variant="outline" className="w-full justify-start">
                <Palette className="h-4 w-4 mr-2" />
                Customize Branding
              </Button>
            </Link>
            <Link href={`${baseUrl}/admin/content/programs`}>
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="h-4 w-4 mr-2" />
                Manage Programs
              </Button>
            </Link>
            <Link href={`${baseUrl}/admin/content/resources`}>
              <Button variant="outline" className="w-full justify-start">
                <FolderOpen className="h-4 w-4 mr-2" />
                Manage Resources
              </Button>
            </Link>
            <Link href={`${baseUrl}/admin/content/events`}>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Manage Events
              </Button>
            </Link>
            <Link href={`${baseUrl}/admin/funnels`}>
              <Button variant="outline" className="w-full justify-start">
                <Target className="h-4 w-4 mr-2" />
                Funnels & Lead Magnets
              </Button>
            </Link>
            <Link href={`${baseUrl}/admin/playbooks`}>
              <Button variant="outline" className="w-full justify-start">
                <ClipboardList className="h-4 w-4 mr-2" />
                Playbooks
              </Button>
            </Link>
            <Link href={`${baseUrl}/admin/onboarding`}>
              <Button variant="outline" className="w-full justify-start">
                <Sparkles className="h-4 w-4 mr-2" />
                AI Onboarding
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Members</CardTitle>
            <Link href={`${baseUrl}/admin/members`}>
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentMembers.length > 0 ? (
              <div className="space-y-3">
                {recentMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                        {member.display_name?.charAt(0) || "U"}
                      </div>
                      <span className="text-sm font-medium">
                        {member.display_name || "User"}
                      </span>
                    </div>
                    <Badge
                      variant={member.tier === "PAID" ? "default" : "outline"}
                    >
                      {member.tier === "PAID" ? "Pro" : "Free"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No members yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Content Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <ContentStatCard
          title="Resources"
          count={stats.totalResources}
          icon={FolderOpen}
          href={`${baseUrl}/admin/content/resources`}
        />
        <ContentStatCard
          title="Events"
          count={stats.totalEvents}
          icon={Calendar}
          href={`${baseUrl}/admin/content/events`}
        />
        <ContentStatCard
          title="Community Posts"
          count={stats.totalPosts}
          icon={MessageSquare}
          href={`${baseUrl}/admin/content/posts`}
        />
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  href,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: number;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold">{value}</p>
              {trend !== undefined && (
                <p className="text-xs text-muted-foreground mt-1">
                  {trend}% conversion
                </p>
              )}
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ContentStatCard({
  title,
  count,
  icon: Icon,
  href,
}: {
  title: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">{title}</p>
            <p className="text-sm text-muted-foreground">{count} items</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
