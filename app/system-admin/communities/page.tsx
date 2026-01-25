import Link from "next/link";
import { listCommunities } from "@/actions/master-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Users, BookOpen, FileText, ExternalLink } from "lucide-react";

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "active":
      return "default";
    case "paused":
      return "secondary";
    case "suspended":
      return "destructive";
    default:
      return "outline";
  }
}

function getBillingBadgeVariant(status: string) {
  switch (status) {
    case "active":
      return "default";
    case "trialing":
      return "secondary";
    case "past_due":
      return "destructive";
    case "canceled":
      return "outline";
    default:
      return "outline";
  }
}

export default async function CommunitiesPage() {
  const { data: communities, error } = await listCommunities();

  if (error) {
    return (
      <div className="text-destructive">
        Failed to load communities: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Communities</h1>
          <p className="text-muted-foreground">
            Manage all communities on the platform
          </p>
        </div>
        <Link href="/system-admin/communities/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Community
          </Button>
        </Link>
      </div>

      {/* Communities List */}
      <div className="grid gap-4">
        {communities?.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No communities yet. Create your first community to get started.
            </CardContent>
          </Card>
        )}

        {communities?.map((community) => (
          <Card key={community.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {community.name}
                    <Link
                      href={`/${community.slug}`}
                      target="_blank"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    /{community.slug}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusBadgeVariant(community.status)}>
                    {community.status}
                  </Badge>
                  <Badge
                    variant={getBillingBadgeVariant(
                      community.billing_status || "active"
                    )}
                  >
                    {community.billing_status || "active"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{community.member_count} members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{community.program_count} programs</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>{community.post_count} posts</span>
                  </div>
                </div>
                <Link href={`/system-admin/communities/${community.id}`}>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
