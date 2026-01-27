"use server";

import { auth } from "@clerk/nextjs/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { syncContentToStripe } from "@/lib/stripe/products";
import type { ContentType } from "@/types/database";

/**
 * Update community membership pricing
 */
export async function updateCommunityPricing(
  communityId: string,
  communitySlug: string,
  priceCents: number
) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const supabase = await createClient();
  const adminSupabase = await createAdminClient();

  // Verify admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("clerk_user_id", userId)
    .eq("community_id", communityId)
    .single();

  if (profile?.role !== "ADMIN") {
    return { error: "Admin access required" };
  }

  // Get community for Stripe sync
  const { data: community } = await supabase
    .from("communities")
    .select("id, name, description, stripe_product_id")
    .eq("id", communityId)
    .single();

  if (!community) return { error: "Community not found" };

  // Sync to Stripe if price > 0
  let stripeProductId = community.stripe_product_id;
  let stripePriceId: string | null = null;

  if (priceCents > 0) {
    const stripeResult = await syncContentToStripe(
      "community",
      communityId,
      `${community.name} Membership`,
      community.description || "",
      priceCents,
      stripeProductId
    );
    if (stripeResult) {
      stripeProductId = stripeResult.productId;
      stripePriceId = stripeResult.priceId;
    }
  }

  // Update community
  const { error } = await adminSupabase
    .from("communities")
    .update({
      membership_price_cents: priceCents,
      stripe_product_id: stripeProductId,
      stripe_price_id: stripePriceId,
    })
    .eq("id", communityId);

  if (error) {
    console.error("Failed to update community pricing:", error.message);
    return { error: "Failed to update community pricing" };
  }

  revalidatePath(`/${communitySlug}/admin/settings`);
  return { data: { success: true } };
}

/**
 * Update program pricing with grandfathering
 */
export async function updateProgramPricing(
  programId: string,
  communitySlug: string,
  priceCents: number
) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const supabase = await createClient();
  const adminSupabase = await createAdminClient();

  // Get program with community
  const { data: program } = await supabase
    .from("programs")
    .select("*, community:communities(id, slug)")
    .eq("id", programId)
    .single();

  if (!program) return { error: "Program not found" };

  const communityId = program.community_id;

  // Verify admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("clerk_user_id", userId)
    .eq("community_id", communityId)
    .single();

  if (profile?.role !== "ADMIN") {
    return { error: "Admin access required" };
  }

  // GRANDFATHERING: If setting a new price, grant access to existing paid members
  const currentPrice = program.price_cents || 0;
  if (priceCents > 0 && currentPrice === 0) {
    // Price is being set for the first time - grandfather existing paid members
    const { data: paidMembers } = await adminSupabase
      .from("profiles")
      .select("id")
      .eq("community_id", communityId)
      .eq("tier", "PAID");

    if (paidMembers && paidMembers.length > 0) {
      // Create grants for paid members who don't already have one
      const grants = paidMembers.map((member) => ({
        profile_id: member.id,
        content_type: "program" as const,
        content_id: programId,
        source: "subscription" as const,
        granted_by_profile_id: profile.id,
        notes: "Grandfathered when pricing was added",
      }));

      await adminSupabase
        .from("content_access_grants")
        .upsert(grants, { onConflict: "profile_id,content_type,content_id" });
    }
  }

  // Sync to Stripe if price > 0
  let stripeProductId = program.stripe_product_id;
  let stripePriceId: string | null = null;

  if (priceCents > 0) {
    const stripeResult = await syncContentToStripe(
      "program",
      programId,
      program.title,
      program.description || "",
      priceCents,
      stripeProductId
    );
    if (stripeResult) {
      stripeProductId = stripeResult.productId;
      stripePriceId = stripeResult.priceId;
    }
  }

  // Update program
  const { error } = await adminSupabase
    .from("programs")
    .update({
      price_cents: priceCents,
      stripe_product_id: stripeProductId,
      stripe_price_id: stripePriceId,
    })
    .eq("id", programId);

  if (error) {
    console.error("Failed to update program pricing:", error.message);
    return { error: "Failed to update program pricing" };
  }

  revalidatePath(`/${communitySlug}/programs`);
  revalidatePath(`/${communitySlug}/programs/${programId}`);
  revalidatePath(`/${communitySlug}/admin/content/programs`);
  return { data: { success: true } };
}

/**
 * Update resource pricing with grandfathering
 */
export async function updateResourcePricing(
  resourceId: string,
  communitySlug: string,
  priceCents: number
) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const supabase = await createClient();
  const adminSupabase = await createAdminClient();

  // Get resource with community
  const { data: resource } = await supabase
    .from("resources")
    .select("*")
    .eq("id", resourceId)
    .single();

  if (!resource) return { error: "Resource not found" };

  const communityId = resource.community_id;

  // Verify admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("clerk_user_id", userId)
    .eq("community_id", communityId)
    .single();

  if (profile?.role !== "ADMIN") {
    return { error: "Admin access required" };
  }

  // GRANDFATHERING: If setting a new price, grant access to existing paid members
  const currentPrice = resource.price_cents || 0;
  if (priceCents > 0 && currentPrice === 0) {
    const { data: paidMembers } = await adminSupabase
      .from("profiles")
      .select("id")
      .eq("community_id", communityId)
      .eq("tier", "PAID");

    if (paidMembers && paidMembers.length > 0) {
      const grants = paidMembers.map((member) => ({
        profile_id: member.id,
        content_type: "resource" as const,
        content_id: resourceId,
        source: "subscription" as const,
        granted_by_profile_id: profile.id,
        notes: "Grandfathered when pricing was added",
      }));

      await adminSupabase
        .from("content_access_grants")
        .upsert(grants, { onConflict: "profile_id,content_type,content_id" });
    }
  }

  // Sync to Stripe if price > 0
  let stripeProductId = resource.stripe_product_id;
  let stripePriceId: string | null = null;

  if (priceCents > 0) {
    const stripeResult = await syncContentToStripe(
      "resource",
      resourceId,
      resource.title,
      resource.description || "",
      priceCents,
      stripeProductId
    );
    if (stripeResult) {
      stripeProductId = stripeResult.productId;
      stripePriceId = stripeResult.priceId;
    }
  }

  // Update resource
  const { error } = await adminSupabase
    .from("resources")
    .update({
      price_cents: priceCents,
      stripe_product_id: stripeProductId,
      stripe_price_id: stripePriceId,
    })
    .eq("id", resourceId);

  if (error) {
    console.error("Failed to update resource pricing:", error.message);
    return { error: "Failed to update resource pricing" };
  }

  revalidatePath(`/${communitySlug}/resources`);
  revalidatePath(`/${communitySlug}/admin/resources`);
  return { data: { success: true } };
}

/**
 * Get pricing settings for the payments page
 */
export async function getPricingSettings(communitySlug: string) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const supabase = await createClient();

  // Get community
  const { data: community } = await supabase
    .from("communities")
    .select("id, membership_price_cents, stripe_product_id, stripe_price_id")
    .eq("slug", communitySlug)
    .single();

  if (!community) return { error: "Community not found" };

  return {
    data: {
      membershipPriceCents: community.membership_price_cents || 0,
      stripeProductId: community.stripe_product_id,
      stripePriceId: community.stripe_price_id,
    },
  };
}
