"use client";

import { useState, useEffect } from "react";
import { TierManager } from "./tier-manager";
import { getCommunityTiers } from "@/actions/tiers";
import { Loader2 } from "lucide-react";
import type { MembershipTier, Community } from "@/types/database";

interface TiersSettingsProps {
  community: Community | null;
  communitySlug: string;
}

export function TiersSettings({ community, communitySlug }: TiersSettingsProps) {
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTiers();
  }, [communitySlug]);

  const loadTiers = async () => {
    setLoading(true);
    setError(null);

    const result = await getCommunityTiers(communitySlug);

    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setTiers(result.data);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Failed to load tiers: {error}</p>
        <button
          onClick={loadTiers}
          className="text-primary hover:underline mt-2"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <TierManager tiers={tiers} communitySlug={communitySlug} />
  );
}
