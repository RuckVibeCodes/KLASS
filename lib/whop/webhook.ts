/**
 * Whop Webhook Handling
 *
 * Whop sends webhooks for membership events:
 * - membership.went_valid: User purchased/renewed
 * - membership.went_invalid: Subscription expired/canceled
 * - membership.metadata_updated: Metadata changed
 * - payment.succeeded: Payment went through
 * - payment.failed: Payment failed
 *
 * Webhook signature verification uses HMAC SHA-256
 */

import crypto from "crypto";

export interface WhopWebhookEvent {
  action: string;
  data: {
    id: string;
    product: string;
    plan: string;
    user_id: string;
    email: string;
    status: string;
    valid: boolean;
    license_key: string | null;
    metadata: Record<string, string>;
    access_pass: string;
    cancel_at_period_end: boolean;
    created_at: number;
    renewal_period_start: number;
    renewal_period_end: number;
  };
}

/**
 * Verify Whop webhook signature
 */
export function verifyWhopWebhook(
  body: string,
  signature: string,
  secret: string
): boolean {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

/**
 * Parse and validate a Whop webhook event
 */
export function parseWhopWebhookEvent(body: string): WhopWebhookEvent {
  const event = JSON.parse(body) as WhopWebhookEvent;

  if (!event.action || !event.data) {
    throw new Error("Invalid Whop webhook event");
  }

  return event;
}
