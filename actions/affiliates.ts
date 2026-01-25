"use server";

import { auth } from "@clerk/nextjs/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { generateReferralCode } from "@/lib/referral";

const MAX_CODE_GENERATION_ATTEMPTS = 5;

/**
 * Get or create a referral code for the current user
 * Uses lazy generation - only creates code when user views their affiliate dashboard
 */
export async function getOrCreateReferralCode(communitySlug: string) {
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

  // Get user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, referral_code")
    .eq("clerk_user_id", userId)
    .eq("community_id", community.id)
    .single();

  if (!profile) return { error: "Profile not found" };

  // Return existing code if present
  if (profile.referral_code) {
    return { data: { code: profile.referral_code } };
  }

  // Generate new code with collision handling
  for (let attempt = 0; attempt < MAX_CODE_GENERATION_ATTEMPTS; attempt++) {
    const newCode = generateReferralCode();

    // Check for collision within this community
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("community_id", community.id)
      .eq("referral_code", newCode)
      .single();

    if (!existing) {
      // No collision, save the code
      const { error: updateError } = await adminSupabase
        .from("profiles")
        .update({ referral_code: newCode })
        .eq("id", profile.id);

      if (updateError) {
        console.error("Failed to save referral code:", updateError);
        return { error: "Failed to generate referral code" };
      }

      return { data: { code: newCode } };
    }
  }

  return { error: "Failed to generate unique referral code" };
}

/**
 * Get affiliate stats for the current user
 */
export async function getAffiliateStats(communitySlug: string) {
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

  // Get user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, referral_code")
    .eq("clerk_user_id", userId)
    .eq("community_id", community.id)
    .single();

  if (!profile) return { error: "Profile not found" };

  // Get referral events
  const { data: events } = await supabase
    .from("referral_events")
    .select("*")
    .eq("referrer_profile_id", profile.id)
    .order("created_at", { ascending: false });

  const allEvents = events || [];

  // Calculate stats
  const signups = allEvents.filter((e) => e.event_type === "signup").length;
  const conversions = allEvents.filter((e) => e.event_type === "paid_conversion");
  const paidCount = conversions.length;

  const pendingCents = conversions
    .filter((e) => e.status === "pending")
    .reduce((sum, e) => sum + (e.commission_cents || 0), 0);

  const totalEarnedCents = conversions
    .reduce((sum, e) => sum + (e.commission_cents || 0), 0);

  return {
    data: {
      referralCode: profile.referral_code,
      signups,
      paidCount,
      pendingCents,
      totalEarnedCents,
      recentEvents: allEvents.slice(0, 10),
    },
  };
}

/**
 * Get affiliate settings for a community
 */
export async function getAffiliateSettings(communitySlug: string) {
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

  // Get settings (may not exist yet)
  const { data: settings } = await supabase
    .from("affiliate_settings")
    .select("*")
    .eq("community_id", community.id)
    .single();

  // Return defaults if no settings exist
  return {
    data: settings || {
      community_id: community.id,
      enabled: false,
      commission_rate: 20.0,
      paid_only: true,
    },
  };
}

/**
 * Update affiliate settings (admin only)
 */
