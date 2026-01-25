import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile, ContentType, ContentVisibility, MembershipTier } from "@/types/database";

export type AccessReason =
  | "public"
  | "member"
  | "admin"
  | "tier_included"      // User's tier includes this content
  | "paid_tier"          // Legacy: User has PAID tier (for backwards compat)
  | "purchased"          // One-time purchase
  | "granted"            // Manual grant
  | "tier_required"      // Needs higher tier
  | "purchase_required"  // Needs one-time purchase
  | "locked";

export interface AccessCheckResult {
  hasAccess: boolean;
  reason: AccessReason;
  requiredTier?: MembershipTier;
}

/**
 * Check if a user has access to specific content
 *
 * Access is granted if ANY of these are true:
 * 1. Content is public (visibility = 'public')
 * 2. User is logged in and content is members-only (visibility = 'members')
 * 3. User is ADMIN
 * 4. User's membership tier meets the content's tier requirement (cumulative)
 * 5. User has PAID tier (legacy fallback for backwards compat)
 * 6. User has explicit access grant for this content
 * 7. Content is free (price_cents = 0) with no tier requirement
 */
export async function checkContentAccess(
  supabase: SupabaseClient,
  profile: Profile | null,
  contentType: ContentType,
  contentId: string,
  content: {
    visibility: ContentVisibility;
    price_cents: number;
    min_tier_id?: string | null;
  }
): Promise<AccessCheckResult> {
  // Public content is always accessible
  if (content.visibility === "public") {
    return { hasAccess: true, reason: "public" };
  }

  // Not logged in - no access to non-public content
  if (!profile) {
    return { hasAccess: false, reason: "locked" };
  }

  // Admin always has access
  if (profile.role === "ADMIN") {
    return { hasAccess: true, reason: "admin" };
  }

  // Members-only content - any logged in member has access
  if (content.visibility === "members") {
    return { hasAccess: true, reason: "member" };
  }

  // Check tier-based access if content has a tier requirement
  if (content.min_tier_id && profile.membership_tier_id) {
    const [requiredTierResult, userTierResult] = await Promise.all([
      supabase
        .from("membership_tiers")
        .select("*")
        .eq("id", content.min_tier_id)
        .single(),
      supabase
        .from("membership_tiers")
        .select("*")
        .eq("id", profile.membership_tier_id)
        .single(),
    ]);

    const requiredTier = requiredTierResult.data as MembershipTier | null;
    const userTier = userTierResult.data as MembershipTier | null;

    if (requiredTier && userTier) {
      // Cumulative access: higher tier_level includes lower tier content
      if (userTier.tier_level >= requiredTier.tier_level) {
        return { hasAccess: true, reason: "tier_included" };
      }
      // User's tier is too low - return the required tier for upgrade prompt
      return {
        hasAccess: false,
        reason: "tier_required",
        requiredTier,
      };
    }
  }

  // Check for tier requirement without user having a tier
  if (content.min_tier_id && !profile.membership_tier_id) {
    const { data: requiredTier } = await supabase
      .from("membership_tiers")
      .select("*")
      .eq("id", content.min_tier_id)
      .single();

    if (requiredTier) {
      return {
        hasAccess: false,
        reason: "tier_required",
        requiredTier: requiredTier as MembershipTier,
      };
    }
  }

  // Legacy: Paid content (visibility = 'paid')
  // Check if user has PAID tier (old system) or new membership tier
  if (content.visibility === "paid") {
    // Free paid-tier content - requires any paid status
    if (content.price_cents === 0) {
      if (profile.tier === "PAID") {
        return { hasAccess: true, reason: "paid_tier" };
      }
      // Check if user has any non-free membership tier
      if (profile.membership_tier_id) {
        const { data: userTier } = await supabase
          .from("membership_tiers")
          .select("tier_level")
          .eq("id", profile.membership_tier_id)
          .single();

        if (userTier && userTier.tier_level > 0) {
          return { hasAccess: true, reason: "tier_included" };
        }
      }
      return { hasAccess: false, reason: "locked" };
    }

    // Priced content - check for PAID tier
    if (profile.tier === "PAID") {
      return { hasAccess: true, reason: "paid_tier" };
    }

    // Check if user has any non-free membership tier
    if (profile.membership_tier_id) {
      const { data: userTier } = await supabase
        .from("membership_tiers")
        .select("tier_level")
        .eq("id", profile.membership_tier_id)
        .single();

      if (userTier && userTier.tier_level > 0) {
        return { hasAccess: true, reason: "tier_included" };
      }
    }
  }

  // Check for explicit access grant
  const { data: grant } = await supabase
    .from("content_access_grants")
    .select("id, source")
    .eq("profile_id", profile.id)
    .eq("content_type", contentType)
    .eq("content_id", contentId)
    .is("revoked_at", null)
    .single();

  if (grant) {
    return {
      hasAccess: true,
      reason: grant.source === "purchase" ? "purchased" : "granted",
    };
  }

  // Determine why locked
  if (content.price_cents > 0) {
    return { hasAccess: false, reason: "purchase_required" };
  }

  // No access
  return { hasAccess: false, reason: "locked" };
}

/**
 * Helper to format price for display
 */
export function formatPrice(priceCents: number): string {
  if (priceCents === 0) return "Free";
  const dollars = priceCents / 100;
  return `$${dollars.toFixed(dollars % 1 === 0 ? 0 : 2)}`;
}

/**
 * Format tier price with billing cycle
 */
export function formatTierPrice(
  priceCentsMonthly: number,
  priceCentsYearly: number,
  cycle: "monthly" | "yearly" = "monthly"
): string {
  if (priceCentsMonthly === 0 && priceCentsYearly === 0) return "Free";

  const price = cycle === "monthly" ? priceCentsMonthly : priceCentsYearly;
  const dollars = price / 100;
  const suffix = cycle === "monthly" ? "/mo" : "/yr";

  return `$${dollars.toFixed(dollars % 1 === 0 ? 0 : 2)}${suffix}`;
}

/**
 * Calculate savings percentage for yearly vs monthly
 */
export function calculateYearlySavings(
  monthlyPriceCents: number,
  yearlyPriceCents: number
): number {
  if (monthlyPriceCents === 0) return 0;
  const yearlyIfMonthly = monthlyPriceCents * 12;
  const savings = ((yearlyIfMonthly - yearlyPriceCents) / yearlyIfMonthly) * 100;
  return Math.round(savings);
}

/**
 * Get access status text for display
 */
export function getAccessStatusText(reason: AccessReason): string {
  switch (reason) {
    case "public":
      return "Public";
    case "member":
      return "Members only";
    case "admin":
      return "Admin access";
    case "tier_included":
      return "Included with your plan";
    case "paid_tier":
      return "Included with membership";
    case "purchased":
      return "Purchased";
    case "granted":
      return "Access granted";
    case "tier_required":
      return "Upgrade required";
    case "purchase_required":
      return "Requires purchase";
    case "locked":
      return "Locked";
    default:
      return "Unknown";
  }
}

/**
 * Check if user can access based on tier level
 * Simple comparison without DB query (for when tiers are already loaded)
 */
export function hasMinimumTierAccess(
  userTierLevel: number,
  requiredTierLevel: number
): boolean {
  return userTierLevel >= requiredTierLevel;
}
