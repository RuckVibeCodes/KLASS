"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { isDemoSlug } from "@/lib/demo";

export interface MemberTag {
  id: string;
  community_id: string;
  name: string;
  color: string;
  description: string | null;
  is_system: boolean;
  created_at: string;
}

export interface ProfileTag {
  id: string;
  profile_id: string;
  tag_id: string;
  assigned_at: string;
  assigned_by: string | null;
  tag?: MemberTag;
}

// Get all tags for a community
export async function getCommunityTags(
  communitySlug: string
): Promise<{ data: MemberTag[] | null; error: string | null }> {
  const { userId } = await auth();
  if (!userId) {
    return { data: null, error: "Not authenticated" };
  }

  const supabase = await createClient();

  // Get community
  const { data: community } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", communitySlug)
    .single();

  if (!community) {
    return { data: null, error: "Community not found" };
  }

  // Get tags
  const { data: tags, error } = await supabase
    .from("member_tags")
    .select("*")
    .eq("community_id", community.id)
    .order("name");

  if (error) {
    return { data: null, error: "Failed to load tags" };
  }

  return { data: tags, error: null };
}

// Create a new tag
export async function createTag(
  communitySlug: string,
  data: { name: string; color?: string; description?: string }
): Promise<{ data: MemberTag | null; error: string | null }> {
  if (isDemoSlug(communitySlug)) return { data: { id: "demo-tag", name: "Demo Tag" } as MemberTag, error: null };

  const { userId } = await auth();
  if (!userId) {
    return { data: null, error: "Not authenticated" };
  }

  const supabase = await createClient();

  // Get community and verify admin
  const { data: community } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", communitySlug)
    .single();

  if (!community) {
    return { data: null, error: "Community not found" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("clerk_user_id", userId)
    .eq("community_id", community.id)
    .single();

  if (profile?.role !== "ADMIN") {
    return { data: null, error: "Only admins can create tags" };
  }

  // Create tag using admin client
  const adminSupabase = await createAdminClient();
  const { data: tag, error } = await adminSupabase
    .from("member_tags")
    .insert({
      community_id: community.id,
      name: data.name.trim(),
      color: data.color || "#6366f1",
      description: data.description?.trim() || null,
      is_system: false,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { data: null, error: "A tag with this name already exists" };
    }
    return { data: null, error: "Failed to create tag" };
  }

  revalidatePath(`/${communitySlug}/admin/members`);
  return { data: tag, error: null };
}

// Update a tag
export async function updateTag(
  tagId: string,
  communitySlug: string,
  data: { name?: string; color?: string; description?: string }
): Promise<{ data: MemberTag | null; error: string | null }> {
  if (isDemoSlug(communitySlug)) return { data: { id: "demo-tag", name: "Updated" } as MemberTag, error: null };

  const { userId } = await auth();
  if (!userId) {
    return { data: null, error: "Not authenticated" };
  }

  const supabase = await createClient();

  // Verify the tag exists and user is admin
  const { data: existingTag } = await supabase
    .from("member_tags")
    .select("*, communities!inner(slug)")
    .eq("id", tagId)
    .single();

  if (!existingTag) {
    return { data: null, error: "Tag not found" };
  }

  if (existingTag.is_system) {
    return { data: null, error: "System tags cannot be modified" };
  }

  // Verify admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("clerk_user_id", userId)
    .eq("community_id", existingTag.community_id)
    .single();

  if (profile?.role !== "ADMIN") {
    return { data: null, error: "Only admins can update tags" };
  }

  // Update tag using admin client
  const updateData: Partial<MemberTag> = {};
  if (data.name !== undefined) updateData.name = data.name.trim();
  if (data.color !== undefined) updateData.color = data.color;
  if (data.description !== undefined)
    updateData.description = data.description?.trim() || null;

  const adminSupabase = await createAdminClient();
  const { data: tag, error } = await adminSupabase
    .from("member_tags")
    .update(updateData)
    .eq("id", tagId)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { data: null, error: "A tag with this name already exists" };
    }
    return { data: null, error: "Failed to update tag" };
  }

  revalidatePath(`/${communitySlug}/admin/members`);
  return { data: tag, error: null };
}

