"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getAffiliateSettings, updateAffiliateSettings } from "@/actions/affiliates";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, Users, Percent } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Community } from "@/types/database";

interface AffiliateSettingsData {
  enabled: boolean;
  commission_rate: number;
  paid_only: boolean;
}

interface AffiliateSettingsProps {
  community: Community;
  communitySlug: string;
}

export function AffiliateSettings({ community, communitySlug }: AffiliateSettingsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  const [settings, setSettings] = useState<AffiliateSettingsData>({
    enabled: false,
    commission_rate: 20,
    paid_only: true,
  });

  // Load current settings
  useEffect(() => {
    async function loadSettings() {
      const result = await getAffiliateSettings(communitySlug);
      if (result.data) {
        setSettings({
          enabled: result.data.enabled,
          commission_rate: result.data.commission_rate,
          paid_only: result.data.paid_only,
        });
      }
      setIsLoading(false);
    }
    loadSettings();
  }, [communitySlug]);

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateAffiliateSettings(communitySlug, settings);

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
        return;
      }

      toast({
        variant: "success",
        title: "Affiliate settings saved",
        description: settings.enabled
          ? `Affiliate program enabled with ${settings.commission_rate}% commission.`
          : "Affiliate program has been disabled.",
      });

      router.refresh();
    });
  };

  const handleRateChange = (value: string) => {
    const rate = parseFloat(value);
    if (!isNaN(rate) && rate >= 0 && rate <= 100) {
      setSettings({ ...settings, commission_rate: rate });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Affiliate Program Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Affiliate Program
          </CardTitle>
          <CardDescription>
            Let your members earn commissions by referring new paid members
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="affiliate-enabled">Enable Affiliate Program</Label>
              <p className="text-sm text-muted-foreground">
                Members will see an Affiliate tab where they can get their referral link
              </p>
            </div>
            <Switch
              id="affiliate-enabled"
              checked={settings.enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enabled: checked })
              }
            />
          </div>

          {settings.enabled && (
            <>
              {/* Commission Rate */}
              <div className="space-y-2">
                <Label htmlFor="commission-rate" className="flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  Commission Rate
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="commission-rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={settings.commission_rate}
                    onChange={(e) => handleRateChange(e.target.value)}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Typical commission rates are between 10-40%. Members earn this percentage of each referred payment.
                </p>
              </div>

              {/* Paid Only Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="paid-only">Paid Conversions Only</Label>
                  <p className="text-sm text-muted-foreground">
                    Only pay commission when referred members make a payment
                  </p>
                </div>
                <Switch
                  id="paid-only"
                  checked={settings.paid_only}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, paid_only: checked })
                  }
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* How It Works */}
      {settings.enabled && (
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>
              Overview of the affiliate program for your members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                  1
                </div>
                <div>
                  <h4 className="font-medium">Get Referral Link</h4>
                  <p className="text-sm text-muted-foreground">
                    Each member gets a unique referral link from their Affiliate dashboard
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                  2
                </div>
                <div>
                  <h4 className="font-medium">Share With Friends</h4>
                  <p className="text-sm text-muted-foreground">
                    Members share their link on social media, email, or directly
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                  3
                </div>
                <div>
                  <h4 className="font-medium">Earn Commission</h4>
                  <p className="text-sm text-muted-foreground">
                    When someone joins through their link{settings.paid_only ? " and makes a payment" : ""}, they earn {settings.commission_rate}% commission
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Commission Preview */}
      {settings.enabled && (
        <Card>
          <CardHeader>
            <CardTitle>Commission Examples</CardTitle>
            <CardDescription>
              What affiliates would earn at {settings.commission_rate}% commission
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[29, 99, 299].map((price) => (
                <div key={price} className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">${price} sale</p>
                  <p className="text-lg font-semibold text-primary">
                    ${((price * settings.commission_rate) / 100).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">commission</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>
    </>
  );
}
