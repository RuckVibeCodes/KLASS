import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/stripe/connect/webhook
 *
 * Dedicated webhook endpoint for Stripe Connect events.
 * In Stripe Dashboard, configure a separate webhook endpoint with
 * "Connect" event types pointing to this URL.
 *
 * Uses STRIPE_CONNECT_WEBHOOK_SECRET (separate from main webhook secret).
 */
export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // Use a separate secret for Connect webhooks, fall back to main secret
  const connectWebhookSecret =
    process.env.STRIPE_CONNECT_WEBHOOK_SECRET ||
    process.env.STRIPE_WEBHOOK_SECRET;

  if (!connectWebhookSecret) {
    console.error("No webhook secret configured for Connect events");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, connectWebhookSecret);
  } catch (err) {
    console.error("Connect webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      // Account events
      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        await handleAccountUpdated(supabase, account);
        break;
      }

      case "account.application.deauthorized": {
        // For this event, event.data.object is an Application, not an Account
        // The connected account ID is in event.account
        if (event.account) {
          await handleAccountDeauthorized(supabase, event.account);
        }
        break;
      }

      // Payment events from connected accounts
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handleConnectedPayment(supabase, paymentIntent, event.account);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handleConnectedPaymentFailed(
          supabase,
          paymentIntent,
          event.account
        );
        break;
      }

      // Payout events
      case "payout.paid": {
        const payout = event.data.object as Stripe.Payout;
        await handlePayoutPaid(supabase, payout, event.account);
        break;
      }

      case "payout.failed": {
        const payout = event.data.object as Stripe.Payout;
        await handlePayoutFailed(supabase, payout, event.account);
        break;
      }

      // Charge events for tracking earnings
      case "charge.succeeded": {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeSucceeded(supabase, charge, event.account);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeRefunded(supabase, charge, event.account);
        break;
      }

      default:
        console.log("Unhandled Connect event:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Connect webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

// ============================================
// HANDLERS
// ============================================

async function handleAccountUpdated(
  supabase: ReturnType<typeof createAdminClient>,
  account: Stripe.Account
) {
  const chargesEnabled = account.charges_enabled || false;
  const payoutsEnabled = account.payouts_enabled || false;
  const detailsSubmitted = account.details_submitted || false;
  const onboardingComplete = chargesEnabled && detailsSubmitted;

  await supabase
    .from("stripe_connect_accounts")
    .update({
      charges_enabled: chargesEnabled,
      payouts_enabled: payoutsEnabled,
      details_submitted: detailsSubmitted,
      onboarding_complete: onboardingComplete,
    })
    .eq("stripe_account_id", account.id);

  console.log(
    `Connect account ${account.id} updated: charges=${chargesEnabled}, payouts=${payoutsEnabled}, onboarding=${onboardingComplete}`
  );
}

async function handleAccountDeauthorized(
  supabase: ReturnType<typeof createAdminClient>,
  accountId: string
) {
  await supabase
    .from("stripe_connect_accounts")
    .update({
      charges_enabled: false,
      payouts_enabled: false,
      onboarding_complete: false,
    })
    .eq("stripe_account_id", accountId);

  console.log(`Connect account ${accountId} deauthorized`);
}

async function handleConnectedPayment(
  supabase: ReturnType<typeof createAdminClient>,
  paymentIntent: Stripe.PaymentIntent,
  connectedAccountId?: string
) {
  if (!connectedAccountId) return;

  // Find the community for this connected account
  const { data: connectAccount } = await supabase
    .from("stripe_connect_accounts")
    .select("community_id")
    .eq("stripe_account_id", connectedAccountId)
    .single();

  if (!connectAccount) {
    console.log("No community found for Connect account:", connectedAccountId);
    return;
  }

  // Record the earnings transaction
  const amountReceived = paymentIntent.amount_received;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const applicationFee = (paymentIntent as any).application_fee_amount || 0;

  await supabase.from("connect_earnings").insert({
    community_id: connectAccount.community_id,
    stripe_account_id: connectedAccountId,
    stripe_payment_intent_id: paymentIntent.id,
    gross_amount_cents: amountReceived,
    platform_fee_cents: applicationFee,
    net_amount_cents: amountReceived - applicationFee,
    currency: paymentIntent.currency,
    status: "succeeded",
    metadata: paymentIntent.metadata || {},
  });

  console.log(
    `Connected payment recorded: ${paymentIntent.id}, amount: ${amountReceived}, fee: ${applicationFee}`
  );
}

async function handleConnectedPaymentFailed(
  supabase: ReturnType<typeof createAdminClient>,
  paymentIntent: Stripe.PaymentIntent,
  connectedAccountId?: string
) {
  if (!connectedAccountId) return;

  const { data: connectAccount } = await supabase
    .from("stripe_connect_accounts")
    .select("community_id")
    .eq("stripe_account_id", connectedAccountId)
    .single();

  if (!connectAccount) return;

  await supabase.from("connect_earnings").insert({
    community_id: connectAccount.community_id,
    stripe_account_id: connectedAccountId,
    stripe_payment_intent_id: paymentIntent.id,
    gross_amount_cents: paymentIntent.amount,
    platform_fee_cents: 0,
    net_amount_cents: 0,
    currency: paymentIntent.currency,
    status: "failed",
    metadata: paymentIntent.metadata || {},
  });

  console.log(`Connected payment failed: ${paymentIntent.id}`);
}

async function handlePayoutPaid(
  supabase: ReturnType<typeof createAdminClient>,
  payout: Stripe.Payout,
  connectedAccountId?: string
) {
  if (!connectedAccountId) return;

  const { data: connectAccount } = await supabase
    .from("stripe_connect_accounts")
    .select("community_id")
    .eq("stripe_account_id", connectedAccountId)
    .single();

  if (!connectAccount) return;

  await supabase.from("connect_payouts").insert({
    community_id: connectAccount.community_id,
    stripe_account_id: connectedAccountId,
    stripe_payout_id: payout.id,
    amount_cents: payout.amount,
    currency: payout.currency,
    status: "paid",
    arrival_date: new Date(payout.arrival_date * 1000).toISOString(),
  });

  console.log(`Payout completed: ${payout.id}, amount: ${payout.amount}`);
}

async function handlePayoutFailed(
  supabase: ReturnType<typeof createAdminClient>,
  payout: Stripe.Payout,
  connectedAccountId?: string
) {
  if (!connectedAccountId) return;

  const { data: connectAccount } = await supabase
    .from("stripe_connect_accounts")
    .select("community_id")
    .eq("stripe_account_id", connectedAccountId)
    .single();

  if (!connectAccount) return;

  await supabase.from("connect_payouts").insert({
    community_id: connectAccount.community_id,
    stripe_account_id: connectedAccountId,
    stripe_payout_id: payout.id,
    amount_cents: payout.amount,
    currency: payout.currency,
    status: "failed",
    arrival_date: new Date(payout.arrival_date * 1000).toISOString(),
  });

  console.log(`Payout failed: ${payout.id}`);
}

async function handleChargeSucceeded(
  supabase: ReturnType<typeof createAdminClient>,
  charge: Stripe.Charge,
  connectedAccountId?: string
) {
  if (!connectedAccountId) return;

  // Update total earnings on the connect account
  const { data: connectAccount } = await supabase
    .from("stripe_connect_accounts")
    .select("id, total_earnings_cents")
    .eq("stripe_account_id", connectedAccountId)
    .single();

  if (connectAccount) {
    await supabase
      .from("stripe_connect_accounts")
      .update({
        total_earnings_cents:
          (connectAccount.total_earnings_cents || 0) + charge.amount,
      })
      .eq("id", connectAccount.id);
  }
}

async function handleChargeRefunded(
  supabase: ReturnType<typeof createAdminClient>,
  charge: Stripe.Charge,
  connectedAccountId?: string
) {
  if (!connectedAccountId) return;

  const refundedAmount = charge.amount_refunded || 0;

  const { data: connectAccount } = await supabase
    .from("stripe_connect_accounts")
    .select("id, total_earnings_cents")
    .eq("stripe_account_id", connectedAccountId)
    .single();

  if (connectAccount) {
    await supabase
      .from("stripe_connect_accounts")
      .update({
        total_earnings_cents: Math.max(
          0,
          (connectAccount.total_earnings_cents || 0) - refundedAmount
        ),
      })
      .eq("id", connectAccount.id);
  }
}
