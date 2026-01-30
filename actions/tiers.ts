"use server";

import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import type { MembershipTier, BillingCycle } from "@/types/database";
import { isDemoSlug } from "@/lib/demo";

/**
 * Get all membership tiers for a community
 */
export async function getCommunityTiers(communitySlug: string) {
  const supabase = createAdminClient();

  // Get community
  const { data: community } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", communitySlug)
    .single();

  if (!community) return { error: "Community not found" };

  // Get all active tiers
  const { data: tiers, error } = await supabase
    .from("membership_tiers")
    .select("*")
    .eq("community_id", community.id)
    .eq("active", true)
    .order("tier_level", { ascending: true });

  if (error) {
    console.error("Failed to get tiers:", error.message);
    return { error: "Failed to get tiers" };
  }

  return { data: tiers as MembershipTier[] };
}

/**
 * Create a new membership tier
 */
export async function createTier(
  communitySlug: string,
  data: {
    name: string;
    slug: string;
    description?: string;
    price_cents_monthly: number;
    price_cents_yearly: number;
    tier_level: number;
    features?: Record<string, unknown>;
    is_default?: boolean;
  }
) {
  if (isDemoSlug(communitySlug)) return { data: { id: "demo-tier" } };

  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const supabase = createAdminClient();
  const adminSupabase = await createAdminClient();

  // Get community
  const { data: community } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", communitySlug)
    .single();

  if (!community) return { error: "Community not found" };

  // Verify admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("clerk_user_id", userId)
    .eq("community_id", community.id)
    .single();

  if (profile?.role !== "ADMIN") {
    return { error: "Admin access required" };
  }

  // If this tier is default, unset other defaults first
  if (data.is_default) {
    await adminSupabase
      .from("membership_tiers")
      .update({ is_default: false })
      .eq("community_id", community.id);
  }

  // Get max order_index
  const { data: maxOrder } = await supabase
    .from("membership_tiers")
    .select("order_index")
    .eq("community_id", community.id)
    .order("order_index", { ascending: false })
    .limit(1)
    .single();

  const order_index = (maxOrder?.order_index ?? -1) + 1;

  // Create tier
  const { data: tier, error } = await adminSupabase
    .from("membership_tiers")
    .insert({
      community_id: community.id,
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      price_cents_monthly: data.price_cents_monthly,
      price_cents_yearly: data.price_cents_yearly,
      tier_level: data.tier_level,
      features: data.features || {},
      is_default: data.is_default || false,
      order_index,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create tier:", error.message);
    return { error: "Failed to create tier" };
  }

  revalidatePath(`/${communitySlug}/admin/settings`);
  revalidatePath(`/${communitySlug}/pricing`);

  return { data: tier as MembershipTier };
}

/**
 * Update an existing membership tier
 */
export async function updateTier(
  tierId: string,
  communitySlug: string,
  data: Partial<{
    name: string;
    description: string | null;
    price_cents_monthly: number;
    price_cents_yearly: number;
    tier_level: number;
    features: Record<string, unknown>;
    is_default: boolean;
    active: boolean;
  }>
) {
  if (isDemoSlug(communitySlug)) return { data: { id: "demo-tier" } };

  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const supabase = createAdminClient();
  const adminSupabase = await createAdminClient();

  // Get community
  const { data: community } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", communitySlug)
    .single();

  if (!community) return { error: "Community not found" };

  // Verify admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("clerk_user_id", userId)
    .eq("community_id", community.id)
    .single();

  if (profile?.role !== "ADMIN") {
    return { error: "Admin access required" };
  }

  // Verify tier belongs to community
  const { data: existingTier } = await supabase
    .from("membership_tiers")
    .select("id, community_id")
    .eq("id", tierId)
    .single();

  if (!existingTier || existingTier.community_id !== community.id) {
    return { error: "Tier not found" };
  }

  // If setting this tier as default, unset others first
  if (data.is_default) {
    await adminSupabase
      .from("membership_tiers")
      .update({ is_default: false })
      .eq("community_id", community.id);
  }

  // Update tier
  const { data: tier, error } = await adminSupabase
    .from("membership_tiers")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", tierId)
    .select()
    .single();

  if (error) {
    console.error("Failed to update tier:", error.message);
    return { error: "Failed to update tier" };
  }

  revalidatePath(`/${communitySlug}/admin/settings`);
  revalidatePath(`/${communitySlug}/pricing`);

  return { data: tier as MembershipTier };
}

/**
 * Delete a membership tier (soft delete by setting active = false)
 * Members on this tier should be migrated first
 */
export async function deleteTier(tierId: string, communitySlug: string) {
  if (isDemoSlug(communitySlug)) return { success: true };

  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const supabase = createAdminClient();
  const adminSupabase = await createAdminClient();

  // Get community
  const { data: community } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", communitySlug)
    .single();

  if (!community) return { error: "Community not found" };

  // Verify admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("clerk_user_id", userId)
    .eq("community_id", community.id)
    .single();

  if (profile?.role !== "ADMIN") {
    return { error: "Admin access required" };
  }

  // Check if any members are on this tier
  const { count } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("membership_tier_id", tierId);

  if (count && count > 0) {
    return { error: `Cannot delete tier with ${count} active members. Migrate them first.` };
  }

  // Soft delete
  const { error } = await adminSupabase
    .from("membership_tiers")
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq("id", tierId);

  if (error) {
    console.error("Failed to delete tier:", error.message);
    return { error: "Failed to delete tier" };
  }

  revalidatePath(`/${communitySlug}/admin/settings`);
  revalidatePath(`/${communitySlug}/pricing`);

  return { data: { success: true } };
}

/**
 * Set the default tier for new members
 */
export async function setDefaultTier(tierId: string, communitySlug: string) {
  if (isDemoSlug(communitySlug)) return { success: true };

  return updateTier(tierId, communitySlug, { is_default: true });
}

/**
 * Reorder tiers
 */
export async function reorderTiers(
  communitySlug: string,
  tierOrders: { id: string; order_index: number }[]
) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const supabase = createAdminClient();
  const adminSupabase = await createAdminClient();

  // Get community
  const { data: community } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", communitySlug)
    .single();

  if (!community) return { error: "Community not found" };

  // Verify admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("clerk_user_id", userId)
    .eq("community_id", community.id)
    .single();

  if (profile?.role !== "ADMIN") {
    return { error: "Admin access required" };
  }

  // Update each tier's order
  for (const { id, order_index } of tierOrders) {
    await adminSupabase
      .from("membership_tiers")
      .update({ order_index })
      .eq("id", id)
      .eq("community_id", community.id);
  }

  revalidatePath(`/${communitySlug}/admin/settings`);
  revalidatePath(`/${communitySlug}/pricing`);

  return { data: { success: true } };
}