export async function updateAffiliateSettings(
  communitySlug: string,
  settings: {
    enabled: boolean;
    commission_rate: number;
    paid_only: boolean;
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

  // Verify user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("clerk_user_id", userId)
    .eq("community_id", community.id)
    .single();

  if (profile?.role !== "ADMIN") {
    return { error: "Admin access required" };
  }

  // Upsert settings
  const { data, error } = await adminSupabase
    .from("affiliate_settings")
    .upsert(
      {
        community_id: community.id,
        enabled: settings.enabled,
        commission_rate: settings.commission_rate,
        paid_only: settings.paid_only,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "community_id" }
    )
    .select()
    .single();

  if (error) {
    console.error("Failed to update affiliate settings:", error);
    return { error: error.message };
  }

  revalidatePath(`/${communitySlug}/admin/settings`);
  revalidatePath(`/${communitySlug}/affiliate`);

  return { data };
}

/**
 * Record a referral signup (called when new user joins via referral link)
 * First-touch attribution: only set if not already referred
 */
export async function recordReferralSignup(
  communityId: string,
  referralCode: string,
  newProfileId: string
) {
  const adminSupabase = await createAdminClient();

  // Find referrer by code within this community
  const { data: referrer } = await adminSupabase
    .from("profiles")
    .select("id")
    .eq("community_id", communityId)
    .eq("referral_code", referralCode)
    .single();

  if (!referrer) {
    console.log("Referrer not found for code:", referralCode);
    return { error: "Invalid referral code" };
  }

  // Check if new profile already has a referrer (first-touch only)
  const { data: newProfile } = await adminSupabase
    .from("profiles")
    .select("id, referred_by_profile_id")
    .eq("id", newProfileId)
    .single();

  if (!newProfile) {
    return { error: "Profile not found" };
  }

  if (newProfile.referred_by_profile_id) {
    // Already has a referrer, don't overwrite
    return { data: { alreadyReferred: true } };
  }

  // Set the referrer on the new profile
  const { error: updateError } = await adminSupabase
    .from("profiles")
    .update({ referred_by_profile_id: referrer.id })
    .eq("id", newProfileId);

  if (updateError) {
    console.error("Failed to set referrer:", updateError);
    return { error: updateError.message };
  }

  // Create signup event
  const { error: eventError } = await adminSupabase
    .from("referral_events")
    .insert({
      community_id: communityId,
      referrer_profile_id: referrer.id,
      referred_profile_id: newProfileId,
      event_type: "signup",
      status: "pending",
    });

  if (eventError) {
    console.error("Failed to create referral event:", eventError);
    return { error: eventError.message };
  }

  return { data: { success: true } };
}

/**
 * Record a paid conversion (called on payment webhook or manual simulation)
 * This is the REAL conversion logic - used by both webhooks and simulateConversion
 */
export async function recordPaidConversion(
  profileId: string,
  amountCents: number
) {
  const adminSupabase = await createAdminClient();

  // Get the profile and their referrer
  const { data: profile } = await adminSupabase
    .from("profiles")
    .select("id, community_id, referred_by_profile_id")
    .eq("id", profileId)
    .single();

  if (!profile) {
    return { error: "Profile not found" };
  }

  if (!profile.referred_by_profile_id) {
    // No referrer, nothing to do
    return { data: { noReferrer: true } };
  }

  // Get affiliate settings
  const { data: settings } = await adminSupabase
    .from("affiliate_settings")
    .select("*")
    .eq("community_id", profile.community_id)
    .single();

  if (!settings?.enabled) {
    return { data: { affiliateDisabled: true } };
  }

  // Calculate commission
  const commissionRate = settings.commission_rate || 20;
  const commissionCents = Math.floor((amountCents * commissionRate) / 100);

  // Check for existing conversion event (prevent duplicates)
  const { data: existing } = await adminSupabase
    .from("referral_events")
    .select("id")
    .eq("referred_profile_id", profileId)
    .eq("event_type", "paid_conversion")
    .single();

  if (existing) {
    return { data: { alreadyConverted: true } };
  }

  // Create conversion event
  const { error: eventError } = await adminSupabase
    .from("referral_events")
    .insert({
      community_id: profile.community_id,
      referrer_profile_id: profile.referred_by_profile_id,
      referred_profile_id: profileId,
      event_type: "paid_conversion",
      amount_cents: amountCents,
      commission_cents: commissionCents,
      status: "pending",
    });

  if (eventError) {
    console.error("Failed to create conversion event:", eventError);
    return { error: eventError.message };
  }

  return {
    data: {
      success: true,
      commissionCents,
    },
  };
}

/**
 * Simulate a paid conversion for demo testing (master admin only)
 * This creates both a signup event and conversion event if needed
 */
export async function simulateConversion(
  communityId: string,
  referredProfileId: string,
  amountCents: number
) {
  // Import here to avoid circular dependency
  const { requireMasterAdmin } = await import("@/lib/master-admin");
  await requireMasterAdmin();

  // Use the real conversion logic
  const result = await recordPaidConversion(referredProfileId, amountCents);
  return result;
}

/**
 * Get members for a community with referral status (for simulate conversion UI)
 */
export async function getMembersForConversionSimulation(communityId: string) {
  // Import here to avoid circular dependency
  const { requireMasterAdmin } = await import("@/lib/master-admin");
  await requireMasterAdmin();

  const adminSupabase = await createAdminClient();

  // Get profiles with their referral info
  const { data: profiles, error } = await adminSupabase
    .from("profiles")
    .select(`
      id,
      display_name,
      email,
      tier,
      referred_by_profile_id,
      referrer:profiles!profiles_referred_by_profile_id_fkey(
        id,
        display_name,
        email
      )
    `)
    .eq("community_id", communityId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Failed to get members for simulation:", error);
    return { error: error.message };
  }

  return { data: profiles };
}
