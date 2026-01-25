"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { createTier, updateTier } from "@/actions/tiers";
import type { MembershipTier } from "@/types/database";

interface TierEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tier?: MembershipTier;
  communitySlug: string;
  existingTiers: MembershipTier[];
}

export function TierEditorDialog({
  open,
  onOpenChange,
  tier,
  communitySlug,
  existingTiers,
}: TierEditorDialogProps) {
  const isEditing = !!tier;

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [monthlyPrice, setMonthlyPrice] = useState("");
  const [yearlyPrice, setYearlyPrice] = useState("");
  const [tierLevel, setTierLevel] = useState("0");
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when dialog opens/closes or tier changes
  useEffect(() => {
    if (open) {
      if (tier) {
        setName(tier.name);
        setSlug(tier.slug);
        setDescription(tier.description || "");
        setMonthlyPrice((tier.price_cents_monthly / 100).toString());
        setYearlyPrice((tier.price_cents_yearly / 100).toString());
        setTierLevel(tier.tier_level.toString());
        setIsDefault(tier.is_default);
      } else {
        // Default values for new tier
        const maxLevel = Math.max(0, ...existingTiers.map((t) => t.tier_level));
        setName("");
        setSlug("");
        setDescription("");
        setMonthlyPrice("");
        setYearlyPrice("");
        setTierLevel((maxLevel + 1).toString());
        setIsDefault(existingTiers.length === 0);
      }
      setError(null);
    }
  }, [open, tier, existingTiers]);

  // Auto-generate slug from name
  useEffect(() => {
    if (!isEditing && name) {
      const newSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setSlug(newSlug);
    }
  }, [name, isEditing]);

  const handleSave = async () => {
    setError(null);

    // Validation
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (!slug.trim()) {
      setError("Slug is required");
      return;
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      setError("Slug can only contain lowercase letters, numbers, and hyphens");
      return;
    }

    // Check slug uniqueness
    const slugExists = existingTiers.some(
      (t) => t.slug === slug && t.id !== tier?.id
    );
    if (slugExists) {
      setError("A tier with this slug already exists");
      return;
    }

    const priceCentsMonthly = Math.round(parseFloat(monthlyPrice || "0") * 100);
    const priceCentsYearly = Math.round(parseFloat(yearlyPrice || "0") * 100);

    if (isNaN(priceCentsMonthly) || priceCentsMonthly < 0) {
      setError("Invalid monthly price");
      return;
    }

    if (isNaN(priceCentsYearly) || priceCentsYearly < 0) {
      setError("Invalid yearly price");
      return;
    }

    const level = parseInt(tierLevel, 10);
    if (isNaN(level) || level < 0) {
      setError("Invalid tier level");
      return;
    }

    setSaving(true);

    try {
      if (isEditing && tier) {
        const result = await updateTier(tier.id, communitySlug, {
          name,
          description: description || null,
          price_cents_monthly: priceCentsMonthly,
          price_cents_yearly: priceCentsYearly,
          tier_level: level,
          is_default: isDefault,
        });

        if (result.error) {
          setError(result.error);
          return;
        }
      } else {
        const result = await createTier(communitySlug, {
          name,
          slug,
          description: description || undefined,
          price_cents_monthly: priceCentsMonthly,
          price_cents_yearly: priceCentsYearly,
          tier_level: level,
          is_default: isDefault,
        });

        if (result.error) {
          setError(result.error);
          return;
        }
      }

      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Tier" : "Create New Tier"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the tier settings below."
              : "Create a new membership tier for your community."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Pro, Premium, Inner Circle"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g., pro, premium"
              disabled={isEditing}
            />
            <p className="text-xs text-muted-foreground">
              Used in URLs and code. Cannot be changed after creation.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what's included in this tier..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthlyPrice">Monthly Price (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="monthlyPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={monthlyPrice}
                  onChange={(e) => setMonthlyPrice(e.target.value)}
                  className="pl-7"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearlyPrice">Yearly Price (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="yearlyPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={yearlyPrice}
                  onChange={(e) => setYearlyPrice(e.target.value)}
                  className="pl-7"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tierLevel">Tier Level</Label>
            <Input
              id="tierLevel"
              type="number"
              min="0"
              value={tierLevel}
              onChange={(e) => setTierLevel(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Higher levels include access to all lower level content (cumulative access).
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="isDefault">Default Tier</Label>
              <p className="text-xs text-muted-foreground">
                New members are assigned this tier automatically
              </p>
            </div>
            <Switch
              id="isDefault"
              checked={isDefault}
              onCheckedChange={setIsDefault}
            />
          </div>

          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEditing ? "Save Changes" : "Create Tier"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
