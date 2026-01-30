import { cache } from "react";
import { createClient, createAdminClient } from "./server";
import type { Community, CommunityModule, Profile } from "@/types/database";
import { sendWelcomeEmail, isEmailAvailable } from "@/lib/email";

/**
 * Cached data fetching functions for improved navigation performance.
 *
 * React's cache() deduplicates requests within a single render tree,
 * so multiple components calling the same function will share the result.
 */

/**
 * Get community by slug (cached per request)
 */
export const getCommunityBySlug = cache(async (slug: string): Promise<Community | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("communities")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching community:", error);
    return null;
  }

  return data;
});

/**
 * Get community modules (cached per request)
 */
export const getCommunityModules = cache(async (communityId: string): Promise<CommunityModule[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("community_modules")
    .select("*")
    .eq("community_id", communityId)
    .order("order_index");

  return data || [];
});

/**
 * Get user profile for a community (cached per request)
 */
export const getProfileByClerkId = cache(async (
  clerkUserId: string,
  communityId: string
): Promise<Profile | null> => {
  // Use admin client to bypass RLS until Clerk-Supabase JWT integration is set up
  const { createAdminClient } = await import("./admin");
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("*, membership_tier:membership_tiers(*)")
    .eq("clerk_user_id", clerkUserId)
    .eq("community_id", communityId)
    .single();

  return data;
});

/**
 * Create a new profile (non-cached, side effect)
 */
export async function createProfile(
  clerkUserId: string,
  communityId: string,
  defaultTierId?: string | null
): Promise<Profile | null> {
  const adminSupabase = await createAdminClient();

  const insertData: {
    clerk_user_id: string;
    community_id: string;
    role: string;
    tier: string;
    membership_tier_id?: string;
  } = {
    clerk_user_id: clerkUserId,
    community_id: communityId,
    role: "FREE_MEMBER",
    tier: "FREE",
  };

  // Assign default tier if available
  if (defaultTierId) {
    insertData.membership_tier_id = defaultTierId;
  }

  const { data, error } = await adminSupabase
    .from("profiles")
    .insert(insertData)
    .select("*, membership_tier:membership_tiers(*)")
    .single();

  if (error) {
    console.error("Error creating profile:", error);
    return null;
  }

  // Send welcome email asynchronously (non-blocking)
  if (data && isEmailAvailable()) {
    // Look up community name for the email
    const { data: community } = await adminSupabase
      .from("communities")
      .select("name, slug, description")
      .eq("id", communityId)
      .single();

    if (community) {
      sendWelcomeEmail({
        memberName: data.display_name || "New Member",
        memberEmail: data.email || "",
        communityName: community.name,
        communitySlug: community.slug,
        communityDescription: community.description || undefined,
      }).catch((err) => {
        console.error("[Email] Welcome email failed:", err);
      });
    }
  }

  return data;
}

/**
 * Get default membership tier for a community
 */
export const getDefaultTier = cache(async (communityId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("membership_tiers")
    .select("id")
    .eq("community_id", communityId)
    .eq("is_default", true)
    .single();

  return data?.id || null;
});

/**
 * Get community stats in a single optimized query
 */
export const getCommunityStats = cache(async (communityId: string) => {
  const supabase = await createClient();

  // Run all count queries in parallel
  const [
    { count: totalMembers },
    { count: paidMembers },
    { count: totalPosts },
    { count: totalPrograms },
    { count: totalResources },
    { count: totalEvents },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("community_id", communityId),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("community_id", communityId)
      .eq("tier", "PAID"),
    supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("community_id", communityId),
    supabase
      .from("programs")
      .select("*", { count: "exact", head: true })
      .eq("community_id", communityId),
    supabase
      .from("resources")
      .select("*", { count: "exact", head: true })
      .eq("community_id", communityId),
    supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("community_id", communityId),
  ]);

  return {
    totalMembers: totalMembers || 0,
    paidMembers: paidMembers || 0,
    totalPosts: totalPosts || 0,
    totalPrograms: totalPrograms || 0,
    totalResources: totalResources || 0,
    totalEvents: totalEvents || 0,
  };
});

/**
 * Get recent members for a community
 */
export const getRecentMembers = cache(async (communityId: string, limit = 5) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("community_id", communityId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return data || [];
});
