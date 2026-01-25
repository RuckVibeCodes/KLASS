import { stripe } from "./client";
import type { MembershipTier, BillingCycle } from "@/types/database";

/**
 * Create or update a Stripe product and prices for a membership tier
 * Returns null if Stripe is not configured (demo mode)
 */
export async function syncTierToStripe(
  tier: MembershipTier,
  communityId: string,
  communityName: string
): Promise<{
  productId: string;
  priceIdMonthly: string | null;
  priceIdYearly: string | null;
} | null> {
  // If Stripe is not configured, return null (demo mode)
  if (!stripe) {
    console.log("Stripe not configured - running in demo mode");
    return null;
  }

  try {
    let productId = tier.stripe_product_id;

    // Create or update product
    if (productId) {
      // Update existing product
      await stripe.products.update(productId, {
        name: `${communityName} - ${tier.name}`,
        description: tier.description || `${tier.name} membership tier`,
        metadata: {
          tier_id: tier.id,
          community_id: communityId,
          tier_slug: tier.slug,
          tier_level: String(tier.tier_level),
        },
      });
    } else {
      // Create new product
      const product = await stripe.products.create({
        name: `${communityName} - ${tier.name}`,
        description: tier.description || `${tier.name} membership tier`,
        metadata: {
          tier_id: tier.id,
          community_id: communityId,
          tier_slug: tier.slug,
          tier_level: String(tier.tier_level),
        },
      });
      productId = product.id;
    }

    let priceIdMonthly: string | null = null;
    let priceIdYearly: string | null = null;

    // Create monthly price if tier has a monthly price
    if (tier.price_cents_monthly > 0) {
      const monthlyPrice = await stripe.prices.create({
        product: productId,
        unit_amount: tier.price_cents_monthly,
        currency: "usd",
        recurring: {
          interval: "month",
        },
        metadata: {
          tier_id: tier.id,
          community_id: communityId,
          billing_cycle: "monthly",
        },
      });
      priceIdMonthly = monthlyPrice.id;
    }

    // Create yearly price if tier has a yearly price
    if (tier.price_cents_yearly > 0) {
      const yearlyPrice = await stripe.prices.create({
        product: productId,
        unit_amount: tier.price_cents_yearly,
        currency: "usd",
        recurring: {
          interval: "year",
        },
        metadata: {
          tier_id: tier.id,
          community_id: communityId,
          billing_cycle: "yearly",
        },
      });
      priceIdYearly = yearlyPrice.id;
    }

    return {
      productId,
      priceIdMonthly,
      priceIdYearly,
    };
  } catch (error) {
    console.error("Failed to sync tier to Stripe:", error);
    return null;
  }
}

/**
 * Create a checkout session for subscribing to a tier
 */
export async function createTierCheckoutSession(
  tier: MembershipTier,
  billingCycle: BillingCycle,
  profileId: string,
  communityId: string,
  communitySlug: string,
  customerEmail: string,
  successUrl: string,
  cancelUrl: string
): Promise<{ url: string } | null> {
  if (!stripe) {
    console.log("Stripe not configured - cannot create checkout session");
    return null;
  }

  const priceId =
    billingCycle === "monthly"
      ? tier.stripe_price_id_monthly
      : tier.stripe_price_id_yearly;

  if (!priceId) {
    console.error(`No ${billingCycle} price ID for tier ${tier.id}`);
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
          profile_id: profileId,
          community_id: communityId,
          community_slug: communitySlug,
          tier_id: tier.id,
          tier_slug: tier.slug,
          billing_cycle: billingCycle,
        },
      },
      metadata: {
        profile_id: profileId,
        community_id: communityId,
        community_slug: communitySlug,
        tier_id: tier.id,
        tier_slug: tier.slug,
        billing_cycle: billingCycle,
        purchase_type: "tier_subscription",
      },
    });

    return { url: session.url || "" };
  } catch (error) {
    console.error("Failed to create tier checkout session:", error);
    return null;
  }
}

/**
 * Create a customer portal session for managing subscriptions
 */
export async function createCustomerPortalSession(
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
    console.error("Failed to create portal session:", error);
    return null;
  }
}

/**
 * Update a subscription to a different tier
 */
export async function updateSubscriptionTier(
  subscriptionId: string,
  newTier: MembershipTier,
  billingCycle: BillingCycle
): Promise<boolean> {
  if (!stripe) {
    console.log("Stripe not configured - cannot update subscription");
    return false;
  }

  const priceId =
    billingCycle === "monthly"
      ? newTier.stripe_price_id_monthly
      : newTier.stripe_price_id_yearly;

  if (!priceId) {
    console.error(`No ${billingCycle} price ID for tier ${newTier.id}`);
    return false;
  }

  try {
    // Get current subscription to find the item ID
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const itemId = subscription.items.data[0]?.id;

    if (!itemId) {
      console.error("No subscription item found");
      return false;
    }

    // Update the subscription
    await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: itemId,
          price: priceId,
        },
      ],
      proration_behavior: "create_prorations",
      metadata: {
        tier_id: newTier.id,
        tier_slug: newTier.slug,
        billing_cycle: billingCycle,
      },
    });

    return true;
  } catch (error) {
    console.error("Failed to update subscription:", error);
    return false;
  }
}

/**
 * Cancel a subscription at period end
 */
export async function cancelSubscription(
  subscriptionId: string
): Promise<boolean> {
  if (!stripe) {
    console.log("Stripe not configured - cannot cancel subscription");
    return false;
  }

  try {
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
    return true;
  } catch (error) {
    console.error("Failed to cancel subscription:", error);
    return false;
  }
}

/**
 * Reactivate a subscription that was set to cancel
 */
export async function reactivateSubscription(
  subscriptionId: string
): Promise<boolean> {
  if (!stripe) {
    console.log("Stripe not configured - cannot reactivate subscription");
    return false;
  }

  try {
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
    return true;
  } catch (error) {
    console.error("Failed to reactivate subscription:", error);
    return false;
  }
}
