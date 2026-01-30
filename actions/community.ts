"use server";

import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { CommunitySettings } from "@/types/database";

// Demo mode: return fake success without writing to DB
const DEMO_SLUG = "demo";
function isDemoMode(slug: string) {
  return slug === DEMO_SLUG;
}

export async function updateCommunitySettings(
  communityId: string,
  communitySlug: string,
  settings: CommunitySettings
) {
  const supabase = await createAdminClient();

  // Demo mode: allow settings writes (layout switching, etc.) but skip auth
  if (isDemoMode(communitySlug)) {
    const { data, error } = await supabase
      .from("communities")
      .update({ settings_json: settings })
      .eq("id", communityId)
      .select()
      .single();

    if (error) {
      return { error: "Failed to update settings" };
    }

    revalidatePath(`/${communitySlug}`, "layout");
    return { data };
  }

  const { userId } = await auth();

  if (!userId) {
    return { error: "Unauthorized" };
  }

  // Verify admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("clerk_user_id", userId)
    .eq("community_id", communityId)
    .single();

  if (profile?.role !== "ADMIN") {
    return { error: "Admin access required" };
  }

  const { data, error } = await supabase
    .from("communities")
    .update({
      settings_json: settings,
    })
    .eq("id", communityId)
    .select()
    .single();

  if (error) {
    console.error("Failed to update community settings:", error.message);
    return { error: "Failed to update community settings" };
  }

  // Revalidate all pages under this community
  revalidatePath(`/${communitySlug}`, "layout");

  return { data };
}

export async function updateCommunity(
  communityId: string,
  communitySlug: string,
  updates: {
    name?: string;
    description?: string | null;
    logo_url?: string | null;
    primary_color?: string;
    accent_color?: string;
  }
) {
  if (isDemoMode(communitySlug)) {
    return { data: { id: communityId, ...updates } };
  }

  const { userId } = await auth();

  if (!userId) {
    return { error: "Unauthorized" };
  }

  const supabase = await createAdminClient();

  // Verify admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("clerk_user_id", userId)
    .eq("community_id", communityId)
    .single();

  if (profile?.role !== "ADMIN") {
    return { error: "Admin access required" };
  }

  const { data, error } = await supabase
    .from("communities")
    .update(updates)
    .eq("id", communityId)
    .select()
    .single();

  if (error) {
    console.error("Failed to update community:", error.message);
    return { error: "Failed to update community" };
  }

  // Revalidate all pages under this community
  revalidatePath(`/${communitySlug}`, "layout");

  return { data };
}

export async function updateCommunityModules(
  communityId: string,
  communitySlug: string,
  moduleUpdates: Array<{
    id: string;
    label: string;
    enabled: boolean;
  }>
) {
  const supabase = await createAdminClient();

  // Demo mode: allow module updates (nav toggling) but skip auth
  if (!isDemoMode(communitySlug)) {
    const { userId } = await auth();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("clerk_user_id", userId)
      .eq("community_id", communityId)
      .single();

    if (profile?.role !== "ADMIN") {
      return { error: "Admin access required" };
    }
  }

  // Update each module
  for (const module of moduleUpdates) {
    const { error } = await supabase
      .from("community_modules")
      .update({
        label: module.label,
        enabled: module.enabled,
      })
      .eq("id", module.id);

    if (error) {
      console.error("Failed to update module:", error.message);
      return { error: "Failed to update module" };
    }
  }

  // Revalidate all pages under this community
  revalidatePath(`/${communitySlug}`, "layout");

  return { success: true };
}

// Create a new community (for self-serve onboarding)
export async function createCommunityWithProfile(data: {
  name: string;
  slug: string;
  description?: string;
  clerkUserId: string;
  userName?: string;
}) {
  const supabase = await createAdminClient();

  // Create community
  const { data: community, error: communityError } = await supabase
    .from("communities")
    .insert({
      name: data.name,
      slug: data.slug,
      description: data.description || null,
    })
    .select()
    .single();

  if (communityError) {
    console.error("Failed to create community:", communityError);
    return { error: communityError.message };
  }

  // Create profile for the creator as ADMIN
  const { error: profileError } = await supabase.from("profiles").insert({
    community_id: community.id,
    clerk_user_id: data.clerkUserId,
    display_name: data.userName || data.name,
    role: "ADMIN",
    tier: "PAID",
  });

  if (profileError) {
    console.error("Failed to create profile:", profileError);
    // Rollback community creation
    await supabase.from("communities").delete().eq("id", community.id);
    return { error: profileError.message };
  }

  // Create default modules
  const defaultModules = [
    { key: "feed", label: "Community" },
    { key: "programs", label: "Programs" },
    { key: "resources", label: "Resources" },
    { key: "events", label: "Events" },
    { key: "members", label: "Members" },
    { key: "about", label: "About" },
  ];
  await supabase.from("community_modules").insert(
    defaultModules.map((mod, index) => ({
      community_id: community.id,
      key: mod.key,
      label: mod.label,
      enabled: true,
      order_index: index,
    }))
  );

  // Create default free tier
  await supabase.from("membership_tiers").insert([
    {
      community_id: community.id,
      name: "Free",
      slug: "free",
      description: "Basic access to the community",
      price_cents_monthly: 0,
      price_cents_yearly: 0,
      tier_level: 0,
      is_default: true,
      order_index: 0,
    },
    {
      community_id: community.id,
      name: "Pro",
      slug: "pro",
      description: "Full access to all content",
      price_cents_monthly: 2900,
      price_cents_yearly: 29000,
      tier_level: 1,
      is_default: false,
      order_index: 1,
    },
  ]);

  return { community };
}
