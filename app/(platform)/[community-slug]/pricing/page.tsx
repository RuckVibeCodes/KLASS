import { createClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { TierComparison } from "@/components/pricing/tier-comparison";
import type { MembershipTier } from "@/types/database";

export default async function PricingPage({
  params,
}: {
  params: Promise<{ "community-slug": string }>;
}) {
  const { userId } = await auth();
  const resolvedParams = await params;
  const communitySlug = resolvedParams["community-slug"];
  const supabase = await createClient();

  // Get community
  const { data: community } = await supabase
    .from("communities")
    .select("*")
    .eq("slug", communitySlug)
    .single();

  if (!community) redirect("/");

  // Get active tiers
  const { data: tiers } = await supabase
    .from("membership_tiers")
    .select("*")
    .eq("community_id", community.id)
    .eq("active", true)
    .order("tier_level", { ascending: true });

  // Get current user's profile and tier if logged in
  let currentTier: MembershipTier | null = null;
  let profileId: string | null = null;

  if (userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select(`
        id,
        membership_tier_id,
        membership_tier:membership_tiers(*)
      `)
      .eq("clerk_user_id", userId)
      .eq("community_id", community.id)
      .single();

    if (profile) {
      profileId = profile.id;
      // Supabase returns an array for relations, but since this is a single relation we take the first item
      const tierData = profile.membership_tier as unknown;
      if (Array.isArray(tierData) && tierData.length > 0) {
        currentTier = tierData[0] as MembershipTier;
      } else if (tierData && !Array.isArray(tierData)) {
        currentTier = tierData as MembershipTier;
      }
    }
  }

  return (
    <div className="container py-12 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Membership Plans</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Choose the plan that&apos;s right for you. Upgrade anytime to unlock more content and features.
        </p>
      </div>

      <TierComparison
        tiers={(tiers as MembershipTier[]) || []}
        currentTier={currentTier}
        communitySlug={communitySlug}
        profileId={profileId}
        isLoggedIn={!!userId}
      />
    </div>
  );
}
