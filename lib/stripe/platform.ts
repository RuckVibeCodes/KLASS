import { stripe } from "./client";
import type { PlatformPlan } from "@/types/database";
import { PLATFORM_PLANS } from "@/types/database";

/**
 * Platform plan price IDs - set in Stripe Dashboard and mapped via env vars.
 * Falls back to creating prices dynamically if not set.
 */
export function getPlatformPriceId(plan: PlatformPlan): string | null {
  const envMap: Record<PlatformPlan, string | undefined> = {
    diy: process.env.STRIPE_PRICE_PLATFORM_DIY,
    done_with_you: process.env.STRIPE_PRICE_PLATFORM_DWY,
    done_for_you: process.env.STRIPE_PRICE_PLATFORM_DFY,
  };
  return envMap[plan] || null;
}

/**
 * Create a Stripe Checkout session for a platform subscription
 */
export async function createPlatformCheckoutSession({
  plan,
  clerkUserId,
  communityId,
  customerEmail,
  successUrl,
  cancelUrl,
}: {
  plan: PlatformPlan;
  clerkUserId: string;
  communityId: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ url: string } | null> {
  if (!stripe) {
    console.log("Stripe not configured - cannot create platform checkout");
    return null;
  }

  const priceId = getPlatformPriceId(plan);
  if (!priceId) {
    console.error(`No price ID configured for platform plan: ${plan}`);
    return null;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: customerEmail,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      subscription_data: {
        metadata: {
          clerk_user_id: clerkUserId,
          community_id: communityId,
          platform_plan: plan,
          subscription_type: "platform",
        },
      },
      metadata: {
        clerk_user_id: clerkUserId,
        community_id: communityId,
        platform_plan: plan,
        subscription_type: "platform",
      },
    });

    return { url: session.url || "" };
  } catch (error) {
    console.error("Failed to create platform checkout session:", error);
    return null;
  }
}

/**
 * Create a Stripe Customer Portal session for managing platform billing
 */
export async function createPlatformPortalSession(
  stripeCustomerId: string,
  returnUrl: string
): Promise<{ url: string } | null> {
  if (!stripe) {
    console.log("Stripe not configured - cannot create portal session");
    return null;
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
    });

    return { url: session.url };
  } catch (error) {
    console.error("Failed to create platform portal session:", error);
    return null;
  }
}

/**
 * Get plan details for display
 */
export function getPlanDetails(plan: PlatformPlan) {
  return PLATFORM_PLANS[plan];
}
