"use server";

import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { CommunitySettings } from "@/types/database";

export async function updateCommunitySettings(
  communityId: string,
  communitySlug: string,
  settings: CommunitySettings
) {
  const { userId } = await auth();

  if (!userId) {
    return { error: "Unauthorized" };
  }

  // Use admin client to bypass RLS for demo purposes
  // In production, you would verify admin role first
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("communities")
    .update({
      settings_json: settings,
    })
    .eq("id", communityId)
    .select()
    .single();

  if (error) {
    console.error("Failed to update community settings:", error);
    return { error: error.message };
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
  const { userId } = await auth();

  if (!userId) {
    return { error: "Unauthorized" };
  }

  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("communities")
    .update(updates)
    .eq("id", communityId)
    .select()
    .single();

  if (error) {
    console.error("Failed to update community:", error);
    return { error: error.message };
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
  const { userId } = await auth();

  if (!userId) {
    return { error: "Unauthorized" };
  }

  const supabase = await createAdminClient();

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
      console.error("Failed to update module:", error);
      return { error: `Failed to update module: ${error.message}` };
    }
  }

  // Revalidate all pages under this community
  revalidatePath(`/${communitySlug}`, "layout");

  return { success: true };
}