/**
 * Assign a member to a tier
 */
export async function assignMemberTier(
  profileId: string,
  tierId: string | null,
  communitySlug: string
) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const supabase = createAdminClient();
  const adminSupabase = await createAdminClient();

  // Get community
  const { data: community } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", communitySlug)
    .single();

  if (!community) return { error: "Community not found" };

  // Verify admin
  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("clerk_user_id", userId)
    .eq("community_id", community.id)
    .single();

  if (adminProfile?.role !== "ADMIN") {
    return { error: "Admin access required" };
  }

  // Verify target profile exists in community
  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("id, community_id")
    .eq("id", profileId)
    .single();

  if (!targetProfile || targetProfile.community_id !== community.id) {
    return { error: "Member not found" };
  }

  // If assigning to a tier, verify it exists in community
  if (tierId) {
    const { data: tier } = await supabase
      .from("membership_tiers")
      .select("id, community_id")
      .eq("id", tierId)
      .single();

    if (!tier || tier.community_id !== community.id) {
      return { error: "Tier not found" };
    }
  }

  // Update profile
  const { error } = await adminSupabase
    .from("profiles")
    .update({
      membership_tier_id: tierId,
      tier_changed_at: new Date().toISOString(),
    })
    .eq("id", profileId);

  if (error) {
    console.error("Failed to assign tier:", error.message);
    return { error: "Failed to assign tier" };
  }

  revalidatePath(`/${communitySlug}/admin/members`);

  return { data: { success: true } };
}

