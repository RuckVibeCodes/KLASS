"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Crown } from "lucide-react";
import { formatTierPrice } from "@/lib/access";
import {
  getContentTierRequirement,
  setContentTierRequirement,
  removeContentTierRequirement,
} from "@/actions/tiers";
import type { MembershipTier, ContentType } from "@/types/database";

interface ContentTierSelectorProps {
  contentType: "program" | "resource" | "event";
  contentId: string;
  communitySlug: string;
  tiers: MembershipTier[];
  initialTierId?: string | null;
}

export function ContentTierSelector({
  contentType,
  contentId,
  communitySlug,
  tiers,
  initialTierId,
}: ContentTierSelectorProps) {
  const [selectedTierId, setSelectedTierId] = useState<string>("none");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial tier requirement on mount
  useEffect(() => {
    async function loadInitialTier() {
      // If we have an initialTierId passed in (for events), use that
      if (initialTierId) {
        setSelectedTierId(initialTierId);
        setLoading(false);
        return;
      }

      // For programs/resources, fetch from content_tier_requirements
      try {
        const result = await getContentTierRequirement(contentType, contentId);
        if (result.data?.min_tier_id) {
          setSelectedTierId(result.data.min_tier_id);
        }
      } catch {
        // No requirement found, keep "none"
      }
      setLoading(false);
    }
    loadInitialTier();
  }, [contentType, contentId, initialTierId]);

  const handleChange = async (value: string) => {
    const previousValue = selectedTierId;
    setSaving(true);
    setError(null);
    setSelectedTierId(value);

    try {
      if (value === "none") {
        // Remove tier requirement
        const result = await removeContentTierRequirement(
          contentType,
          contentId,
          communitySlug
        );
        if (result.error) {
          setError(result.error);
          setSelectedTierId(previousValue); // Revert
        }
      } else {
        // Set tier requirement
        const result = await setContentTierRequirement(
          contentType,
          contentId,
          value,
          communitySlug
        );
        if (result.error) {
          setError(result.error);
          setSelectedTierId(previousValue); // Revert
        }
      }
    } finally {
      setSaving(false);
    }
  };

  // Sort tiers by level (lower first)
  const sortedTiers = [...tiers].sort((a, b) => a.tier_level - b.tier_level);

  // Filter out free tiers (level 0) since gating to free makes no sense
  const paidTiers = sortedTiers.filter((t) => t.tier_level > 0);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading tier settings...
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Crown className="h-4 w-4 text-muted-foreground" />
        <Label>Tier Requirement</Label>
        {saving && <Loader2 className="h-3 w-3 animate-spin" />}
      </div>

      <Select value={selectedTierId} onValueChange={handleChange} disabled={saving}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select tier requirement" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">
            Available to all members
          </SelectItem>
          {paidTiers.map((tier) => (
            <SelectItem key={tier.id} value={tier.id}>
              <div className="flex items-center gap-2">
                <span>{tier.name}</span>
                <span className="text-muted-foreground">
                  ({formatTierPrice(tier.price_cents_monthly, tier.price_cents_yearly, "monthly")})
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <p className="text-xs text-muted-foreground">
        {selectedTierId === "none"
          ? "Any logged-in member can access this content."
          : "Members with this tier or higher will have access (cumulative)."}
      </p>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
