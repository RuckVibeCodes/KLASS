import { createClient, createAdminClient } from "@/lib/supabase/server";

export type FeatureFlag =
  | "ai_enabled"
  | "dm_enabled"
  | "chat_enabled"
  | "affiliate_enabled"
  | "quizzes_enabled"
  | "events_enabled"
  | "resources_enabled";

/**
 * Check if a feature is enabled for a specific community
 * Uses community override first, then falls back to system default
 */
export async function isFeatureEnabled(
  communityId: string,
  featureKey: FeatureFlag
): Promise<boolean> {
  const supabase = await createClient();

  // Check for community override first
  const { data: override } = await supabase
    .from("community_feature_overrides")
    .select("enabled")
    .eq("community_id", communityId)
    .eq("feature_key", featureKey)
    .single();

  if (override) {
    return override.enabled;
  }

  // Fall back to system default
  const { data: flag } = await supabase
    .from("feature_flags")
    .select("enabled")
    .eq("key", featureKey)
    .single();

  // Return false if flag doesn't exist
  return flag?.enabled ?? false;
}

/**
 * Get all feature flags with their effective values for a community
 * Useful for UI that needs to show multiple flags at once
 */
export async function getEffectiveFeatureFlags(
  communityId: string
): Promise<Record<FeatureFlag, boolean>> {
  const supabase = await createClient();

  // Get all system defaults
  const { data: flags } = await supabase.from("feature_flags").select("*");

  // Get community overrides
  const { data: overrides } = await supabase
    .from("community_feature_overrides")
    .select("*")
    .eq("community_id", communityId);

  const overrideMap = new Map(
    (overrides || []).map((o) => [o.feature_key, o.enabled])
  );

  const result: Record<string, boolean> = {};

  for (const flag of flags || []) {
    // Override takes precedence, otherwise use system default
    result[flag.key] = overrideMap.has(flag.key)
      ? overrideMap.get(flag.key)!
      : flag.enabled;
  }

  return result as Record<FeatureFlag, boolean>;
}

/**
 * Get all system-level feature flags (for master admin)
 */
export async function getSystemFeatureFlags(): Promise<
  Array<{
    key: string;
    enabled: boolean;
    description: string | null;
    created_at: string;
    updated_at: string;
  }>
> {
  const supabase = await createAdminClient();

  const { data: flags, error } = await supabase
    .from("feature_flags")
    .select("*")
    .order("key");

  if (error) throw error;
  return flags || [];
}

/**
 * Get community feature overrides (for master admin or community admin)
 */
export async function getCommunityOverrides(
  communityId: string
): Promise<
  Array<{
    id: string;
    feature_key: string;
    enabled: boolean;
    created_at: string;
    updated_at: string;
  }>
> {
  const supabase = await createClient();

  const { data: overrides, error } = await supabase
    .from("community_feature_overrides")
    .select("*")
    .eq("community_id", communityId);

  if (error) throw error;
  return overrides || [];
}
