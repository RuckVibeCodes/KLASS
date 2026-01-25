"use client";

import { useState, useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { updateSystemFeatureFlag } from "@/actions/feature-flags";
import type { FeatureFlag } from "@/lib/feature-flags";
import { useToast } from "@/hooks/use-toast";

interface Flag {
  key: string;
  enabled: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface FeatureFlagsListProps {
  flags: Flag[];
}

export function FeatureFlagsList({ flags: initialFlags }: FeatureFlagsListProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [flags, setFlags] = useState(initialFlags);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const handleToggle = (flagKey: string, currentValue: boolean) => {
    const newValue = !currentValue;
    setPendingKey(flagKey);

    // Optimistically update
    setFlags((prev) =>
      prev.map((f) => (f.key === flagKey ? { ...f, enabled: newValue } : f))
    );

    startTransition(async () => {
      const result = await updateSystemFeatureFlag(
        flagKey as FeatureFlag,
        newValue
      );

      if (result.error) {
        // Revert on error
        setFlags(initialFlags);
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      } else {
        toast({
          variant: "success",
          title: "Flag updated",
          description: `${flagKey} is now ${newValue ? "ON" : "OFF"} by default.`,
        });
      }

      setPendingKey(null);
    });
  };

  return (
    <div className="space-y-4">
      {flags.map((flag) => (
        <div
          key={flag.key}
          className="flex items-center justify-between py-3 border-b last:border-b-0"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium font-mono text-sm">{flag.key}</span>
              <Badge variant={flag.enabled ? "default" : "secondary"}>
                {flag.enabled ? "ON" : "OFF"}
              </Badge>
            </div>
            {flag.description && (
              <p className="text-xs text-muted-foreground mt-1">
                {flag.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isPending && pendingKey === flag.key && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            <Switch
              checked={flag.enabled}
              onCheckedChange={() => handleToggle(flag.key, flag.enabled)}
              disabled={isPending}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
