import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/server";

/**
 * Founders Checkout API
 * 
 * Creates a one-time payment checkout for founding member lifetime access.
 * Uses Stripe Price ID from environment or creates inline price.
 * 
 * ENV VARS NEEDED:
 * - STRIPE_SECRET_KEY
 * - STRIPE_FOUNDER_PRICE_ID (optional - creates inline if not set)
 * - NEXT_PUBLIC_APP_URL
 */
export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("clerk_user_id", userId)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found. Please complete onboarding first." },
        { status: 404 }
      );
    }

    // Check if already a founder (has founding_member tier)
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("status, tier")
      .eq("profile_id", profile.id)
      .in("status", ["active", "trialing"])
      .eq("tier", "founding_member")
      .single();

    if (subscription) {
      return NextResponse.json(
        { error: "You're already a founding member! Check your dashboard." },
        { status: 400 }
      );
    }

    // Get Stripe price - prefer env var, fallback to creating inline price
    const founderPriceId = process.env.STRIPE_FOUNDER_PRICE_ID;
    
    let priceId = founderPriceId;

    // If no price ID configured, create an inline price for $297 one-time
    if (!priceId) {
      const price = await stripe.prices.create({
        currency: "usd",
        unit_amount: 29700, // $297.00 in cents
        product_data: {
          name: "KLASS Founding Member - Lifetime Access",
        },
      });
      priceId = price.id;
    }

    // For a true one-time payment, we'd need to set up a Product in Stripe
    // and pass its price ID via STRIPE_FOUNDER_PRICE_ID env var
    // This is the recommended approach for production

    // For now, create a checkout session (assumes price ID is configured)
    const session = await stripe.checkout.sessions.create({
      mode: "payment", // one-time payment
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success&type=founder`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/founders?checkout=cancel`,
      metadata: {
        profile_id: profile.id,
        clerk_user_id: userId,
        type: "founding_member",
      },
      // Customer email for faster checkout
      customer_email: profile.email,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Founders checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}