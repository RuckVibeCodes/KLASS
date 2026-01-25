"use server";

import { auth } from "@clerk/nextjs/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ContentType, GrantSource } from "@/types/database";

/**
 * Manually grant content access to a member
 */
export async function grantContentAccess(
  profileId: string,
  contentType: ContentType,
  contentId: string,
  communitySlug: string,
  options?: {
    notes?: string;
    source?: GrantSource;
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
  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("clerk_user_id", userId)
    .eq("community_id", community.id)
    .single();

  if (adminProfile?.role !== "ADMIN") {
    return { error: "Admin access required" };
  }

  // Verify target profile exists in this community
  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", profileId)
    .eq("community_id", community.id)
    .single();

  if (!targetProfile) {
    return { error: "Member not found in this community" };
  }

  // Create or reactivate grant
  const { data, error } = await adminSupabase
    .from("content_access_grants")
    .upsert(
      {
        profile_id: profileId,
        content_type: contentType,
        content_id: contentId,
        source: options?.source || "manual",
        granted_by_profile_id: adminProfile.id,
        granted_at: new Date().toISOString(),
        revoked_at: null, // Clear revocation if reactivating
        notes: options?.notes,
      },
      { onConflict: "profile_id,content_type,content_id" }
    )
    .select()
    .single();

  if (error) {
    console.error("Failed to grant access:", error);
    return { error: error.message };
  }

  revalidatePath(`/${communitySlug}/admin/members`);
  return { data };
}

/**
 * Revoke content access from a member
 */
export async function revokeContentAccess(
  grantId: string,
  communitySlug: string
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
  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("clerk_user_id", userId)
    .eq("community_id", community.id)
    .single();

  if (adminProfile?.role !== "ADMIN") {
    return { error: "Admin access required" };
  }

  // Revoke by setting revoked_at
  const { error } = await adminSupabase
    .from("content_access_grants")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", grantId);

  if (error) {
    console.error("Failed to revoke access:", error);
    return { error: error.message };
  }

  revalidatePath(`/${communitySlug}/admin/members`);
  return { data: { success: true } };
}

/**
 * Get list of users with access to specific content
 */
export async function getContentAccessList(
  contentType: ContentType,
  contentId: string,
  communitySlug: string
) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const supabase = await createClient();

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

  // Get grants with profile info
  const { data: grants, error } = await supabase
    .from("content_access_grants")
    .select(`
      *,
      profile:profiles!content_access_grants_profile_id_fkey(
        id,
        display_name,
        email,
        avatar_url,
        tier
      ),
      granted_by:profiles!content_access_grants_granted_by_profile_id_fkey(
        id,
        display_name
      )
    `)
    .eq("content_type", contentType)
    .eq("content_id", contentId)
    .is("revoked_at", null)
    .order("granted_at", { ascending: false });

  if (error) {
    console.error("Failed to get access list:", error);
    return { error: error.message };
  }

  return { data: grants };
}

/**
 * Get all access grants for a specific member
 */
export async function getMemberAccessGrants(
  profileId: string,
  communitySlug: string
) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const supabase = await createClient();

  // Get community
  const { data: community } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", communitySlug)
    .single();

  if (!community) return { error: "Community not found" };

  // Verify admin or self
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("clerk_user_id", userId)
    .eq("community_id", community.id)
    .single();

  if (!currentProfile) return { error: "Profile not found" };

  const isAdmin = currentProfile.role === "ADMIN";
  const isSelf = currentProfile.id === profileId;

  if (!isAdmin && !isSelf) {
    return { error: "Access denied" };
  }

  // Get grants
  const { data: grants, error } = await supabase
    .from("content_access_grants")
    .select("*")
    .eq("profile_id", profileId)
    .is("revoked_at", null)
    .order("granted_at", { ascending: false });

  if (error) {
    console.error("Failed to get member grants:", error);
    return { error: error.message };
  }

  return { data: grants };
}

/**
 * Check if a user has access to specific content
 */
export async function checkContentAccess(
  profileId: string,
  contentType: ContentType,
  contentId: string
) {
  const supabase = await createClient();

  // Check for active grant
  const { data: grant } = await supabase
    .from("content_access_grants")
    .select("id")
    .eq("profile_id", profileId)
    .eq("content_type", contentType)
    .eq("content_id", contentId)
    .is("revoked_at", null)
    .single();

  return { hasAccess: !!grant };
}

/**
 * Get community members for grant picker
 */
export async function getCommunityMembersForGrants(communitySlug: string) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const supabase = await createClient();

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

  // Get all members
  const { data: members, error } = await supabase
    .from("profiles")
    .select("id, display_name, email, avatar_url, tier, role")
    .eq("community_id", community.id)
    .order("display_name");

  if (error) {
    console.error("Failed to get members:", error);
    return { error: error.message };
  }

  return { data: members };
}
