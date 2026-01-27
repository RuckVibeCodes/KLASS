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
