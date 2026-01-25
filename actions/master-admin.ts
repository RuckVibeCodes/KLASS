"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { requireMasterAdmin } from "@/lib/master-admin";
import { revalidatePath } from "next/cache";
import { COMMUNITY_TEMPLATE, PLAN_FEATURE_OVERRIDES, type PlanTier } from "@/lib/community-template";
import { setBulkCommunityOverrides } from "./feature-flags";

export type CommunityStatus = "active" | "paused" | "suspended";
export type BillingStatus = "active" | "past_due" | "canceled" | "trialing";

/**
 * List all communities with member counts and status
 */
export async function listCommunities(filters?: {
  status?: CommunityStatus;
  search?: string;
}) {
  await requireMasterAdmin();

  const supabase = await createAdminClient();

  let query = supabase
    .from("communities")
    .select(
      `
      *,
      profiles:profiles(count),
      programs:programs(count),
      posts:posts(count)
    `
    )
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,slug.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to list communities:", error);
    return { error: error.message };
  }

  // Transform the count results
  const communities = (data || []).map((c) => ({
    ...c,
    member_count: (c.profiles as unknown as { count: number }[])?.[0]?.count ?? 0,
    program_count: (c.programs as unknown as { count: number }[])?.[0]?.count ?? 0,
    post_count: (c.posts as unknown as { count: number }[])?.[0]?.count ?? 0,
  }));

  return { data: communities };
}

/**
 * Get detailed community info for master admin view
 */
export async function getCommunityDetails(communityId: string) {
  await requireMasterAdmin();

  const supabase = await createAdminClient();

  // Get community with creator info
  const { data: community, error: communityError } = await supabase
    .from("communities")
    .select("*")
    .eq("id", communityId)
    .single();

  if (communityError) {
    console.error("Failed to get community:", communityError);
    return { error: communityError.message };
  }

  // Get admins
  const { data: admins } = await supabase
    .from("profiles")
    .select("id, display_name, email, clerk_user_id")
    .eq("community_id", communityId)
    .eq("role", "ADMIN");

  // Get feature overrides
  const { data: overrides } = await supabase
    .from("community_feature_overrides")
    .select("*")
    .eq("community_id", communityId);

  // Get counts
  const { count: memberCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("community_id", communityId);

  const { count: programCount } = await supabase
    .from("programs")
    .select("*", { count: "exact", head: true })
    .eq("community_id", communityId);

  const { count: postCount } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("community_id", communityId);

  return {
    data: {
      ...community,
      admins: admins || [],
      feature_overrides: overrides || [],
      member_count: memberCount || 0,
      program_count: programCount || 0,
      post_count: postCount || 0,
    },
  };
}

/**
 * Pause a community (show maintenance page to members)
 */
export async function pauseCommunity(communityId: string) {
  await requireMasterAdmin();

  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("communities")
    .update({ status: "paused" })
    .eq("id", communityId)
    .select()
    .single();

  if (error) {
    console.error("Failed to pause community:", error);
    return { error: error.message };
  }

  revalidatePath("/system-admin/communities");
  revalidatePath(`/system-admin/communities/${communityId}`);

  return { data };
}

/**
 * Reactivate a paused community
 */
export async function reactivateCommunity(communityId: string) {
  await requireMasterAdmin();

  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("communities")
    .update({ status: "active" })
    .eq("id", communityId)
    .select()
    .single();

  if (error) {
    console.error("Failed to reactivate community:", error);
    return { error: error.message };
  }

  revalidatePath("/system-admin/communities");
  revalidatePath(`/system-admin/communities/${communityId}`);

  return { data };
}

/**
 * Suspend a community (more severe than pause)
 */
export async function suspendCommunity(communityId: string) {
  await requireMasterAdmin();

  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("communities")
    .update({ status: "suspended" })
    .eq("id", communityId)
    .select()
    .single();

  if (error) {
    console.error("Failed to suspend community:", error);
    return { error: error.message };
  }

  revalidatePath("/system-admin/communities");
  revalidatePath(`/system-admin/communities/${communityId}`);

  return { data };
}

/**
 * Update community billing status
 */
export async function updateBillingStatus(
  communityId: string,
  billingStatus: BillingStatus
) {
  await requireMasterAdmin();

  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("communities")
    .update({ billing_status: billingStatus })
    .eq("id", communityId)
    .select()
    .single();

  if (error) {
    console.error("Failed to update billing status:", error);
    return { error: error.message };
  }

  revalidatePath("/system-admin/communities");
  revalidatePath(`/system-admin/communities/${communityId}`);

  return { data };
}

/**
 * Get platform-wide stats for master admin dashboard
 */
export async function getPlatformStats() {
  await requireMasterAdmin();

  const supabase = await createAdminClient();

  const { count: totalCommunities } = await supabase
    .from("communities")
    .select("*", { count: "exact", head: true });

  const { count: activeCommunities } = await supabase
    .from("communities")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  const { count: totalMembers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: totalPrograms } = await supabase
    .from("programs")
    .select("*", { count: "exact", head: true });

  const { count: totalPosts } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true });

  return {
    data: {
      total_communities: totalCommunities || 0,
      active_communities: activeCommunities || 0,
      total_members: totalMembers || 0,
      total_programs: totalPrograms || 0,
      total_posts: totalPosts || 0,
    },
  };
}

