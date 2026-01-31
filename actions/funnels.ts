"use server";

import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import type { Funnel, FunnelContentType } from "@/types/database";
import { isDemoSlug } from "@/lib/demo";

// Reserved slugs that can't be used for funnels
const RESERVED_SLUGS = [
  "admin",
  "feed",
  "programs",
  "resources",
  "events",
  "members",
  "settings",
  "about",
  "account",
  "affiliate",
  "chat",
  "pricing",
  "api",
  "sign-in",
  "sign-up",
];

/**
 * Get all funnels for a community (admin only)
 */
export async function getCommunityFunnels(communitySlug: string) {
  const supabase = createAdminClient();

  const { data: community } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", communitySlug)
    .single();

  if (!community) return { error: "Community not found" };

  const { data: funnels, error } = await supabase
    .from("funnels")
    .select("*")
    .eq("community_id", community.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to get funnels:", error.message);
    return { error: "Failed to get funnels" };
  }

  return { data: funnels as Funnel[] };
}

/**
 * Get a single funnel by ID (admin access)
 */
export async function getFunnel(funnelId: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("funnels")
    .select("*")
    .eq("id", funnelId)
    .single();

  if (error) {
    console.error("Failed to get funnel:", error.message);
    return { error: "Failed to get funnel" };
  }

  return { data: data as Funnel };
}

/**
 * Get a published funnel by community and funnel slug (public access)
 */
export async function getPublicFunnel(communitySlug: string, funnelSlug: string) {
  const adminSupabase = await createAdminClient();

  // Get community
  const { data: community, error: communityError } = await adminSupabase
    .from("communities")
    .select("*")
    .eq("slug", communitySlug)
    .single();

  if (communityError || !community) {
    return { error: "Community not found" };
  }

  // Get funnel (must be published for public access)
  const { data: funnel, error: funnelError } = await adminSupabase
    .from("funnels")
    .select("*")
    .eq("community_id", community.id)
    .eq("slug", funnelSlug)
    .eq("published", true)
    .single();

  if (funnelError || !funnel) {
    return { error: "Funnel not found" };
  }

  return { data: { funnel: funnel as Funnel, community } };
}

/**
 * Create a new funnel
 */
