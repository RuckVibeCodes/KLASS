"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Check, Crown, Loader2 } from "lucide-react";
import { formatTierPrice, calculateYearlySavings } from "@/lib/access";
import type { MembershipTier, BillingCycle } from "@/types/database";

interface TierComparisonProps {
  tiers: MembershipTier[];
  currentTier: MembershipTier | null;
  communitySlug: string;
  profileId: string | null;
  isLoggedIn: boolean;
}

export function TierComparison({
  tiers,
  currentTier,
  communitySlug,
  profileId,
  isLoggedIn,
}: TierComparisonProps) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [loadingTierId, setLoadingTierId] = useState<string | null>(null);

  const handleSelectTier = async (tier: MembershipTier) => {
    if (!isLoggedIn) {
      // Redirect to login/signup
      window.location.href = `/${communitySlug}/join?redirect=/pricing`;
      return;
    }

    // Check if this is a free tier or current tier
    if (tier.price_cents_monthly === 0 && tier.price_cents_yearly === 0) {
      // Free tier - could handle differently
      return;
    }

    if (currentTier?.id === tier.id) {
      // Already on this tier
      return;
    }

    setLoadingTierId(tier.id);

    try {
      // For demo, just show an alert since we need server action for Stripe
      alert(`Stripe checkout would open for ${tier.name} (${billingCycle})`);
    } finally {
      setLoadingTierId(null);
    }
  };

  // Sort tiers by level
  const sortedTiers = [...tiers].sort((a, b) => a.tier_level - b.tier_level);

  // Check if any tier has yearly pricing
  const hasYearlyPricing = tiers.some((t) => t.price_cents_yearly > 0);

  return (
    <div className="space-y-8">
      {/* Billing cycle toggle */}
      {hasYearlyPricing && (
        <div className="flex items-center justify-center gap-4">
          <Label
            htmlFor="billing-cycle"
            className={billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground"}
          >
            Monthly
          </Label>
          <Switch
            id="billing-cycle"
            checked={billingCycle === "yearly"}
            onCheckedChange={(checked) => setBillingCycle(checked ? "yearly" : "monthly")}
          />
          <Label
            htmlFor="billing-cycle"
            className={billingCycle === "yearly" ? "text-foreground" : "text-muted-foreground"}
          >
            Yearly
            <Badge variant="secondary" className="ml-2">
              Save up to {Math.max(...tiers.map((t) => calculateYearlySavings(t.price_cents_monthly, t.price_cents_yearly)))}%
            </Badge>
          </Label>
        </div>
      )}

      {/* Tier cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedTiers.map((tier) => {
          const isCurrentTier = currentTier?.id === tier.id;
          const isFree = tier.price_cents_monthly === 0 && tier.price_cents_yearly === 0;
          const isPopular = tier.tier_level === 1; // Typically the first paid tier
          const savings = calculateYearlySavings(tier.price_cents_monthly, tier.price_cents_yearly);

          return (
            <Card
              key={tier.id}
              className={`relative ${isPopular ? "border-primary shadow-lg" : ""} ${
                isCurrentTier ? "ring-2 ring-primary" : ""
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary">Most Popular</Badge>
                </div>
              )}

              {isCurrentTier && (
                <div className="absolute -top-3 right-4">
                  <Badge variant="outline">Current Plan</Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {tier.tier_level > 0 && <Crown className="h-5 w-5 text-primary" />}
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                </div>

                <div className="mt-4">
                  {isFree ? (
                    <div className="text-4xl font-bold">Free</div>
                  ) : (
                    <>
                      <div className="text-4xl font-bold">
                        {formatTierPrice(
                          tier.price_cents_monthly,
                          tier.price_cents_yearly,
                          billingCycle
                        )}
                      </div>
                      {billingCycle === "yearly" && savings > 0 && (
                        <p className="text-sm text-green-600 mt-1">
                          Save {savings}% vs monthly
                        </p>
                      )}
                    </>
                  )}
                </div>

                {tier.description && (
                  <CardDescription className="mt-3">
                    {tier.description}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="pb-6">
                <ul className="space-y-3">
                  {tier.tier_level === 0 && (
                    <>
                      <FeatureItem>Access to free content</FeatureItem>
                      <FeatureItem>Community feed access</FeatureItem>
                      <FeatureItem>Basic member profile</FeatureItem>
                    </>
                  )}
                  {tier.tier_level >= 1 && (
                    <>
                      <FeatureItem>Everything in Free</FeatureItem>
                      <FeatureItem>Premium programs access</FeatureItem>
                      <FeatureItem>Exclusive resources</FeatureItem>
                      <FeatureItem>Priority support</FeatureItem>
                    </>
                  )}
                  {tier.tier_level >= 2 && (
                    <>
                      <FeatureItem>Everything in lower tiers</FeatureItem>
                      <FeatureItem>VIP content access</FeatureItem>
                      <FeatureItem>1-on-1 coaching calls</FeatureItem>
                      <FeatureItem>Private community access</FeatureItem>
                    </>
                  )}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={isCurrentTier ? "outline" : isPopular ? "default" : "outline"}
                  disabled={isCurrentTier || loadingTierId === tier.id}
                  onClick={() => handleSelectTier(tier)}
                >
                  {loadingTierId === tier.id && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {isCurrentTier
                    ? "Current Plan"
                    : isFree
                    ? isLoggedIn
                      ? "Downgrade to Free"
                      : "Get Started"
                    : currentTier && currentTier.tier_level > tier.tier_level
                    ? "Downgrade"
                    : "Upgrade"}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* FAQ or additional info */}
      <div className="text-center text-sm text-muted-foreground mt-8">
        <p>All plans include a 30-day money-back guarantee.</p>
        <p className="mt-1">
          Questions? Contact support or check our{" "}
          <a href="#" className="text-primary hover:underline">
            FAQ
          </a>
          .
        </p>
      </div>
    </div>
  );
}

function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
      <span className="text-sm">{children}</span>
    </li>
  );
}
