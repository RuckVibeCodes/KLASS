"use client";

import { useState, useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, X } from "lucide-react";
import {
  setCommunityFeatureOverride,
  removeCommunityFeatureOverride,
} from "@/actions/feature-flags";
import type { FeatureFlag } from "@/lib/feature-flags";
import { useToast } from "@/hooks/use-toast";

interface Flag {
  key: string;
  enabled: boolean;
  description: string | null;
}

interface Override {
  id: string;
  feature_key: string;
  enabled: boolean;
}

interface CommunityFeatureOverridesProps {
  communityId: string;
  flags: Flag[];
  overrides: Override[];
}

export function CommunityFeatureOverrides({
  communityId,
  flags,
  overrides: initialOverrides,
}: CommunityFeatureOverridesProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [overrides, setOverrides] = useState(initialOverrides);

  const getOverride = (key: string) => overrides.find((o) => o.feature_key === key);

  const handleToggle = (flagKey: string, currentValue: boolean) => {
    const newValue = !currentValue;

    // Optimistically update
    setOverrides((prev) => {
      const existing = prev.find((o) => o.feature_key === flagKey);
      if (existing) {
        return prev.map((o) =>
          o.feature_key === flagKey ? { ...o, enabled: newValue } : o
        );
      }
      return [
        ...prev,
        { id: "temp", feature_key: flagKey, enabled: newValue },
      ];
    });

    startTransition(async () => {
      const result = await setCommunityFeatureOverride(
        communityId,
        flagKey as FeatureFlag,
        newValue
      );

      if (result.error) {
        // Revert on error
        setOverrides(initialOverrides);
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      } else {
        toast({
          variant: "success",
          title: "Override saved",
        });
      }
    });
  };

  const handleRemoveOverride = (flagKey: string) => {
    // Optimistically update
    setOverrides((prev) => prev.filter((o) => o.feature_key !== flagKey));

    startTransition(async () => {
      const result = await removeCommunityFeatureOverride(
        communityId,
        flagKey as FeatureFlag
      );

      if (result.error) {
        setOverrides(initialOverrides);
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      } else {
        toast({
          variant: "success",
          title: "Override removed",
          description: "Now using system default.",
        });
      }
    });
  };

  return (
    <div className="space-y-4">
      {flags.map((flag) => {
        const override = getOverride(flag.key);
        const effectiveValue = override ? override.enabled : flag.enabled;
        const hasOverride = !!override;

        return (
          <div
            key={flag.key}
            className="flex items-center justify-between py-3 border-b last:border-b-0"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium font-mono text-sm">
                  {flag.key}
                </span>
                {hasOverride ? (
                  <Badge variant="secondary" className="text-xs">
                    Override
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    Default: {flag.enabled ? "ON" : "OFF"}
                  </Badge>
                )}
              </div>
              {flag.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {flag.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {hasOverride && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleRemoveOverride(flag.key)}
                  disabled={isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <div className="flex items-center gap-2">
                {isPending && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
                <Switch
                  checked={effectiveValue}
                  onCheckedChange={() => handleToggle(flag.key, effectiveValue)}
                  disabled={isPending}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
