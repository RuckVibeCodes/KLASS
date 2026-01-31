import { stripe } from "./client";

/**
 * Create a Stripe Connect account for a community creator
 */
export async function createConnectAccount(
  communityId: string,
  communityName: string,
  email: string
): Promise<{ accountId: string } | null> {
  if (!stripe) {
    console.log("Stripe not configured - cannot create Connect account");
    return null;
  }

  try {
    const account = await stripe.accounts.create({
      type: "express",
      email,
      business_type: "individual",
      metadata: {
        community_id: communityId,
        community_name: communityName,
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    return { accountId: account.id };
  } catch (error) {
    console.error("Failed to create Connect account:", error);
    return null;
  }
}

/**
 * Create an Account Link for Stripe Connect onboarding
 */
export async function createConnectOnboardingLink(
  accountId: string,
  returnUrl: string,
  refreshUrl: string
): Promise<{ url: string } | null> {
  if (!stripe) {
    console.log("Stripe not configured - cannot create onboarding link");
    return null;
  }

  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      return_url: returnUrl,
      refresh_url: refreshUrl,
      type: "account_onboarding",
    });

    return { url: accountLink.url };
  } catch (error) {
    console.error("Failed to create Connect onboarding link:", error);
    return null;
  }
}

/**
 * Create a Stripe Connect login link for an existing connected account
 */
export async function createConnectLoginLink(
  accountId: string
): Promise<{ url: string } | null> {
  if (!stripe) {
    console.log("Stripe not configured - cannot create login link");
    return null;
  }

  try {
    const loginLink = await stripe.accounts.createLoginLink(accountId);
    return { url: loginLink.url };
  } catch (error) {
    console.error("Failed to create Connect login link:", error);
    return null;
  }
}

/**
 * Get the status of a connected Stripe account
 */
export async function getConnectAccountStatus(accountId: string) {
  if (!stripe) return null;

  try {
    const account = await stripe.accounts.retrieve(accountId);
    return {
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
    };
  } catch (error) {
    console.error("Failed to get Connect account status:", error);
    return null;
  }
}

/**
 * Create a checkout session with application fee for connected accounts
 * This handles the payment split: creator gets paid, KLASS takes platform fee
 */
export async function createConnectedCheckoutSession({
  connectedAccountId,
  priceId,
  platformFeePercent,
  priceCents,
  metadata,
  successUrl,
  cancelUrl,
  mode = "subscription",
}: {
  connectedAccountId: string;
  priceId: string;
  platformFeePercent: number;
  priceCents: number;
  metadata: Record<string, string>;
  successUrl: string;
  cancelUrl: string;
  mode?: "subscription" | "payment";
}): Promise<{ url: string } | null> {
  if (!stripe) {
    console.log("Stripe not configured - cannot create connected checkout");
    return null;
  }

  const applicationFeeAmount = Math.round(
    priceCents * (platformFeePercent / 100)
  );

  try {
    const sessionParams: Record<string, unknown> = {
      mode,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
    };

    if (mode === "subscription") {
      sessionParams.subscription_data = {
        application_fee_percent: platformFeePercent,
        metadata,
      };
    } else {
      sessionParams.payment_intent_data = {
        application_fee_amount: applicationFeeAmount,
      };
    }

    // Create session on connected account
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await (stripe.checkout.sessions.create as any)(
      sessionParams,
      { stripeAccount: connectedAccountId }
    );

    return { url: session.url || "" };
  } catch (error) {
    console.error("Failed to create connected checkout session:", error);
    return null;
  }
}