/**
 * Provision a new community with template defaults
 */
export async function provisionCommunity(data: {
  name: string;
  slug: string;
  creatorClerkId: string;
  creatorEmail: string;
  plan: PlanTier;
}) {
  const masterAdminId = await requireMasterAdmin();

  const supabase = await createAdminClient();

  // 1. Validate slug uniqueness
  const { data: existing } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", data.slug)
    .single();

  if (existing) {
    return { error: "A community with this slug already exists" };
  }

  // 2. Create community record
  const { data: community, error: communityError } = await supabase
    .from("communities")
    .insert({
      name: data.name,
      slug: data.slug,
      status: "active",
      billing_status: "trialing",
      created_by_clerk_id: masterAdminId,
      settings_json: COMMUNITY_TEMPLATE.settings,
    })
    .select()
    .single();

  if (communityError) {
    console.error("Failed to create community:", communityError);
    return { error: communityError.message };
  }

  // 3. Create modules from template
  const moduleRecords = COMMUNITY_TEMPLATE.modules.map((m) => ({
    community_id: community.id,
    key: m.key,
    label: m.label,
    enabled: m.enabled,
    order_index: m.order,
  }));

  const { error: modulesError } = await supabase
    .from("community_modules")
    .insert(moduleRecords);

  if (modulesError) {
    console.error("Failed to create modules:", modulesError);
    // Clean up community on failure
    await supabase.from("communities").delete().eq("id", community.id);
    return { error: modulesError.message };
  }

  // 4. Create creator profile as ADMIN
  const { error: profileError } = await supabase.from("profiles").insert({
    clerk_user_id: data.creatorClerkId,
    community_id: community.id,
    email: data.creatorEmail,
    role: "ADMIN",
    tier: "PAID",
  });

  if (profileError) {
    console.error("Failed to create admin profile:", profileError);
    // Clean up on failure
    await supabase.from("community_modules").delete().eq("community_id", community.id);
    await supabase.from("communities").delete().eq("id", community.id);
    return { error: profileError.message };
  }

  // 5. Set feature overrides based on plan
  const overrides = PLAN_FEATURE_OVERRIDES[data.plan];
  if (overrides.length > 0) {
    const overrideResult = await setBulkCommunityOverrides(community.id, overrides);
    if (overrideResult.error) {
      console.error("Failed to set feature overrides:", overrideResult.error);
      // Non-fatal - community is still usable
    }
  }

  revalidatePath("/system-admin/communities");

  return { data: community };
}
