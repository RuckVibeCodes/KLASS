import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createPlatformPortalSession } from "@/lib/stripe/platform";
import { createCustomerPortalSession } from "@/lib/stripe/tiers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, communitySlug, communityId, profileId } = await req.json();

    const supabase = createAdminClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (type === "platform") {
      // Platform billing portal (for community creator paying KLASS)
      const { data: platformSub } = await supabase
        .from("platform_subscriptions")
        .select("stripe_customer_id")
        .eq("clerk_user_id", userId)
        .eq("status", "active")
        .single();

      if (!platformSub?.stripe_customer_id) {
        return NextResponse.json(
          { error: "No active platform subscription found" },
          { status: 404 }
        );
      }

      const result = await createPlatformPortalSession(
        platformSub.stripe_customer_id,
        `${appUrl}/system-admin/billing`
      );

      if (!result) {
        return NextResponse.json(
          { error: "Failed to create portal session" },
          { status: 500 }
        );
      }

      return NextResponse.json({ url: result.url });
    } else {
      // Community member billing portal (member managing their subscription)
      if (!communitySlug && !communityId) {
        return NextResponse.json(
          { error: "Missing communitySlug or communityId" },
          { status: 400 }
        );
      }

      // Find the member's subscription
      let query = supabase
        .from("subscriptions")
        .select("stripe_customer_id")
        .eq("status", "active");

      if (profileId) {
        query = query.eq("profile_id", profileId);
      }

      const { data: subscription } = await query.single();

      if (!subscription?.stripe_customer_id) {
        return NextResponse.json(
          { error: "No active subscription found" },
          { status: 404 }
        );
      }

      const returnUrl = communitySlug
        ? `${appUrl}/${communitySlug}/account/subscription`
        : `${appUrl}`;

      const result = await createCustomerPortalSession(
        subscription.stripe_customer_id,
        returnUrl
      );

      if (!result) {
        return NextResponse.json(
          { error: "Failed to create portal session" },
          { status: 500 }
        );
      }

      return NextResponse.json({ url: result.url });
    }
  } catch (error) {
    console.error("Portal session error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
