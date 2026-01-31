/**
 * AI Usage Tracking for KLASS
 * 
 * Tracks token usage per community and enforces tier-based limits.
 * 
 * Features:
 * - lesson_outline: Generate lesson outlines
 * - onboarding: Generate welcome content
 * - chatbot: Member chatbot (RAG)
 * - assistant: Creator assistant
 * - image_gen: Thumbnail generation
 */

import { createAdminClient } from "@/lib/supabase/server";

// ============================================
// Types
// ============================================

export type AIFeature = 
  | "lesson_outline" 
  | "onboarding" 
  | "chatbot" 
  | "assistant" 
  | "image_gen";

export type AITier = "free" | "pro" | "enterprise";

export interface TierLimits {
  tier_key: AITier;
  display_name: string;
  monthly_tokens: number;
  features: Record<AIFeature, boolean>;
}

export interface UsageRecord {
  community_id: string;
  feature: AIFeature;
  tokens_input: number;
  tokens_output: number;
  cost_cents?: number;
  user_id?: string;
  metadata?: Record<string, unknown>;
}

export interface MonthlyUsage {
  total_tokens: number;
  tokens_by_feature: Record<AIFeature, number>;
  limit: number;
  remaining: number;
  percentage_used: number;
}

// ============================================
// Constants
// ============================================

// Approximate cost per 1M tokens (for tracking, not billing)
const COST_PER_MILLION_TOKENS = {
  "claude-sonnet-4-20250514": { input: 300, output: 1500 }, // $3/$15 per 1M
  "gemini-2.0-flash-exp": { input: 0, output: 0 }, // Free tier
};

// ============================================
// Check Permissions
// ============================================

/**
 * Check if a community can use a specific AI feature
 * Returns { allowed: boolean, reason?: string }
 */
export async function canUseAIFeature(
  communityId: string,
  feature: AIFeature
): Promise<{ allowed: boolean; reason?: string; usage?: MonthlyUsage }> {
  const supabase = await createAdminClient();

  // Get community's AI tier
  const { data: community, error: communityError } = await supabase
    .from("communities")
    .select("ai_tier")
    .eq("id", communityId)
    .single();

  if (communityError || !community) {
    return { allowed: false, reason: "Community not found" };
  }

  const tier = community.ai_tier || "free";

  // Get tier limits
  const { data: tierLimits, error: tierError } = await supabase
    .from("ai_tier_limits")
    .select("*")
    .eq("tier_key", tier)
    .single();

  if (tierError || !tierLimits) {
    return { allowed: false, reason: "Invalid tier configuration" };
  }

  // Check if feature is enabled for this tier
  const features = tierLimits.features as Record<AIFeature, boolean>;
  if (!features[feature]) {
    return { 
      allowed: false, 
      reason: `${feature} is not available on the ${tierLimits.display_name} plan. Upgrade to Pro to unlock this feature.` 
    };
  }

  // If unlimited, allow
  if (tierLimits.monthly_tokens === 0) {
    return { allowed: true };
  }

  // Check current usage
  const usage = await getMonthlyUsage(communityId);
  
  if (usage.total_tokens >= tierLimits.monthly_tokens) {
    return { 
      allowed: false, 
      reason: `Monthly AI token limit reached (${usage.total_tokens.toLocaleString()} / ${tierLimits.monthly_tokens.toLocaleString()}). Upgrade your plan for more.`,
      usage
    };
  }

  return { allowed: true, usage };
}

// ============================================
// Track Usage
// ============================================

/**
 * Record AI usage for a community
 */
export async function trackAIUsage(record: UsageRecord): Promise<void> {
  const supabase = await createAdminClient();

  // Calculate estimated cost
  const model = (record.metadata?.model as string) || "claude-sonnet-4-20250514";
  const costConfig = COST_PER_MILLION_TOKENS[model as keyof typeof COST_PER_MILLION_TOKENS] 
    || COST_PER_MILLION_TOKENS["claude-sonnet-4-20250514"];
  
  const costCents = Math.ceil(
    (record.tokens_input * costConfig.input + record.tokens_output * costConfig.output) / 1_000_000
  );

  const { error } = await supabase.from("ai_usage").insert({
    community_id: record.community_id,
    feature: record.feature,
    tokens_input: record.tokens_input,
    tokens_output: record.tokens_output,
    cost_cents: costCents,
    user_id: record.user_id,
    metadata: record.metadata || {},
  });

  if (error) {
    console.error("Failed to track AI usage:", error);
    // Don't throw - usage tracking shouldn't break the feature
  }
}

