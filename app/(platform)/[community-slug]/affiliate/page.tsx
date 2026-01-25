import { createClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { getAffiliateStats, getAffiliateSettings } from "@/actions/affiliates";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AffiliateDashboard } from "./affiliate-dashboard";

export default async function AffiliatePage({
  params,
}: {
  params: Promise<{ "community-slug": string }>;
}) {
  const { userId } = await auth();
  const resolvedParams = await params;
  const communitySlug = resolvedParams["community-slug"];

  if (!userId) redirect("/sign-in");

  const supabase = await createClient();

  // Get community
  const { data: community } = await supabase
    .from("communities")
    .select("id, name")
    .eq("slug", communitySlug)
    .single();

  if (!community) notFound();

  // Check if affiliate feature is enabled
  const affiliateEnabled = await isFeatureEnabled(community.id, "affiliate_enabled");

  if (!affiliateEnabled) {
    return (
      <div className="container py-6 max-w-2xl">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              The affiliate program is not available for this community.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get affiliate settings
  const settingsResult = await getAffiliateSettings(communitySlug);
  const settings = settingsResult.data;

  if (!settings?.enabled) {
    return (
      <div className="container py-6 max-w-2xl">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              The affiliate program is currently disabled.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get user stats
  const statsResult = await getAffiliateStats(communitySlug);

  if (statsResult.error) {
    return (
      <div className="container py-6 max-w-2xl">
        <Card>
          <CardContent className="py-12 text-center text-destructive">
            {statsResult.error}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Affiliate Program</h1>
        <p className="text-muted-foreground">
          Share your link and earn {settings.commission_rate}% commission on referrals
        </p>
      </div>

      <AffiliateDashboard
        communitySlug={communitySlug}
        stats={statsResult.data!}
        commissionRate={settings.commission_rate}
      />
    </div>
  );
}
