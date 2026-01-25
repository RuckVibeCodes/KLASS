import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(supabase, session);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(supabase, subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(supabase, subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(supabase, invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoiceFailed(supabase, invoice);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(
  supabase: any,
  session: Stripe.Checkout.Session
) {
  const profileId = session.metadata?.profile_id;
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  if (!profileId) {
    console.error("No profile_id in session metadata");
    return;
  }

  // Create or update subscription record
  await supabase.from("subscriptions").upsert(
    {
      profile_id: profileId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      status: "active",
    },
    { onConflict: "stripe_subscription_id" }
  );

  // Update profile tier
  await supabase
    .from("profiles")
    .update({ tier: "PAID" })
    .eq("id", profileId);
}

async function handleSubscriptionUpdated(
  supabase: any,
  subscription: Stripe.Subscription
) {
  const profileId = subscription.metadata?.profile_id;

  if (!profileId) {
    // Try to find by stripe_subscription_id
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("profile_id")
      .eq("stripe_subscription_id", subscription.id)
      .single();

    if (!existingSub) {
      console.error("No subscription found for:", subscription.id);
      return;
    }
  }

  const status = mapStripeStatus(subscription.status);

  const updateData: Record<string, unknown> = {
    status,
    cancel_at_period_end: subscription.cancel_at_period_end,
  };

  // Handle current_period fields which may not exist on all subscription objects
  if ("current_period_start" in subscription && subscription.current_period_start) {
    updateData.current_period_start = new Date(
      (subscription.current_period_start as number) * 1000
    ).toISOString();
  }
  if ("current_period_end" in subscription && subscription.current_period_end) {
    updateData.current_period_end = new Date(
      (subscription.current_period_end as number) * 1000
    ).toISOString();
  }

  await supabase
    .from("subscriptions")
    .update(updateData)
    .eq("stripe_subscription_id", subscription.id);

  // Update profile tier based on status
  const targetId =
    profileId ||
    (
      await supabase
        .from("subscriptions")
        .select("profile_id")
        .eq("stripe_subscription_id", subscription.id)
        .single()
    ).data?.profile_id;

  if (targetId) {
    const tier = status === "active" || status === "trialing" ? "PAID" : "FREE";
    await supabase.from("profiles").update({ tier }).eq("id", targetId);
  }
}

async function handleSubscriptionDeleted(
  supabase: any,
  subscription: Stripe.Subscription
) {
  // Get profile from subscription
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("profile_id")
    .eq("stripe_subscription_id", subscription.id)
    .single();

  if (sub?.profile_id) {
    // Update profile tier to FREE
    await supabase
      .from("profiles")
      .update({ tier: "FREE" })
      .eq("id", sub.profile_id);
  }

  // Update subscription status
  await supabase
    .from("subscriptions")
    .update({ status: "canceled" })
    .eq("stripe_subscription_id", subscription.id);
}

async function handleInvoicePaid(supabase: any, invoice: Stripe.Invoice) {
  // Subscription renewals are handled here
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subscriptionId = (invoice as any).subscription;
  if (subscriptionId) {
    await supabase
      .from("subscriptions")
      .update({ status: "active" })
      .eq("stripe_subscription_id", subscriptionId);
  }
}

async function handleInvoiceFailed(supabase: any, invoice: Stripe.Invoice) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subscriptionId = (invoice as any).subscription;
  if (subscriptionId) {
    await supabase
      .from("subscriptions")
      .update({ status: "past_due" })
      .eq("stripe_subscription_id", subscriptionId);
  }
}

function mapStripeStatus(
  status: Stripe.Subscription.Status
): "active" | "past_due" | "canceled" | "incomplete" | "trialing" {
  switch (status) {
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
    case "unpaid":
      return "canceled";
    case "incomplete":
    case "incomplete_expired":
      return "incomplete";
    case "trialing":
      return "trialing";
    default:
      return "incomplete";
  }
}