// ============================================
// Get Usage Stats
// ============================================

/**
 * Get monthly AI usage for a community
 */
export async function getMonthlyUsage(communityId: string): Promise<MonthlyUsage> {
  const supabase = await createAdminClient();

  // Get current month's usage
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: usageData, error } = await supabase
    .from("ai_usage")
    .select("feature, tokens_input, tokens_output")
    .eq("community_id", communityId)
    .gte("created_at", startOfMonth.toISOString());

  if (error) {
    console.error("Failed to get AI usage:", error);
    return {
      total_tokens: 0,
      tokens_by_feature: {} as Record<AIFeature, number>,
      limit: 10000,
      remaining: 10000,
      percentage_used: 0,
    };
  }

  // Aggregate by feature
  const tokensByFeature: Record<string, number> = {};
  let totalTokens = 0;

  for (const record of usageData || []) {
    const tokens = (record.tokens_input || 0) + (record.tokens_output || 0);
    totalTokens += tokens;
    tokensByFeature[record.feature] = (tokensByFeature[record.feature] || 0) + tokens;
  }

  // Get tier limit
  const { data: community } = await supabase
    .from("communities")
    .select("ai_tier")
    .eq("id", communityId)
    .single();

  const tier = community?.ai_tier || "free";

  const { data: tierLimits } = await supabase
    .from("ai_tier_limits")
    .select("monthly_tokens")
    .eq("tier_key", tier)
    .single();

  const limit = tierLimits?.monthly_tokens || 10000;
  const remaining = Math.max(0, limit - totalTokens);
  const percentageUsed = limit > 0 ? (totalTokens / limit) * 100 : 0;

  return {
    total_tokens: totalTokens,
    tokens_by_feature: tokensByFeature as Record<AIFeature, number>,
    limit,
    remaining,
    percentage_used: Math.round(percentageUsed * 10) / 10,
  };
}

/**
 * Get AI usage history for a community (for admin dashboard)
 */
export async function getUsageHistory(
  communityId: string,
  days: number = 30
): Promise<Array<{
  date: string;
  feature: AIFeature;
  tokens: number;
  cost_cents: number;
}>> {
  const supabase = await createAdminClient();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from("ai_usage")
    .select("created_at, feature, tokens_input, tokens_output, cost_cents")
    .eq("community_id", communityId)
    .gte("created_at", startDate.toISOString())
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to get usage history:", error);
    return [];
  }

  return (data || []).map((record) => ({
    date: record.created_at,
    feature: record.feature as AIFeature,
    tokens: (record.tokens_input || 0) + (record.tokens_output || 0),
    cost_cents: record.cost_cents || 0,
  }));
}

// ============================================
// Tier Management
// ============================================

/**
 * Get all available AI tiers
 */
export async function getAITiers(): Promise<TierLimits[]> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("ai_tier_limits")
    .select("*")
    .order("monthly_tokens", { ascending: true });

  if (error) {
    console.error("Failed to get AI tiers:", error);
    return [];
  }

  return (data || []).map((tier) => ({
    tier_key: tier.tier_key as AITier,
    display_name: tier.display_name,
    monthly_tokens: tier.monthly_tokens,
    features: tier.features as Record<AIFeature, boolean>,
  }));
}

/**
 * Get a community's current AI tier
 */
export async function getCommunityAITier(communityId: string): Promise<TierLimits | null> {
  const supabase = await createAdminClient();

  const { data: community } = await supabase
    .from("communities")
    .select("ai_tier")
    .eq("id", communityId)
    .single();

  const tier = community?.ai_tier || "free";

  const { data: tierLimits } = await supabase
    .from("ai_tier_limits")
    .select("*")
    .eq("tier_key", tier)
    .single();

  if (!tierLimits) return null;

  return {
    tier_key: tierLimits.tier_key as AITier,
    display_name: tierLimits.display_name,
    monthly_tokens: tierLimits.monthly_tokens,
    features: tierLimits.features as Record<AIFeature, boolean>,
  };
}

/**
 * Update a community's AI tier (admin only)
 */
export async function updateCommunityAITier(
  communityId: string,
  tier: AITier
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("communities")
    .update({ ai_tier: tier })
    .eq("id", communityId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
