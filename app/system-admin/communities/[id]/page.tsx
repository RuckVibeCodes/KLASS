import Link from "next/link";
import { notFound } from "next/navigation";
import { getCommunityDetails } from "@/actions/master-admin";
import { getSystemFeatureFlags } from "@/lib/feature-flags";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ExternalLink, Users, BookOpen, FileText, Zap } from "lucide-react";
import { CommunityStatusActions } from "./status-actions";
import { CommunityFeatureOverrides } from "./feature-overrides";
import { SimulateConversion } from "./simulate-conversion";

interface Admin {
  id: string;
  display_name: string | null;
  email: string | null;
  clerk_user_id: string;
}

export default async function CommunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [communityResult, flags] = await Promise.all([
    getCommunityDetails(id),
    getSystemFeatureFlags(),
  ]);

  if (communityResult.error || !communityResult.data) {
    notFound();
  }

  const community = communityResult.data;

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/system-admin/communities"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Communities
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {community.name}
            <Link
              href={`/${community.slug}`}
              target="_blank"
              className="text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="h-5 w-5" />
            </Link>
          </h1>
          <p className="text-muted-foreground">/{community.slug}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={community.status === "active" ? "default" : "destructive"}
          >
            {community.status}
          </Badge>
          <Badge variant="outline">{community.billing_status || "active"}</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <Users className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <div className="text-2xl font-bold">{community.member_count}</div>
                <div className="text-xs text-muted-foreground">Members</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <BookOpen className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <div className="text-2xl font-bold">{community.program_count}</div>
                <div className="text-xs text-muted-foreground">Programs</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <FileText className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <div className="text-2xl font-bold">{community.post_count}</div>
                <div className="text-xs text-muted-foreground">Posts</div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{new Date(community.created_at).toLocaleDateString()}</span>
              </div>
              {community.created_by_clerk_id && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Provisioned by</span>
                  <span className="font-mono text-xs">{community.created_by_clerk_id}</span>
                </div>
              )}
            </div>

            {community.admins && community.admins.length > 0 && (
              <>
                <Separator />
                <div>
                  <div className="text-sm font-medium mb-2">Admins</div>
                  <div className="space-y-1">
                    {community.admins.map((admin: Admin) => (
                      <div
                        key={admin.id}
                        className="text-sm text-muted-foreground flex justify-between"
                      >
                        <span>{admin.display_name || admin.email || "Unknown"}</span>
                        <span className="font-mono text-xs">{admin.clerk_user_id}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Status Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Status Management</CardTitle>
            <CardDescription>
              Control community access and billing status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CommunityStatusActions
              communityId={community.id}
              currentStatus={community.status}
              currentBillingStatus={community.billing_status || "active"}
            />
          </CardContent>
        </Card>
      </div>

      {/* Feature Overrides */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Overrides</CardTitle>
          <CardDescription>
            Override system-wide feature flags for this community. Unset values
            use the system default.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CommunityFeatureOverrides
            communityId={community.id}
            flags={flags}
            overrides={community.feature_overrides || []}
          />
        </CardContent>
      </Card>

      {/* Affiliate Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Simulate Conversion
          </CardTitle>
          <CardDescription>
            Test the affiliate system by simulating a paid conversion for a
            referred member. This triggers real commission calculation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SimulateConversion communityId={community.id} />
        </CardContent>
      </Card>
    </div>
  );
}
