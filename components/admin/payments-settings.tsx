"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CreditCard, ExternalLink, AlertCircle, Users, DollarSign, BookOpen, FileText, Loader2 } from "lucide-react";
import { updateCommunityPricing } from "@/actions/pricing";
import { isStripeConfigured } from "@/lib/stripe/products";
import type { Community } from "@/types/database";

interface PaymentsSettingsProps {
  community: Community;
  communitySlug: string;
}

export function PaymentsSettings({ community, communitySlug }: PaymentsSettingsProps) {
  const stripeConnected = isStripeConfigured();
  const [isPaidCommunity, setIsPaidCommunity] = useState(
    (community.membership_price_cents || 0) > 0
  );
  const [priceInput, setPriceInput] = useState(
    ((community.membership_price_cents || 0) / 100).toString()
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    const priceCents = isPaidCommunity ? Math.round(parseFloat(priceInput) * 100) : 0;

    if (isPaidCommunity && (isNaN(priceCents) || priceCents < 0)) {
      setError("Please enter a valid price");
      setSaving(false);
      return;
    }

    const result = await updateCommunityPricing(community.id, communitySlug, priceCents);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }

    setSaving(false);
  };

  return (
    <>
      {/* Stripe Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Stripe Integration
          </CardTitle>
          <CardDescription>
            Connect your Stripe account to accept payments for memberships and products
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Stripe Account</p>
                <p className="text-sm text-muted-foreground">
                  {stripeConnected
                    ? "Connected and ready to accept payments"
                    : "Not connected - running in demo mode"}
                </p>
              </div>
            </div>
            <Badge variant={stripeConnected ? "default" : "secondary"}>
              {stripeConnected ? "Connected" : "Demo Mode"}
            </Badge>
          </div>

          {!stripeConnected && (
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-800 dark:text-blue-200">
                  Demo Mode Active
                </p>
                <p className="text-blue-700 dark:text-blue-300 mt-1">
                  Pricing is fully functional but payments won&apos;t be processed.
                  Add STRIPE_SECRET_KEY to your environment to enable real payments.
                </p>
              </div>
            </div>
          )}

          <Button disabled className="w-full sm:w-auto">
            <ExternalLink className="h-4 w-4 mr-2" />
            {stripeConnected ? "Manage Stripe Account" : "Connect Stripe Account"}
          </Button>
        </CardContent>
      </Card>

      {/* Community Membership Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Community Membership Pricing
          </CardTitle>
          <CardDescription>
            Set a price for community access. Free members can browse, paid members get full access.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="paid-toggle" className="text-base font-medium">
                Paid Membership
              </Label>
              <p className="text-sm text-muted-foreground">
                Charge a one-time fee for community access
              </p>
            </div>
            <Switch
              id="paid-toggle"
              checked={isPaidCommunity}
              onCheckedChange={setIsPaidCommunity}
            />
          </div>

          {isPaidCommunity && (
            <div className="space-y-2">
              <Label htmlFor="price">Membership Price (USD)</Label>
              <div className="relative max-w-[200px]">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  className="pl-7"
                  placeholder="29.00"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                One-time payment for lifetime community access
              </p>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
          )}

          {success && (
            <div className="text-sm text-green-600 dark:text-green-400">
              Pricing updated successfully!
            </div>
          )}

          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Pricing
          </Button>
        </CardContent>
      </Card>

      {/* Content Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Content Pricing</CardTitle>
          <CardDescription>
            Set individual prices for programs and resources
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Programs</p>
                <p className="text-sm text-muted-foreground">
                  Set prices on individual programs
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/${communitySlug}/admin/content/programs`}>
                Manage
              </Link>
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Resources</p>
                <p className="text-sm text-muted-foreground">
                  Set prices on individual resources
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/${communitySlug}/admin/resources`}>
                Manage
              </Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            When you set a price on content, existing paid members are automatically grandfathered in.
          </p>
        </CardContent>
      </Card>

      {/* Manual Member Management */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Access Grants</CardTitle>
          <CardDescription>
            Grant or revoke access to paid content for individual members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            You can manually grant access to paid content from the Members page.
            This is useful for complimentary access, promotions, or handling offline payments.
          </p>
          <Button variant="outline" asChild>
            <Link href={`/${communitySlug}/admin/members`}>
              <Users className="h-4 w-4 mr-2" />
              Manage Members
            </Link>
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