// Delete a tag
export async function deleteTag(
  tagId: string,
  communitySlug: string
): Promise<{ error: string | null }> {
  if (isDemoSlug(communitySlug)) return { error: null };
  const { userId } = await auth();
  if (!userId) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  // Verify the tag exists and user is admin
  const { data: existingTag } = await supabase
    .from("member_tags")
    .select("*")
    .eq("id", tagId)
    .single();

  if (!existingTag) {
    return { error: "Tag not found" };
  }

  if (existingTag.is_system) {
    return { error: "System tags cannot be deleted" };
  }

  // Verify admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("clerk_user_id", userId)
    .eq("community_id", existingTag.community_id)
    .single();

  if (profile?.role !== "ADMIN") {
    return { error: "Only admins can delete tags" };
  }

  // Delete tag using admin client (cascade will remove profile_tags)
  const adminSupabase = await createAdminClient();
  const { error } = await adminSupabase.from("member_tags").delete().eq("id", tagId);

  if (error) {
    return { error: "Operation failed" };
  }

  revalidatePath(`/${communitySlug}/admin/members`);
  return { error: null };
}

// Assign a tag to a profile
export async function assignTag(
  profileId: string,
  tagId: string,
  communitySlug: string
): Promise<{ error: string | null }> {
  if (isDemoSlug(communitySlug)) return { error: null };
  const { userId } = await auth();
  if (!userId) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  // Get community
  const { data: community } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", communitySlug)
    .single();

  if (!community) {
    return { error: "Community not found" };
  }

  // Verify admin
  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("clerk_user_id", userId)
    .eq("community_id", community.id)
    .single();

  if (adminProfile?.role !== "ADMIN") {
    return { error: "Only admins can assign tags" };
  }

  // Assign tag using admin client
  const adminSupabase = await createAdminClient();
  const { error } = await adminSupabase.from("profile_tags").insert({
    profile_id: profileId,
    tag_id: tagId,
    assigned_by: adminProfile.id,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Tag already assigned to this member" };
    }
    return { error: "Operation failed" };
  }

  revalidatePath(`/${communitySlug}/admin/members`);
  return { error: null };
}

// Remove a tag from a profile
export async function removeTag(
  profileId: string,
  tagId: string,
  communitySlug: string
): Promise<{ error: string | null }> {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  // Get community
  const { data: community } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", communitySlug)
    .single();

  if (!community) {
    return { error: "Community not found" };
  }

  // Verify admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("clerk_user_id", userId)
    .eq("community_id", community.id)
    .single();

  if (profile?.role !== "ADMIN") {
    return { error: "Only admins can remove tags" };
  }

  // Remove tag using admin client
  const adminSupabase = await createAdminClient();
  const { error } = await adminSupabase
    .from("profile_tags")
    .delete()
    .eq("profile_id", profileId)
    .eq("tag_id", tagId);

  if (error) {
    return { error: "Operation failed" };
  }

  revalidatePath(`/${communitySlug}/admin/members`);
  return { error: null };
}

// Get all tags for a profile
export async function getProfileTags(
  profileId: string,
  communitySlug: string
): Promise<{ data: ProfileTag[] | null; error: string | null }> {
  const { userId } = await auth();
  if (!userId) {
    return { data: null, error: "Not authenticated" };
  }

  const supabase = await createClient();

  // Get community
  const { data: community } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", communitySlug)
    .single();

  if (!community) {
    return { data: null, error: "Community not found" };
  }

  // Get tags with joined tag info
  const { data: profileTags, error } = await supabase
    .from("profile_tags")
    .select(
      `
      *,
      tag:member_tags(*)
    `
    )
    .eq("profile_id", profileId);

  if (error) {
    return { data: null, error: "Failed to load profile tags" };
  }

  return { data: profileTags, error: null };
}

// Bulk assign a tag to multiple profiles
export async function bulkAssignTag(
  profileIds: string[],
  tagId: string,
  communitySlug: string
): Promise<{ success: number; errors: number }> {
  const { userId } = await auth();
  if (!userId) {
    return { success: 0, errors: profileIds.length };
  }

  const supabase = await createClient();

  // Get community
  const { data: community } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", communitySlug)
    .single();

  if (!community) {
    return { success: 0, errors: profileIds.length };
  }

  // Verify admin
  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("clerk_user_id", userId)
    .eq("community_id", community.id)
    .single();

  if (adminProfile?.role !== "ADMIN") {
    return { success: 0, errors: profileIds.length };
  }

  // Bulk insert using admin client (ignoring conflicts)
  const inserts = profileIds.map((profileId) => ({
    profile_id: profileId,
    tag_id: tagId,
    assigned_by: adminProfile.id,
  }));

  const adminSupabase = await createAdminClient();
  const { data, error } = await adminSupabase
    .from("profile_tags")
    .upsert(inserts, { onConflict: "profile_id,tag_id", ignoreDuplicates: true })
    .select();

  revalidatePath(`/${communitySlug}/admin/members`);

  if (error) {
    return { success: 0, errors: profileIds.length };
  }

  return { success: data?.length || 0, errors: profileIds.length - (data?.length || 0) };
}
