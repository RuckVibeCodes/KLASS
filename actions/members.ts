"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function updateMemberRole(
  memberId: string,
  newRole: string,
  communitySlug: string
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const supabase = await createClient();

  // Get community
  const { data: community } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", communitySlug)
    .single();

  if (!community) {
    throw new Error("Community not found");
  }

  // Check if current user is admin
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("clerk_user_id", userId)
    .eq("community_id", community.id)
    .single();

  if (currentProfile?.role !== "ADMIN") {
    throw new Error("Only admins can update member roles");
  }

  // Update member role using admin client
  const adminSupabase = await createAdminClient();

  const { error } = await adminSupabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", memberId);

  if (error) {
    console.error("Failed to update member role:", error.message);
    throw new Error("Failed to update member role");
  }

  revalidatePath(`/${communitySlug}/admin/members`);

  return { success: true };
}

export async function updateMemberTier(
  memberId: string,
  newTier: string,
  communitySlug: string
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const supabase = await createClient();

  // Get community
  const { data: community } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", communitySlug)
    .single();

  if (!community) {
    throw new Error("Community not found");
  }

  // Check if current user is admin
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("clerk_user_id", userId)
    .eq("community_id", community.id)
    .single();

  if (currentProfile?.role !== "ADMIN") {
    throw new Error("Only admins can update member tiers");
  }

  // Update member tier using admin client
  const adminSupabase = await createAdminClient();

  const { error } = await adminSupabase
    .from("profiles")
    .update({ tier: newTier })
    .eq("id", memberId);

  if (error) {
    console.error("Failed to update member tier:", error.message);
    throw new Error("Failed to update member tier");
  }

  revalidatePath(`/${communitySlug}/admin/members`);

  return { success: true };
}

export async function removeMember(
  memberId: string,
  communitySlug: string
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const supabase = await createClient();

  // Get community
  const { data: community } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", communitySlug)
    .single();

  if (!community) {
    throw new Error("Community not found");
  }

  // Check if current user is admin
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role, id")
    .eq("clerk_user_id", userId)
    .eq("community_id", community.id)
    .single();

  if (currentProfile?.role !== "ADMIN") {
    throw new Error("Only admins can remove members");
  }

  // Prevent self-removal
  if (currentProfile.id === memberId) {
    throw new Error("You cannot remove yourself");
  }

  // Remove member using admin client
  const adminSupabase = await createAdminClient();

  const { error } = await adminSupabase
    .from("profiles")
    .delete()
    .eq("id", memberId)
    .eq("community_id", community.id);

  if (error) {
    console.error("Failed to remove member:", error.message);
    throw new Error("Failed to remove member");
  }

  revalidatePath(`/${communitySlug}/admin/members`);

  return { success: true };
}
