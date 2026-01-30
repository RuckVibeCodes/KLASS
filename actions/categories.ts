"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { isDemoSlug } from "@/lib/demo";

export interface Category {
  id: string;
  community_id: string;
  name: string;
  slug: string;
  color: string;
  icon: string;
  display_order: number;
  created_at: string;
}

// Get all categories for a community
export async function getCategories(communitySlug: string): Promise<{ data?: Category[]; error?: string }> {
  const supabase = await createAdminClient();

  const { data: community } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", communitySlug)
    .single();

  if (!community) {
    return { error: "Community not found" };
  }

  const { data, error } = await supabase
    .from("post_categories")
    .select("*")
    .eq("community_id", community.id)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Failed to fetch categories:", error);
    return { error: "Failed to fetch categories" };
  }

  return { data: data as Category[] };
}

// Create a new category
export async function createCategory(
  communitySlug: string,
  data: {
    name: string;
    color?: string;
    icon?: string;
  }
): Promise<{ data?: Category; error?: string }> {
  if (isDemoSlug(communitySlug)) {
    return { data: { id: "demo-cat", name: data.name, slug: data.name.toLowerCase(), color: data.color || "#6366f1", icon: data.icon || "hash", display_order: 0, community_id: "demo", created_at: new Date().toISOString() } };
  }

  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  const supabase = await createClient();
  const adminSupabase = await createAdminClient();

  // Get community
  const { data: community } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", communitySlug)
    .single();

  if (!community) {
    return { error: "Community not found" };
  }

  // Verify admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("clerk_user_id", userId)
    .eq("community_id", community.id)
    .single();

  if (profile?.role !== "ADMIN") {
    return { error: "Admin access required" };
  }

  // Generate slug from name
  const slug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  // Get max display_order
  const { data: maxOrder } = await adminSupabase
    .from("post_categories")
    .select("display_order")
    .eq("community_id", community.id)
    .order("display_order", { ascending: false })
    .limit(1)
    .single();

  const newOrder = (maxOrder?.display_order ?? -1) + 1;

  const { data: category, error } = await adminSupabase
    .from("post_categories")
    .insert({
      community_id: community.id,
      name: data.name.trim(),
      slug,
      color: data.color || "#6366f1",
      icon: data.icon || "hash",
      display_order: newOrder,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "A topic with this name already exists" };
    }
    console.error("Failed to create category:", error);
    return { error: "Failed to create topic" };
  }

  revalidatePath(`/${communitySlug}`);
  revalidatePath(`/${communitySlug}/admin/settings`);

  return { data: category as Category };
}

// Update a category
export async function updateCategory(
  communitySlug: string,
  categoryId: string,
  data: {
    name?: string;
    color?: string;
    icon?: string;
    display_order?: number;
  }
): Promise<{ data?: Category; error?: string }> {
  if (isDemoSlug(communitySlug)) {
    return { data: { id: categoryId, name: data.name || "Demo", slug: "demo", color: data.color || "#6366f1", icon: data.icon || "hash", display_order: data.display_order || 0, community_id: "demo", created_at: new Date().toISOString() } };
  }

  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  const supabase = await createClient();
  const adminSupabase = await createAdminClient();

  // Get community
  const { data: community } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", communitySlug)
    .single();

  if (!community) {
    return { error: "Community not found" };
  }

  // Verify admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("clerk_user_id", userId)
    .eq("community_id", community.id)
    .single();

  if (profile?.role !== "ADMIN") {
    return { error: "Admin access required" };
  }

  const updateData: Record<string, unknown> = {};
  
  if (data.name !== undefined) {
    updateData.name = data.name.trim();
    updateData.slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  if (data.color !== undefined) updateData.color = data.color;
  if (data.icon !== undefined) updateData.icon = data.icon;
  if (data.display_order !== undefined) updateData.display_order = data.display_order;

  const { data: category, error } = await adminSupabase
    .from("post_categories")
    .update(updateData)
    .eq("id", categoryId)
    .eq("community_id", community.id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "A topic with this name already exists" };
    }
    console.error("Failed to update category:", error);
    return { error: "Failed to update topic" };
  }

  revalidatePath(`/${communitySlug}`);
  revalidatePath(`/${communitySlug}/admin/settings`);

  return { data: category as Category };
}

// Delete a category
export async function deleteCategory(
  communitySlug: string,
  categoryId: string
): Promise<{ success?: boolean; error?: string }> {
  if (isDemoSlug(communitySlug)) {
    return { success: true };
  }

  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  const supabase = await createClient();
  const adminSupabase = await createAdminClient();

  // Get community
  const { data: community } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", communitySlug)
    .single();

  if (!community) {
    return { error: "Community not found" };
  }

  // Verify admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("clerk_user_id", userId)
    .eq("community_id", community.id)
    .single();

  if (profile?.role !== "ADMIN") {
    return { error: "Admin access required" };
  }

  const { error } = await adminSupabase
    .from("post_categories")
    .delete()
    .eq("id", categoryId)
    .eq("community_id", community.id);

  if (error) {
    console.error("Failed to delete category:", error);
    return { error: "Failed to delete topic" };
  }

  revalidatePath(`/${communitySlug}`);
  revalidatePath(`/${communitySlug}/admin/settings`);

  return { success: true };
}

// Reorder categories
export async function reorderCategories(
  communitySlug: string,
  categoryOrders: { id: string; display_order: number }[]
): Promise<{ success?: boolean; error?: string }> {
  if (isDemoSlug(communitySlug)) {
    return { success: true };
  }

  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  const supabase = await createClient();
  const adminSupabase = await createAdminClient();

  // Get community
  const { data: community } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", communitySlug)
    .single();

  if (!community) {
    return { error: "Community not found" };
  }

  // Verify admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("clerk_user_id", userId)
    .eq("community_id", community.id)
    .single();

  if (profile?.role !== "ADMIN") {
    return { error: "Admin access required" };
  }

  // Update each category's order
  for (const item of categoryOrders) {
    await adminSupabase
      .from("post_categories")
      .update({ display_order: item.display_order })
      .eq("id", item.id)
      .eq("community_id", community.id);
  }

  revalidatePath(`/${communitySlug}`);
  revalidatePath(`/${communitySlug}/admin/settings`);

  return { success: true };
}