export async function createFunnel(
  communitySlug: string,
  data: {
    title: string;
    slug: string;
    description?: string;
    cover_image_url?: string;
    video_url?: string;
    content_type: FunnelContentType;
    content_id?: string;
    price_cents?: number;
    headline?: string;
    subheadline?: string;
    bullet_points?: string[];
    cta_text?: string;
    redirect_path?: string;
    welcome_message?: string;
    published?: boolean;
  }
) {
  if (isDemoSlug(communitySlug)) return { data: { id: "demo-funnel" } };

  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const supabase = createAdminClient();
  const adminSupabase = await createAdminClient();

  // Validate slug
  const slug = data.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  if (RESERVED_SLUGS.includes(slug)) {
    return { error: "This URL is reserved. Please choose a different slug." };
  }

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

  // Check slug uniqueness
  const { data: existingFunnel } = await supabase
    .from("funnels")
    .select("id")
    .eq("community_id", community.id)
    .eq("slug", slug)
    .single();

  if (existingFunnel) {
    return { error: "A funnel with this URL already exists" };
  }

  // Create funnel
  const { data: funnel, error } = await adminSupabase
    .from("funnels")
    .insert({
      community_id: community.id,
      title: data.title,
      slug,
      description: data.description || null,
      cover_image_url: data.cover_image_url || null,
      video_url: data.video_url || null,
      content_type: data.content_type,
      content_id: data.content_id || null,
      price_cents: data.price_cents || 0,
      headline: data.headline || null,
      subheadline: data.subheadline || null,
      bullet_points: data.bullet_points || [],
      cta_text: data.cta_text || "Get Free Access",
      redirect_path: data.redirect_path || "/feed",
      welcome_message: data.welcome_message || null,
      published: data.published || false,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create funnel:", error.message);
    return { error: "Failed to create funnel" };
  }

  revalidatePath(`/${communitySlug}/admin/funnels`);

  return { data: funnel as Funnel };
}

/**
 * Update a funnel
 */
export async function updateFunnel(
  funnelId: string,
  communitySlug: string,
  data: Partial<{
    title: string;
    slug: string;
    description: string | null;
    cover_image_url: string | null;
    video_url: string | null;
    content_type: FunnelContentType;
    content_id: string | null;
    price_cents: number;
    headline: string | null;
    subheadline: string | null;
    bullet_points: string[];
    cta_text: string;
    redirect_path: string;
    welcome_message: string | null;
    published: boolean;
  }>
) {
  if (isDemoSlug(communitySlug)) return { data: { id: "demo-funnel" } };

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

  // Verify funnel belongs to community
  const { data: existingFunnel } = await supabase
    .from("funnels")
    .select("id, community_id, slug")
    .eq("id", funnelId)
    .single();

  if (!existingFunnel || existingFunnel.community_id !== community.id) {
    return { error: "Funnel not found" };
  }

  // If slug is changing, validate and check uniqueness
  if (data.slug && data.slug !== existingFunnel.slug) {
    const slug = data.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    if (RESERVED_SLUGS.includes(slug)) {
      return { error: "This URL is reserved. Please choose a different slug." };
    }

    const { data: conflictingFunnel } = await supabase
      .from("funnels")
      .select("id")
      .eq("community_id", community.id)
      .eq("slug", slug)
      .neq("id", funnelId)
      .single();

    if (conflictingFunnel) {
      return { error: "A funnel with this URL already exists" };
    }

    data.slug = slug;
  }

  // Update funnel
  const { data: funnel, error } = await adminSupabase
    .from("funnels")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", funnelId)
    .select()
    .single();

  if (error) {
    console.error("Failed to update funnel:", error.message);
    return { error: "Failed to update funnel" };
  }

  revalidatePath(`/${communitySlug}/admin/funnels`);
  revalidatePath(`/${communitySlug}/admin/funnels/${funnelId}`);
  revalidatePath(`/${communitySlug}/${existingFunnel.slug}`);
  if (data.slug) {
    revalidatePath(`/${communitySlug}/${data.slug}`);
  }

  return { data: funnel as Funnel };
}

/**
 * Delete a funnel
 */
export async function deleteFunnel(funnelId: string, communitySlug: string) {
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

  // Delete funnel
  const { error } = await adminSupabase
    .from("funnels")
    .delete()
    .eq("id", funnelId);

  if (error) {
    console.error("Failed to delete funnel:", error.message);
    return { error: "Failed to delete funnel" };
  }

  revalidatePath(`/${communitySlug}/admin/funnels`);

  return { data: { success: true } };
}

/**
 * Process funnel signup - grants access and records conversion
 */
export async function processFunnelSignup(funnelId: string, source?: string) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const supabase = createAdminClient();
  const adminSupabase = await createAdminClient();

  // Get funnel
  const { data: funnel, error: funnelError } = await supabase
    .from("funnels")
    .select("*, communities(*)")
    .eq("id", funnelId)
    .single();

  if (funnelError || !funnel) {
    return { error: "Funnel not found" };
  }

  // Only free funnels supported in MVP
  if (funnel.price_cents > 0) {
    return { error: "Paid funnels are not yet supported" };
  }

  // Get or create profile for this user
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("clerk_user_id", userId)
    .eq("community_id", funnel.community_id)
    .single();

  let profileData = existingProfile;

  if (!profileData) {
    // Create profile as FREE_MEMBER
    const { data: defaultTier } = await supabase
      .from("membership_tiers")
      .select("id")
      .eq("community_id", funnel.community_id)
      .eq("is_default", true)
      .single();

    const { data: newProfile, error: profileError } = await adminSupabase
      .from("profiles")
      .insert({
        clerk_user_id: userId,
        community_id: funnel.community_id,
        role: "FREE_MEMBER",
        tier: "FREE",
        membership_tier_id: defaultTier?.id || null,
      })
      .select()
      .single();

    if (profileError) {
      console.error("Failed to create profile:", profileError);
      return { error: "Failed to create profile" };
    }

    profileData = newProfile;
  }

  // Check if already converted
  const { data: existingConversion } = await supabase
    .from("funnel_conversions")
    .select("id")
    .eq("funnel_id", funnelId)
    .eq("profile_id", profileData.id)
    .single();

  if (existingConversion) {
    // Already converted, just redirect
    return {
      data: {
        alreadyConverted: true,
        redirectPath: funnel.redirect_path || "/feed",
        welcomeMessage: null,
      },
    };
  }

  // Grant content access if specific content
  if (funnel.content_type !== "community" && funnel.content_id) {
    const { error: grantError } = await adminSupabase
      .from("content_access_grants")
      .insert({
        profile_id: profileData.id,
        content_type: funnel.content_type,
        content_id: funnel.content_id,
        source: "funnel",
        granted_at: new Date().toISOString(),
      });

    if (grantError) {
      console.error("Failed to grant content access:", grantError);
      // Don't fail the whole signup, just log the error
    }
  }

  // Record conversion
  const { error: conversionError } = await adminSupabase
    .from("funnel_conversions")
    .insert({
      funnel_id: funnelId,
      profile_id: profileData.id,
      source: source || null,
    });

  if (conversionError) {
    console.error("Failed to record conversion:", conversionError);
  }

  // Increment signup count
  await adminSupabase.rpc("increment_funnel_signups", { funnel_uuid: funnelId });

  // Build redirect path
  let redirectPath = funnel.redirect_path || "/feed";
  
  // If content-specific funnel, redirect to the content
  if (funnel.content_type === "program" && funnel.content_id) {
    // Get program slug
    const { data: program } = await supabase
      .from("programs")
      .select("id")
      .eq("id", funnel.content_id)
      .single();
    
    if (program) {
      redirectPath = `/programs/${program.id}`;
    }
  } else if (funnel.content_type === "resource" && funnel.content_id) {
    redirectPath = `/resources`;
  }

  return {
    data: {
      alreadyConverted: false,
      redirectPath,
      welcomeMessage: funnel.welcome_message,
      communitySlug: funnel.communities?.slug,
    },
  };
}

