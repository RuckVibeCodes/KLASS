"use server";

import { auth } from "@clerk/nextjs/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Resource, ContentVisibility } from "@/types/database";

/**
 * Get all resources for a community
 */
export async function getCommunityResources(communitySlug: string) {
  const supabase = await createClient();

  const { data: community } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", communitySlug)
    .single();

  if (!community) return { error: "Community not found" };

  const { data: resources, error } = await supabase
    .from("resources")
    .select("*")
    .eq("community_id", community.id)
    .order("folder")
    .order("order_index");

  if (error) {
    console.error("Failed to get resources:", error.message);
    return { error: "Failed to get resources" };
  }

  return { data: resources as Resource[] };
}

/**
 * Get a single resource by ID
 */
export async function getResource(resourceId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("id", resourceId)
    .single();

  if (error) {
    console.error("Failed to get resource:", error.message);
    return { error: "Failed to get resource" };
  }

  return { data: data as Resource };
}

/**
 * Create a new resource
 */
export async function createResource(
  communitySlug: string,
  data: {
    title: string;
    description?: string;
    type: "file" | "link" | "embed";
    url: string;
    file_size_bytes?: number;
    mime_type?: string;
    folder?: string;
    visibility?: ContentVisibility;
  }
) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const supabase = await createClient();
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

  // Get max order_index for folder
  const { data: maxOrder } = await supabase
    .from("resources")
    .select("order_index")
    .eq("community_id", community.id)
    .eq("folder", data.folder || "")
    .order("order_index", { ascending: false })
    .limit(1)
    .single();

  const order_index = (maxOrder?.order_index ?? -1) + 1;

  // Create resource
  const { data: resource, error } = await adminSupabase
    .from("resources")
    .insert({
      community_id: community.id,
      title: data.title,
      description: data.description || null,
      type: data.type,
      url: data.url,
      file_size_bytes: data.file_size_bytes || null,
      mime_type: data.mime_type || null,
      folder: data.folder || "",
      visibility: data.visibility || "members",
      order_index,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create resource:", error.message);
    return { error: "Failed to create resource" };
  }

  revalidatePath(`/${communitySlug}/admin/content/resources`);
  revalidatePath(`/${communitySlug}/resources`);

  return { data: resource as Resource };
}

/**
 * Update a resource
 */
export async function updateResource(
  resourceId: string,
  communitySlug: string,
  data: Partial<{
    title: string;
    description: string | null;
    url: string;
    folder: string;
    visibility: ContentVisibility;
  }>
) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const supabase = await createClient();
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

  // Verify resource belongs to community
  const { data: existingResource } = await supabase
    .from("resources")
    .select("id, community_id")
    .eq("id", resourceId)
    .single();

  if (!existingResource || existingResource.community_id !== community.id) {
    return { error: "Resource not found" };
  }

  // Update resource
  const { data: resource, error } = await adminSupabase
    .from("resources")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", resourceId)
    .select()
    .single();

  if (error) {
    console.error("Failed to update resource:", error.message);
    return { error: "Failed to update resource" };
  }

  revalidatePath(`/${communitySlug}/admin/content/resources`);
  revalidatePath(`/${communitySlug}/resources`);

  return { data: resource as Resource };
}

/**
 * Delete a resource
 */
export async function deleteResource(resourceId: string, communitySlug: string) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const supabase = await createClient();
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

  // Delete resource
  const { error } = await adminSupabase
    .from("resources")
    .delete()
    .eq("id", resourceId);

  if (error) {
    console.error("Failed to delete resource:", error.message);
    return { error: "Failed to delete resource" };
  }

  revalidatePath(`/${communitySlug}/admin/content/resources`);
  revalidatePath(`/${communitySlug}/resources`);

  return { data: { success: true } };
}

/**
 * Reorder resources within a folder
 */
export async function reorderResources(
  communitySlug: string,
  folder: string,
  resourceOrders: { id: string; order_index: number }[]
) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const supabase = await createClient();
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

  // Update each resource's order
  for (const { id, order_index } of resourceOrders) {
    await adminSupabase
      .from("resources")
      .update({ order_index })
      .eq("id", id)
      .eq("community_id", community.id);
  }

  revalidatePath(`/${communitySlug}/admin/content/resources`);
  revalidatePath(`/${communitySlug}/resources`);

  return { data: { success: true } };
}
