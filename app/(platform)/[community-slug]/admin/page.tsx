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
  Flag,
  Gavel,
} from "lucide-react";
import Link from "next/link";
import {
  getCommunityBySlug,
  getProfileByClerkId,
  getCommunityStats,
  getRecentMembers,
} from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { getMemberSignals } from "@/lib/member-signals";
import { NeedsAttentionPanel } from "@/components/admin/needs-attention-panel";

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

  if (!userId) {
    redirect("/sign-in");
  }

  // Use cached query for community
  const community = await getCommunityBySlug(communitySlug);

  if (!community) redirect("/");

  // Use cached query for profile
  const profile = await getProfileByClerkId(userId, community.id);

  // For demo purposes, allow all authenticated users to access admin
  // In production: if (profile?.role !== "ADMIN") redirect(...)
  if (!profile) {
    redirect(`/${communitySlug}`);
  }

  // Get stats, recent members, and member signals using consolidated cached queries
  const supabase = await createClient();
  const [stats, recentMembers, signals] = await Promise.all([
    getCommunityStats(community.id),
    getRecentMembers(community.id, 5),
    getMemberSignals(supabase, community.id),
  ]);

  const baseUrl = `/${communitySlug}`;

  return (
    <div className="container py-6">
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
            <Link href={`${baseUrl}/admin/reports`}>
              <Button variant="outline" className="w-full justify-start">
                <Flag className="h-4 w-4 mr-2" />
                Content Reports
              </Button>
            </Link>
            <Link href={`${baseUrl}/admin/violations`}>
              <Button variant="outline" className="w-full justify-start">
                <Gavel className="h-4 w-4 mr-2" />
                Violations & Strikes
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