/**
 * Check if current user has already converted on a funnel
 */
export async function checkFunnelConversion(funnelId: string, communityId: string) {
  const { userId } = await auth();
  
  if (!userId) {
    return { data: { hasConverted: false, hasProfile: false } };
  }

  const supabase = createAdminClient();

  // Check if user has a profile in this community
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_user_id", userId)
    .eq("community_id", communityId)
    .single();

  if (!profile) {
    return { data: { hasConverted: false, hasProfile: false } };
  }

  // Check if user has converted on this funnel
  const { data: conversion } = await supabase
    .from("funnel_conversions")
    .select("id")
    .eq("funnel_id", funnelId)
    .eq("profile_id", profile.id)
    .single();

  return {
    data: {
      hasConverted: !!conversion,
      hasProfile: true,
    },
  };
}

/**
 * Get funnel conversion stats (admin only)
 */
export async function getFunnelStats(funnelId: string, communitySlug: string) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const supabase = createAdminClient();

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

  // Get funnel
  const { data: funnel } = await supabase
    .from("funnels")
    .select("*")
    .eq("id", funnelId)
    .eq("community_id", community.id)
    .single();

  if (!funnel) {
    return { error: "Funnel not found" };
  }

  // Get recent conversions
  const { data: recentConversions } = await supabase
    .from("funnel_conversions")
    .select(`
      *,
      profile:profiles(id, display_name, avatar_url, email, created_at)
    `)
    .eq("funnel_id", funnelId)
    .order("converted_at", { ascending: false })
    .limit(20);

  const conversionRate = funnel.views_count > 0 
    ? ((funnel.signups_count / funnel.views_count) * 100).toFixed(1)
    : "0.0";

  return {
    data: {
      funnel,
      recentConversions: recentConversions || [],
      conversionRate,
    },
  };
}
