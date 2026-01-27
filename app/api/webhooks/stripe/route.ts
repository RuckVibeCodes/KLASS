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
    console.error("Webhook signature verification failed:", err instanceof Error ? err.message : "Unknown error");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.metadata?.subscription_type === "platform") {
          await handlePlatformCheckoutCompleted(supabase, session);
        } else {
          await handleCheckoutCompleted(supabase, session);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        if (subscription.metadata?.subscription_type === "platform") {
          await handlePlatformSubscriptionUpdated(supabase, subscription);
        } else {
          await handleSubscriptionUpdated(supabase, subscription);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        if (subscription.metadata?.subscription_type === "platform") {
          await handlePlatformSubscriptionDeleted(supabase, subscription);
        } else {
          await handleSubscriptionDeleted(supabase, subscription);
        }
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

      // Stripe Connect events
      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        await handleConnectAccountUpdated(supabase, account);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

// ============================================
// PLATFORM SUBSCRIPTION HANDLERS
// ============================================

async function handlePlatformCheckoutCompleted(
  supabase: ReturnType<typeof createAdminClient>,
  session: Stripe.Checkout.Session
) {
  const clerkUserId = session.metadata?.clerk_user_id;
  const communityId = session.metadata?.community_id;
  const plan = session.metadata?.platform_plan;
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  if (!clerkUserId || !communityId || !plan) {
    console.error("Missing metadata in platform checkout session");
    return;
  }

  // Create or update platform subscription
  await supabase.from("platform_subscriptions").upsert(
    {
      community_id: communityId,
      clerk_user_id: clerkUserId,
      plan,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      status: "active",
    },
    { onConflict: "stripe_subscription_id" }
  );

  // Update community platform plan
  await supabase
    .from("communities")
    .update({ platform_plan: plan, billing_status: "active" })
    .eq("id", communityId);
}

async function handlePlatformSubscriptionUpdated(
  supabase: ReturnType<typeof createAdminClient>,
  subscription: Stripe.Subscription
) {
  const status = mapStripeStatus(subscription.status);

  const updateData: Record<string, unknown> = {
    status,
    cancel_at_period_end: subscription.cancel_at_period_end,
  };

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
    .from("platform_subscriptions")
    .update(updateData)
    .eq("stripe_subscription_id", subscription.id);

  // Update community billing status
  const { data: platSub } = await supabase
    .from("platform_subscriptions")
    .select("community_id")
    .eq("stripe_subscription_id", subscription.id)
    .single();

  if (platSub?.community_id) {
    const billingStatus =
      status === "active" || status === "trialing" ? "active" : status === "past_due" ? "past_due" : "canceled";
    await supabase
      .from("communities")
      .update({ billing_status: billingStatus })
      .eq("id", platSub.community_id);
  }
}

async function handlePlatformSubscriptionDeleted(
  supabase: ReturnType<typeof createAdminClient>,
  subscription: Stripe.Subscription
) {
  await supabase
    .from("platform_subscriptions")
    .update({ status: "canceled" })
    .eq("stripe_subscription_id", subscription.id);

  const { data: platSub } = await supabase
    .from("platform_subscriptions")
    .select("community_id")
    .eq("stripe_subscription_id", subscription.id)
    .single();

  if (platSub?.community_id) {
    await supabase
      .from("communities")
      .update({ billing_status: "canceled" })
      .eq("id", platSub.community_id);
  }
}

// ============================================
// COMMUNITY MEMBER SUBSCRIPTION HANDLERS
// ============================================

async function handleCheckoutCompleted(
  supabase: ReturnType<typeof createAdminClient>,
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
  supabase: ReturnType<typeof createAdminClient>,
  subscription: Stripe.Subscription
) {
  const profileId = subscription.metadata?.profile_id;

  if (!profileId) {
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
  supabase: ReturnType<typeof createAdminClient>,
  subscription: Stripe.Subscription
) {
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("profile_id")
    .eq("stripe_subscription_id", subscription.id)
    .single();

  if (sub?.profile_id) {
    await supabase
      .from("profiles")
      .update({ tier: "FREE" })
      .eq("id", sub.profile_id);
  }

  await supabase
    .from("subscriptions")
    .update({ status: "canceled" })
    .eq("stripe_subscription_id", subscription.id);
}

async function handleInvoicePaid(
  supabase: ReturnType<typeof createAdminClient>,
  invoice: Stripe.Invoice
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subscriptionId = (invoice as any).subscription;
  if (subscriptionId) {
    // Update both member and platform subscriptions
    await supabase
      .from("subscriptions")
      .update({ status: "active" })
      .eq("stripe_subscription_id", subscriptionId);

    await supabase
      .from("platform_subscriptions")
      .update({ status: "active" })
      .eq("stripe_subscription_id", subscriptionId);
  }
}

async function handleInvoiceFailed(
  supabase: ReturnType<typeof createAdminClient>,
  invoice: Stripe.Invoice
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subscriptionId = (invoice as any).subscription;
  if (subscriptionId) {
    await supabase
      .from("subscriptions")
      .update({ status: "past_due" })
      .eq("stripe_subscription_id", subscriptionId);

    await supabase
      .from("platform_subscriptions")
      .update({ status: "past_due" })
      .eq("stripe_subscription_id", subscriptionId);
  }
}

// ============================================
// STRIPE CONNECT HANDLERS
// ============================================

async function handleConnectAccountUpdated(
  supabase: ReturnType<typeof createAdminClient>,
  account: Stripe.Account
) {
  await supabase
    .from("stripe_connect_accounts")
    .update({
      charges_enabled: account.charges_enabled || false,
      payouts_enabled: account.payouts_enabled || false,
      details_submitted: account.details_submitted || false,
      onboarding_complete:
        (account.charges_enabled && account.details_submitted) || false,
    })
    .eq("stripe_account_id", account.id);
}

// ============================================
// HELPERS
// ============================================

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
