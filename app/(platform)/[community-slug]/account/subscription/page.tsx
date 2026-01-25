import { createClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SubscriptionCard } from "@/components/pricing/subscription-card";
import type { MembershipTier, Subscription } from "@/types/database";

export default async function SubscriptionPage({
  params,
}: {
  params: Promise<{ "community-slug": string }>;
}) {
  const { userId } = await auth();
  const resolvedParams = await params;
  const communitySlug = resolvedParams["community-slug"];

  if (!userId) {
    redirect(`/${communitySlug}/join?redirect=/account/subscription`);
  }

  const supabase = await createClient();

  // Get community
  const { data: community } = await supabase
    .from("communities")
    .select("*")
    .eq("slug", communitySlug)
    .single();

  if (!community) redirect("/");

  // Get profile with tier and subscription
  const { data: profile } = await supabase
    .from("profiles")
    .select(`
      *,
      membership_tier:membership_tiers(*),
      subscriptions(*)
    `)
    .eq("clerk_user_id", userId)
    .eq("community_id", community.id)
    .single();

  if (!profile) {
    redirect(`/${communitySlug}`);
  }

  // Get all active tiers for upgrade options
  const { data: tiers } = await supabase
    .from("membership_tiers")
    .select("*")
    .eq("community_id", community.id)
    .eq("active", true)
    .order("tier_level", { ascending: true });

  // Find active subscription
  const activeSubscription = profile.subscriptions?.find(
    (sub: Subscription) => sub.status === "active" || sub.status === "trialing"
  );

  return (
    <div className="container py-6 max-w-2xl">
      <Link
        href={`/${communitySlug}`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Community
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">Your Subscription</h1>
        <p className="text-muted-foreground">
          Manage your membership plan and billing
        </p>
      </div>

      <SubscriptionCard
        currentTier={profile.membership_tier as MembershipTier | null}
        subscription={activeSubscription || null}
        allTiers={(tiers as MembershipTier[]) || []}
        communitySlug={communitySlug}
        profileId={profile.id}
      />
    </div>
  );
}
