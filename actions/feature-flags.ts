"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { requireMasterAdmin } from "@/lib/master-admin";
import { revalidatePath } from "next/cache";
import type { FeatureFlag } from "@/lib/feature-flags";

/**
 * Update a system-level feature flag (master admin only)
 */
export async function updateSystemFeatureFlag(
  featureKey: FeatureFlag,
  enabled: boolean
) {
  await requireMasterAdmin();

  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("feature_flags")
    .update({
      enabled,
      updated_at: new Date().toISOString(),
    })
    .eq("key", featureKey)
    .select()
    .single();

  if (error) {
    console.error("Failed to update feature flag:", error.message);
    return { error: "Failed to update feature flag" };
  }

  revalidatePath("/system-admin/feature-flags");

  return { data };
}

/**
 * Set a community feature override (master admin only)
 * Creates override if it doesn't exist, updates if it does
 */
export async function setCommunityFeatureOverride(
  communityId: string,
  featureKey: FeatureFlag,
  enabled: boolean
) {
  await requireMasterAdmin();

  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("community_feature_overrides")
    .upsert(
      {
        community_id: communityId,
        feature_key: featureKey,
        enabled,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "community_id,feature_key",
      }
    )
    .select()
    .single();

  if (error) {
    console.error("Failed to set community feature override:", error.message);
    return { error: "Failed to set community feature override" };
  }

  revalidatePath(`/system-admin/communities/${communityId}`);

  return { data };
}

/**
 * Remove a community feature override (reverts to system default)
 */
export async function removeCommunityFeatureOverride(
  communityId: string,
  featureKey: FeatureFlag
) {
  await requireMasterAdmin();

  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("community_feature_overrides")
    .delete()
    .eq("community_id", communityId)
    .eq("feature_key", featureKey);

  if (error) {
    console.error("Failed to remove community feature override:", error.message);
    return { error: "Failed to remove community feature override" };
  }

  revalidatePath(`/system-admin/communities/${communityId}`);

  return { success: true };
}

/**
 * Bulk set community feature overrides (for provisioning)
 */
export async function setBulkCommunityOverrides(
  communityId: string,
  overrides: Array<{ featureKey: FeatureFlag; enabled: boolean }>
) {
  await requireMasterAdmin();

  const supabase = await createAdminClient();

  const records = overrides.map((o) => ({
    community_id: communityId,
    feature_key: o.featureKey,
    enabled: o.enabled,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("community_feature_overrides")
    .upsert(records, {
      onConflict: "community_id,feature_key",
    });

  if (error) {
    console.error("Failed to set bulk community overrides:", error.message);
    return { error: "Failed to set bulk community overrides" };
  }

  revalidatePath(`/system-admin/communities/${communityId}`);

  return { success: true };
}
