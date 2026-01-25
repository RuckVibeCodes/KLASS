"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, GripVertical, Star, Trash2, Edit2, Loader2 } from "lucide-react";
import { formatTierPrice, calculateYearlySavings } from "@/lib/access";
import { deleteTier, setDefaultTier } from "@/actions/tiers";
import { TierEditorDialog } from "./tier-editor-dialog";
import type { MembershipTier } from "@/types/database";

interface TierManagerProps {
  tiers: MembershipTier[];
  communitySlug: string;
}

export function TierManager({ tiers, communitySlug }: TierManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingTier, setEditingTier] = useState<MembershipTier | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  const handleDelete = async (tierId: string) => {
    if (!confirm("Are you sure you want to delete this tier? This cannot be undone.")) {
      return;
    }

    setDeletingId(tierId);
    const result = await deleteTier(tierId, communitySlug);
    if (result.error) {
      alert(result.error);
    }
    setDeletingId(null);
  };

  const handleSetDefault = async (tierId: string) => {
    setSettingDefaultId(tierId);
    const result = await setDefaultTier(tierId, communitySlug);
    if (result.error) {
      alert(result.error);
    }
    setSettingDefaultId(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Membership Tiers</CardTitle>
              <CardDescription>
                Configure pricing tiers for your community
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Tier
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {tiers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No tiers configured yet.</p>
              <p className="text-sm">Create your first tier to set up pricing.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tiers.map((tier) => (
                <div
                  key={tier.id}
                  className="flex items-center gap-4 p-4 border rounded-lg bg-background hover:bg-muted/50 transition-colors"
                >
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{tier.name}</span>
                      {tier.is_default && (
                        <Badge variant="secondary">
                          <Star className="h-3 w-3 mr-1" />
                          Default
                        </Badge>
                      )}
                      <Badge variant="outline">Level {tier.tier_level}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span>
                        {formatTierPrice(tier.price_cents_monthly, tier.price_cents_yearly, "monthly")}
                      </span>
                      {tier.price_cents_yearly > 0 && (
                        <>
                          <span>|</span>
                          <span>
                            {formatTierPrice(tier.price_cents_monthly, tier.price_cents_yearly, "yearly")}
                            {tier.price_cents_monthly > 0 && (
                              <span className="text-green-600 ml-1">
                                (Save {calculateYearlySavings(tier.price_cents_monthly, tier.price_cents_yearly)}%)
                              </span>
                            )}
                          </span>
                        </>
                      )}
                    </div>
                    {tier.description && (
                      <p className="text-sm text-muted-foreground mt-1 truncate">
                        {tier.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {!tier.is_default && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefault(tier.id)}
                        disabled={settingDefaultId === tier.id}
                      >
                        {settingDefaultId === tier.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Star className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingTier(tier)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(tier.id)}
                      disabled={deletingId === tier.id || tier.is_default}
                      className="text-destructive hover:text-destructive"
                    >
                      {deletingId === tier.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <TierEditorDialog
        open={isCreating}
        onOpenChange={setIsCreating}
        communitySlug={communitySlug}
        existingTiers={tiers}
      />

      {editingTier && (
        <TierEditorDialog
          open={!!editingTier}
          onOpenChange={(open) => !open && setEditingTier(null)}
          tier={editingTier}
          communitySlug={communitySlug}
          existingTiers={tiers}
        />
      )}
    </>
  );
}
