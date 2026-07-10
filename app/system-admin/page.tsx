import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPlatformStats } from "@/actions/master-admin";
import {
  Activity,
  BookOpen,
  Building2,
  CalendarDays,
  FileText,
  Gauge,
  Library,
  Users,
} from "lucide-react";

export default async function SystemAdminDashboard() {
  const result = await getPlatformStats();
  const stats = result.data;

  const totalMembers = stats?.total_members ?? 0;
  const paidMembers = stats?.paid_members ?? 0;
  const activeCommunities = stats?.active_communities ?? 0;
  const totalCommunities = stats?.total_communities ?? 0;
  const paidConversionRate = totalMembers > 0
    ? Math.round((paidMembers / totalMembers) * 100)
    : 0;
  const activeCommunityRate = totalCommunities > 0
    ? Math.round((activeCommunities / totalCommunities) * 100)
    : 0;
  const avgMembersPerCommunity = activeCommunities > 0
    ? Math.round(totalMembers / activeCommunities)
    : 0;

  const statCards = [
    {
      title: "Total Communities",
      value: totalCommunities,
      subvalue: `${activeCommunities} active · ${activeCommunityRate}% live`,
      icon: Building2,
    },
    {
      title: "Total Members",
      value: totalMembers,
      subvalue: `${avgMembersPerCommunity} avg / active community`,
      icon: Users,
    },
    {
      title: "Paid Members",
      value: paidMembers,
      subvalue: `${paidConversionRate}% paid conversion`,
      icon: Activity,
    },
    {
      title: "Total Programs",
      value: stats?.total_programs ?? 0,
      subvalue: "across all communities",
      icon: BookOpen,
    },
    {
      title: "Total Posts",
      value: stats?.total_posts ?? 0,
      subvalue: "community engagement",
      icon: FileText,
    },
    {
      title: "Total Resources",
      value: stats?.total_resources ?? 0,
      subvalue: "downloadable assets",
      icon: Library,
    },
    {
      title: "Total Events",
      value: stats?.total_events ?? 0,
      subvalue: "live sessions scheduled",
      icon: CalendarDays,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">System Dashboard</h1>
        <p className="text-muted-foreground">
          Platform-wide overview and management
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.subvalue}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Growth Snapshot
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm md:grid-cols-3">
          <div>
            <div className="text-muted-foreground">Free members</div>
            <div className="text-2xl font-semibold">{stats?.free_members ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Upgrade pool for paid tier campaigns
            </p>
          </div>
          <div>
            <div className="text-muted-foreground">Paid conversion</div>
            <div className="text-2xl font-semibold">{paidConversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Paid members divided by total members
            </p>
          </div>
          <div>
            <div className="text-muted-foreground">Active community rate</div>
            <div className="text-2xl font-semibold">{activeCommunityRate}%</div>
            <p className="text-xs text-muted-foreground">
              Active communities divided by total communities
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Use the navigation above to manage communities and feature flags.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>Communities</strong> - View, pause, or configure
              individual communities
            </li>
            <li>
              <strong>Feature Flags</strong> - Manage system-wide feature
              defaults
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
