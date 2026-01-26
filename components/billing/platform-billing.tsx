"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  Check,
  Crown,
  Loader2,
  Calendar,
  AlertCircle,
  ExternalLink,
  Rocket,
  Zap,
  Star,
} from "lucide-react";
import { PLATFORM_PLANS } from "@/types/database";
import type {
  Community,
  PlatformSubscription,
  PlatformPlan,
} from "@/types/database";

interface PlatformBillingPageProps {
  communities: Community[];
  subscriptions: PlatformSubscription[];
}

export function PlatformBillingPage({
  communities,
  subscriptions,
}: PlatformBillingPageProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  // Find active subscription
  const activeSub = subscriptions.find(
    (s) => s.status === "active" || s.status === "trialing"
  );
  const activeCommunity = communities.find(
    (c) => c.id === activeSub?.community_id
  );

  const handleSelectPlan = async (plan: PlatformPlan) => {
    if (!communities[0]) {
      alert("Please create a community first.");
      return;
    }

    setLoadingPlan(plan);
    try {
      const res = await fetch("/api/stripe/platform-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          communityId: communities[0].id,
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to start checkout");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to start checkout");
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "platform" }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to open billing portal");
      }
    } catch (error) {
      console.error("Portal error:", error);
      alert("Failed to open billing portal");
    } finally {
      setPortalLoading(false);
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

  const planIcons: Record<PlatformPlan, React.ReactNode> = {
    diy: <Rocket className="h-6 w-6" />,
    done_with_you: <Zap className="h-6 w-6" />,
    done_for_you: <Star className="h-6 w-6" />,
  };

  return (
    <div className="space-y-8">
      {/* Current Subscription */}
      {activeSub && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                <CardTitle>Current Plan</CardTitle>
              </div>
              <Badge
                variant={activeSub.cancel_at_period_end ? "destructive" : "default"}
              >
                {activeSub.cancel_at_period_end ? "Canceling" : "Active"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">
                  {PLATFORM_PLANS[activeSub.plan].name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {PLATFORM_PLANS[activeSub.plan].description}
                </p>
                {activeCommunity && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Community: <strong>{activeCommunity.name}</strong>
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {PLATFORM_PLANS[activeSub.plan].price_display}
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid gap-3 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Next billing date</span>
                </div>
                <span>{formatDate(activeSub.current_period_end)}</span>
              </div>

              {activeSub.cancel_at_period_end && (
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>
                    Your plan will be canceled on{" "}
                    {formatDate(activeSub.current_period_end)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleManageBilling}
              disabled={portalLoading}
            >
              {portalLoading && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              <CreditCard className="h-4 w-4 mr-2" />
              Manage Billing
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Plan Selection */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          {activeSub ? "Change Plan" : "Choose Your Plan"}
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {(Object.entries(PLATFORM_PLANS) as [PlatformPlan, typeof PLATFORM_PLANS[PlatformPlan]][]).map(
            ([key, plan]) => {
              const isCurrentPlan = activeSub?.plan === key;
              const isPopular = key === "done_with_you";

              return (
                <Card
                  key={key}
                  className={`relative ${
                    isPopular ? "border-primary shadow-lg" : ""
                  } ${isCurrentPlan ? "ring-2 ring-primary" : ""}`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary">Most Popular</Badge>
                    </div>
                  )}

                  {isCurrentPlan && (
                    <div className="absolute -top-3 right-4">
                      <Badge variant="outline">Current</Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-4">
                    <div className="flex items-center justify-center gap-2 mb-2 text-primary">
                      {planIcons[key]}
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">
                        ${(plan.price_cents / 100).toFixed(0)}
                      </span>
                      <span className="text-muted-foreground">/mo</span>
                    </div>
                    <CardDescription className="mt-3">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pb-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter>
                    <Button
                      className="w-full"
                      variant={
                        isCurrentPlan
                          ? "outline"
                          : isPopular
                          ? "default"
                          : "outline"
                      }
                      disabled={isCurrentPlan || loadingPlan === key}
                      onClick={() => handleSelectPlan(key)}
                    >
                      {loadingPlan === key && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      {isCurrentPlan
                        ? "Current Plan"
                        : activeSub
                        ? "Switch Plan"
                        : "Get Started"}
                    </Button>
                  </CardFooter>
                </Card>
              );
            }
          )}
        </div>
      </div>

      {/* FAQ */}
      <Card>
        <CardContent className="py-6">
          <h3 className="font-semibold mb-3">Frequently Asked Questions</h3>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-medium">Can I switch plans anytime?</p>
              <p className="text-muted-foreground">
                Yes! You can upgrade or downgrade your plan at any time. Changes
                take effect immediately and are prorated.
              </p>
            </div>
            <div>
              <p className="font-medium">What happens if I cancel?</p>
              <p className="text-muted-foreground">
                Your community remains active until the end of your billing
                period. After that, it will be paused until you resubscribe.
              </p>
            </div>
            <div>
              <p className="font-medium">Is there a free trial?</p>
              <p className="text-muted-foreground">
                New communities get a 14-day free trial on any plan. No credit
                card required to start.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
