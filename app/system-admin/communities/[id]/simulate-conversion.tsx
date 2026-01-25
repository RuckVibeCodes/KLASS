"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  simulateConversion,
  getMembersForConversionSimulation,
} from "@/actions/affiliates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Zap, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Referrer {
  id: string;
  display_name: string | null;
  email: string | null;
}

interface ProfileRaw {
  id: string;
  display_name: string | null;
  email: string | null;
  tier: string;
  referred_by_profile_id: string | null;
  referrer: Referrer[] | null;
}

interface Profile {
  id: string;
  display_name: string | null;
  email: string | null;
  tier: string;
  referred_by_profile_id: string | null;
  referrer: Referrer | null;
}

interface SimulateConversionProps {
  communityId: string;
}

export function SimulateConversion({ communityId }: SimulateConversionProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [amountDollars, setAmountDollars] = useState("99");

  useEffect(() => {
    async function loadProfiles() {
      const result = await getMembersForConversionSimulation(communityId);
      if (result.data) {
        // Convert referrer array to single object (Supabase returns arrays for relationships)
        const processed = (result.data as ProfileRaw[]).map((p) => ({
          ...p,
          referrer: p.referrer?.[0] || null,
        }));
        setProfiles(processed);
      }
      setIsLoading(false);
    }
    loadProfiles();
  }, [communityId]);

  const handleSimulate = () => {
    if (!selectedProfileId) return;

    const amountCents = Math.round(parseFloat(amountDollars) * 100);
    if (isNaN(amountCents) || amountCents <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Please enter a valid dollar amount",
      });
      return;
    }

    startTransition(async () => {
      const result = await simulateConversion(
        communityId,
        selectedProfileId,
        amountCents
      );

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Simulation failed",
          description: result.error,
        });
        return;
      }

      if (result.data?.noReferrer) {
        toast({
          variant: "destructive",
          title: "No referrer",
          description: "This member was not referred by anyone",
        });
        return;
      }

      if (result.data?.affiliateDisabled) {
        toast({
          variant: "destructive",
          title: "Affiliate disabled",
          description: "The affiliate program is not enabled for this community",
        });
        return;
      }

      if (result.data?.alreadyConverted) {
        toast({
          variant: "destructive",
          title: "Already converted",
          description: "This member already has a paid conversion event",
        });
        return;
      }

      toast({
        variant: "success",
        title: "Conversion simulated",
        description: `Commission of $${((result.data?.commissionCents || 0) / 100).toFixed(2)} credited to referrer`,
      });

      router.refresh();
    });
  };

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId);
  const referredProfiles = profiles.filter((p) => p.referred_by_profile_id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (referredProfiles.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        <p>No referred members in this community yet.</p>
        <p className="text-sm mt-1">
          Members need to join via a referral link first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="profile">Referred Member</Label>
        <Select value={selectedProfileId} onValueChange={setSelectedProfileId}>
          <SelectTrigger id="profile">
            <SelectValue placeholder="Select a referred member" />
          </SelectTrigger>
          <SelectContent>
            {referredProfiles.map((profile) => (
              <SelectItem key={profile.id} value={profile.id}>
                <div className="flex items-center gap-2">
                  <span>
                    {profile.display_name || profile.email || "Unknown"}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    referred by{" "}
                    {profile.referrer?.display_name ||
                      profile.referrer?.email ||
                      "Unknown"}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedProfile && selectedProfile.referrer && (
        <div className="text-sm p-3 bg-muted rounded-lg">
          <p className="font-medium">Referral Chain:</p>
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">
              {selectedProfile.referrer.display_name ||
                selectedProfile.referrer.email}
            </span>{" "}
            referred{" "}
            <span className="font-medium text-foreground">
              {selectedProfile.display_name || selectedProfile.email}
            </span>
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="amount">Payment Amount ($)</Label>
        <Input
          id="amount"
          type="number"
          min="1"
          step="0.01"
          value={amountDollars}
          onChange={(e) => setAmountDollars(e.target.value)}
          placeholder="99.00"
        />
        <p className="text-xs text-muted-foreground">
          Commission will be calculated based on the community's rate
        </p>
      </div>

      <Button
        onClick={handleSimulate}
        disabled={isPending || !selectedProfileId}
        className="w-full"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Zap className="h-4 w-4 mr-2" />
        )}
        Simulate Paid Conversion
      </Button>
    </div>
  );
}
