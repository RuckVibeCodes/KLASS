"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Crown,
  Calendar,
  CreditCard,
  ExternalLink,
  Loader2,
  AlertCircle,
  Check,
} from "lucide-react";
import { formatTierPrice } from "@/lib/access";
import type { MembershipTier, Subscription, BillingCycle } from "@/types/database";

interface SubscriptionCardProps {
  currentTier: MembershipTier | null;
  subscription: Subscription | null;
  allTiers: MembershipTier[];
  communitySlug: string;
  profileId: string;
}

export function SubscriptionCard({
  currentTier,
  subscription,
  allTiers,
  communitySlug,
  profileId,
}: SubscriptionCardProps) {
  const [loading, setLoading] = useState(false);

  const isFreeTier = !currentTier || currentTier.tier_level === 0;
  const hasActiveSubscription = subscription?.status === "active" || subscription?.status === "trialing";
  const willCancel = subscription?.cancel_at_period_end;

  const handleManageBilling = async () => {
    setLoading(true);
    try {
      // For demo, just show an alert
      alert("Stripe customer portal would open here");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              <CardTitle>Current Plan</CardTitle>
            </div>
            {willCancel && (
              <Badge variant="destructive">Canceling</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">
                {currentTier?.name || "Free"}
              </h3>
              {currentTier?.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {currentTier.description}
                </p>
              )}
            </div>
            {currentTier && !isFreeTier && (
              <div className="text-right">
                <div className="text-xl font-semibold">
                  {formatTierPrice(
                    currentTier.price_cents_monthly,
                    currentTier.price_cents_yearly,
                    (subscription?.billing_cycle as BillingCycle) || "monthly"
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {subscription?.billing_cycle === "yearly" ? "per year" : "per month"}
                </p>
              </div>
            )}
          </div>

          {hasActiveSubscription && subscription && (
            <>
              <Separator />
              <div className="grid gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Current period ends</span>
                  </div>
                  <span>{formatDate(subscription.current_period_end)}</span>
                </div>

                {willCancel && (
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>
                      Your plan will be canceled on{" "}
                      {formatDate(subscription.current_period_end)}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Plan features */}
          <div className="pt-4">
            <h4 className="text-sm font-medium mb-3">What&apos;s included:</h4>
            <ul className="space-y-2">
              {isFreeTier ? (
                <>
                  <FeatureItem>Access to free content</FeatureItem>
                  <FeatureItem>Community feed access</FeatureItem>
                  <FeatureItem>Basic member profile</FeatureItem>
                </>
              ) : (
                <>
                  <FeatureItem>All free tier benefits</FeatureItem>
                  <FeatureItem>Premium content access</FeatureItem>
                  <FeatureItem>Exclusive resources</FeatureItem>
                  <FeatureItem>Priority support</FeatureItem>
                </>
              )}
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          {hasActiveSubscription ? (
            <>
              <Button
                variant="outline"
                onClick={handleManageBilling}
                disabled={loading}
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <CreditCard className="h-4 w-4 mr-2" />
                Manage Billing
              </Button>
              <Link href={`/${communitySlug}/pricing`}>
                <Button variant="ghost">
                  Change Plan
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </>
          ) : (
            <Link href={`/${communitySlug}/pricing`}>
              <Button>
                <Crown className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Button>
            </Link>
          )}
        </CardFooter>
      </Card>

      {/* Available Upgrades */}
      {isFreeTier && allTiers.filter((t) => t.tier_level > 0).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upgrade Your Experience</CardTitle>
            <CardDescription>
              Unlock premium content and features with a paid plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allTiers
                .filter((t) => t.tier_level > 0)
                .slice(0, 2)
                .map((tier) => (
                  <div
                    key={tier.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{tier.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {tier.description || "Premium access"}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatTierPrice(tier.price_cents_monthly, tier.price_cents_yearly, "monthly")}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
          <CardFooter>
            <Link href={`/${communitySlug}/pricing`} className="w-full">
              <Button className="w-full">View All Plans</Button>
            </Link>
          </CardFooter>
        </Card>
      )}

      {/* Billing History Link */}
      {hasActiveSubscription && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Billing History</h4>
                <p className="text-sm text-muted-foreground">
                  View past invoices and payment history
                </p>
              </div>
              <Button variant="ghost" onClick={handleManageBilling}>
                View History
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
      <span>{children}</span>
    </li>
  );
}
