"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { DollarSign, Loader2, Users, Crown } from "lucide-react";
import { updateProgramPricing } from "@/actions/pricing";
import { AccessManagementDialog } from "./access-management-dialog";
import { ContentTierSelector } from "./content-tier-selector";
import { getCommunityTiers } from "@/actions/tiers";
import type { Program, MembershipTier } from "@/types/database";

interface ProgramPricingProps {
  program: Program;
  communitySlug: string;
}

export function ProgramPricing({ program, communitySlug }: ProgramPricingProps) {
  const [isPaid, setIsPaid] = useState((program.price_cents || 0) > 0);
  const [priceInput, setPriceInput] = useState(
    ((program.price_cents || 0) / 100).toString()
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showAccessDialog, setShowAccessDialog] = useState(false);
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [tiersLoading, setTiersLoading] = useState(true);

  // Load tiers on mount
  useEffect(() => {
    async function loadTiers() {
      const result = await getCommunityTiers(communitySlug);
      if (result.data) {
        setTiers(result.data);
      }
      setTiersLoading(false);
    }
    loadTiers();
  }, [communitySlug]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    const priceCents = isPaid ? Math.round(parseFloat(priceInput) * 100) : 0;

    if (isPaid && (isNaN(priceCents) || priceCents < 0)) {
      setError("Please enter a valid price");
      setSaving(false);
      return;
    }

    const result = await updateProgramPricing(program.id, communitySlug, priceCents);

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Program Pricing
          </CardTitle>
          <CardDescription>
            Set a price for this program. Paid members get access automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="paid-toggle" className="text-base font-medium">
                Paid Program
              </Label>
              <p className="text-sm text-muted-foreground">
                Require payment or paid membership to access
              </p>
            </div>
            <Switch
              id="paid-toggle"
              checked={isPaid}
              onCheckedChange={setIsPaid}
            />
          </div>

          {isPaid && (
            <div className="space-y-2">
              <Label htmlFor="price">Price (USD)</Label>
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
                  placeholder="49.00"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                One-time purchase. Paid tier members get access included.
              </p>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
          )}

          {success && (
            <div className="text-sm text-green-600 dark:text-green-400">
              Pricing updated successfully! Existing paid members have been grandfathered.
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Pricing
            </Button>

            {isPaid && (
              <Button
                variant="outline"
                onClick={() => setShowAccessDialog(true)}
              >
                <Users className="h-4 w-4 mr-2" />
                Manage Access
              </Button>
            )}
          </div>

          <Separator className="my-6" />

          {/* Tier-Based Access */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-muted-foreground" />
              <div>
                <h4 className="font-medium">Membership Tier Access</h4>
                <p className="text-sm text-muted-foreground">
                  Restrict this program to members with a specific tier or higher
                </p>
              </div>
            </div>

            {tiersLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading tiers...
              </div>
            ) : (
              <ContentTierSelector
                contentType="program"
                contentId={program.id}
                communitySlug={communitySlug}
                tiers={tiers}
              />
            )}
          </div>
        </CardContent>
      </Card>

      <AccessManagementDialog
        open={showAccessDialog}
        onOpenChange={setShowAccessDialog}
        contentType="program"
        contentId={program.id}
        contentTitle={program.title}
        communitySlug={communitySlug}
      />
    </>
  );
}