/**
 * Get content tier requirement
 */
export async function getContentTierRequirement(
  contentType: "program" | "resource" | "event",
  contentId: string
) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("content_tier_requirements")
    .select(`
      *,
      min_tier:membership_tiers(*)
    `)
    .eq("content_type", contentType)
    .eq("content_id", contentId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Failed to get tier requirement:", error.message);
    return { error: "Failed to get tier requirement" };
  }

  return { data: data || null };
}

/**
 * Set content tier requirement
 * For events, updates the min_tier_id column directly on the events table
 * For programs/resources, uses the content_tier_requirements table
 */
export async function setContentTierRequirement(
  contentType: "program" | "resource" | "event",
  contentId: string,
  minTierId: string,
  communitySlug: string
) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const supabase = createAdminClient();
  const adminSupabase = await createAdminClient();

  // Get community
  const { data: community } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", communitySlug)
    .single();

  if (!community) return { error: "Community not found" };

  // Verify admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("clerk_user_id", userId)
    .eq("community_id", community.id)
    .single();

  if (profile?.role !== "ADMIN") {
    return { error: "Admin access required" };
  }

  // Events have min_tier_id directly on the table
  if (contentType === "event") {
    const { error } = await adminSupabase
      .from("events")
      .update({ min_tier_id: minTierId })
      .eq("id", contentId)
      .eq("community_id", community.id);

    if (error) {
      console.error("Failed to set event tier requirement:", error.message);
      return { error: "Failed to set event tier requirement" };
    }

    revalidatePath(`/${communitySlug}/admin/content/events`);
    revalidatePath(`/${communitySlug}/events`);

    return { data: { success: true } };
  }

  // Programs/resources use the content_tier_requirements table
  const { data, error } = await adminSupabase
    .from("content_tier_requirements")
    .upsert(
      {
        content_type: contentType,
        content_id: contentId,
        min_tier_id: minTierId,
      },
      { onConflict: "content_type,content_id" }
    )
    .select()
    .single();

  if (error) {
    console.error("Failed to set tier requirement:", error.message);
    return { error: "Failed to set tier requirement" };
  }

  revalidatePath(`/${communitySlug}/admin/content`);

  return { data };
}

/**
 * Remove content tier requirement
 * For events, sets min_tier_id to null on the events table
 * For programs/resources, deletes from content_tier_requirements table
 */
export async function removeContentTierRequirement(
  contentType: "program" | "resource" | "event",
  contentId: string,
  communitySlug: string
) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const supabase = createAdminClient();
  const adminSupabase = await createAdminClient();

  // Get community
  const { data: community } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", communitySlug)
    .single();

  if (!community) return { error: "Community not found" };

  // Verify admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("clerk_user_id", userId)
    .eq("community_id", community.id)
    .single();

  if (profile?.role !== "ADMIN") {
    return { error: "Admin access required" };
  }

  // Events have min_tier_id directly on the table
  if (contentType === "event") {
    const { error } = await adminSupabase
      .from("events")
      .update({ min_tier_id: null })
      .eq("id", contentId)
      .eq("community_id", community.id);

    if (error) {
      console.error("Failed to remove event tier requirement:", error.message);
      return { error: "Failed to remove event tier requirement" };
    }

    revalidatePath(`/${communitySlug}/admin/content/events`);
    revalidatePath(`/${communitySlug}/events`);

    return { data: { success: true } };
  }

  // Programs/resources use the content_tier_requirements table
  const { error } = await adminSupabase
    .from("content_tier_requirements")
    .delete()
    .eq("content_type", contentType)
    .eq("content_id", contentId);

  if (error) {
    console.error("Failed to remove tier requirement:", error.message);
    return { error: "Failed to remove tier requirement" };
  }

  revalidatePath(`/${communitySlug}/admin/content`);

  return { data: { success: true } };
}
