import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPlatformStats } from "@/actions/master-admin";
import { Building2, Users, BookOpen, FileText } from "lucide-react";

export default async function SystemAdminDashboard() {
  const result = await getPlatformStats();
  const stats = result.data;

  const statCards = [
    {
      title: "Total Communities",
      value: stats?.total_communities ?? 0,
      subvalue: `${stats?.active_communities ?? 0} active`,
      icon: Building2,
    },
    {
      title: "Total Members",
      value: stats?.total_members ?? 0,
      subvalue: "across all communities",
      icon: Users,
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
      subvalue: "across all communities",
      icon: FileText,
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
