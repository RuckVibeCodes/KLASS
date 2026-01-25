import { stripe } from "./client";
import type { ContentType } from "@/types/database";

/**
 * Create or update a Stripe product and price for content
 * Returns null if Stripe is not configured (demo mode)
 */
export async function syncContentToStripe(
  contentType: ContentType,
  contentId: string,
  name: string,
  description: string,
  priceCents: number,
  existingProductId?: string | null
): Promise<{ productId: string; priceId: string } | null> {
  // If Stripe is not configured, return null (demo mode)
  if (!stripe) {
    console.log("Stripe not configured - running in demo mode");
    return null;
  }

  try {
    let productId = existingProductId;

    // Create or update product
    if (productId) {
      // Update existing product
      await stripe.products.update(productId, {
        name,
        description: description || undefined,
        metadata: {
          content_type: contentType,
          content_id: contentId,
        },
      });
    } else {
      // Create new product
      const product = await stripe.products.create({
        name,
        description: description || undefined,
        metadata: {
          content_type: contentType,
          content_id: contentId,
        },
      });
      productId = product.id;
    }

    // Always create a new price (Stripe prices are immutable)
    const price = await stripe.prices.create({
      product: productId,
      unit_amount: priceCents,
      currency: "usd",
      metadata: {
        content_type: contentType,
        content_id: contentId,
      },
    });

    return {
      productId,
      priceId: price.id,
    };
  } catch (error) {
    console.error("Failed to sync content to Stripe:", error);
    return null;
  }
}

/**
 * Create a checkout session for purchasing content
 */
export async function createContentCheckoutSession(
  contentType: ContentType,
  contentId: string,
  priceId: string,
  profileId: string,
  communityId: string,
  communitySlug: string,
  successUrl: string,
  cancelUrl: string
): Promise<{ url: string } | null> {
  if (!stripe) {
    console.log("Stripe not configured - cannot create checkout session");
    return null;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        profile_id: profileId,
        community_id: communityId,
        community_slug: communitySlug,
        content_type: contentType,
        content_id: contentId,
        purchase_type: "one_time",
      },
    });

    return { url: session.url || "" };
  } catch (error) {
    console.error("Failed to create checkout session:", error);
    return null;
  }
}

/**
 * Check if Stripe is configured
 */
export function isStripeConfigured(): boolean {
  return stripe !== null;
}
