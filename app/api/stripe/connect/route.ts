import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  createConnectAccount,
  createConnectOnboardingLink,
  createConnectLoginLink,
} from "@/lib/stripe/connect";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/stripe/connect
 * Create or resume Stripe Connect onboarding for a community creator
 */
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { communityId, communitySlug, action } = await req.json();

    if (!communityId || !communitySlug) {
      return NextResponse.json(
        { error: "Missing communityId or communitySlug" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Verify user is admin of this community
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("clerk_user_id", userId)
      .eq("community_id", communityId)
      .single();

    if (!profile || profile.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only community admins can manage Stripe Connect" },
        { status: 403 }
      );
    }

    // Check if already connected
    const { data: existing } = await supabase
      .from("stripe_connect_accounts")
      .select("*")
      .eq("community_id", communityId)
      .single();

    // Action: dashboard — open Stripe Express dashboard
    if (action === "dashboard" && existing?.stripe_account_id) {
      const loginLink = await createConnectLoginLink(existing.stripe_account_id);
      if (!loginLink) {
        return NextResponse.json(
          { error: "Failed to create dashboard link" },
          { status: 500 }
        );
      }
      return NextResponse.json({ url: loginLink.url });
    }

    // Action: onboard or resume onboarding
    if (existing?.stripe_account_id && !existing.onboarding_complete) {
      // Resume onboarding
      const link = await createConnectOnboardingLink(
        existing.stripe_account_id,
        `${appUrl}/${communitySlug}/admin/settings?connect=success`,
        `${appUrl}/${communitySlug}/admin/settings?connect=refresh`
      );

      if (!link) {
        return NextResponse.json(
          { error: "Failed to create onboarding link" },
          { status: 500 }
        );
      }

      return NextResponse.json({ url: link.url, accountId: existing.stripe_account_id });
    }

    if (existing?.onboarding_complete) {
      return NextResponse.json({
        message: "Already connected",
        accountId: existing.stripe_account_id,
        charges_enabled: existing.charges_enabled,
        payouts_enabled: existing.payouts_enabled,
      });
    }

    // Get community name
    const { data: community } = await supabase
      .from("communities")
      .select("name")
      .eq("id", communityId)
      .single();

    // Create new Connect account
    const email = user.emailAddresses[0]?.emailAddress || "";
    const result = await createConnectAccount(
      communityId,
      community?.name || "Community",
      email
    );

    if (!result) {
      return NextResponse.json(
        { error: "Failed to create Stripe Connect account" },
        { status: 500 }
      );
    }

    // Store in database
    await supabase.from("stripe_connect_accounts").insert({
      community_id: communityId,
      stripe_account_id: result.accountId,
      clerk_user_id: userId,
    });

    // Create onboarding link
    const link = await createConnectOnboardingLink(
      result.accountId,
      `${appUrl}/${communitySlug}/admin/settings?connect=success`,
      `${appUrl}/${communitySlug}/admin/settings?connect=refresh`
    );

    if (!link) {
      return NextResponse.json(
        { error: "Failed to create onboarding link" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: link.url,
      accountId: result.accountId,
    });
  } catch (error) {
    console.error("Stripe Connect error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Failed to setup Stripe Connect" },
      { status: 500 }
    );
  }
}
