/**
 * Email service for KLASS — powered by Resend
 * 
 * Handles:
 * - Welcome emails (new member joins)
 * - New content notifications (posts, lessons, events)
 * - Membership confirmation/receipts
 * 
 * Requires RESEND_API_KEY environment variable.
 * Set RESEND_FROM_EMAIL to customize the sender (default: onboarding@resend.dev)
 */

import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error(
        "RESEND_API_KEY is not set. Add it to your environment variables."
      );
    }
    _resend = new Resend(apiKey);
  }
  return _resend;
}

/**
 * Check if email sending is available
 */
export function isEmailAvailable(): boolean {
  return !!process.env.RESEND_API_KEY;
}

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "KLASS <onboarding@resend.dev>";

// ============================================================================
// Email Templates
// ============================================================================

interface WelcomeEmailParams {
  memberName: string;
  memberEmail: string;
  communityName: string;
  communitySlug: string;
  communityDescription?: string;
}

interface ContentNotificationParams {
  recipientEmail: string;
  recipientName: string;
  communityName: string;
  communitySlug: string;
  contentType: "post" | "lesson" | "event";
  contentTitle: string;
  contentPreview?: string;
  authorName?: string;
}

interface MembershipConfirmationParams {
  memberEmail: string;
  memberName: string;
  communityName: string;
  communitySlug: string;
  tierName: string;
  priceFormatted?: string;
  billingCycle?: "monthly" | "yearly";
}

// ============================================================================
// Send Functions
// ============================================================================

/**
 * Send a welcome email when a new member joins a community
 */
export async function sendWelcomeEmail(
  params: WelcomeEmailParams
): Promise<{ success: boolean; error?: string }> {
  if (!isEmailAvailable()) {
    console.log("[Email] Skipping welcome email — RESEND_API_KEY not set");
    return { success: false, error: "Email not configured" };
  }

  const {
    memberName,
    memberEmail,
    communityName,
    communitySlug,
    communityDescription,
  } = params;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://klasscommunity.com";
  const communityUrl = `${appUrl}/${communitySlug}`;

  try {
    const resend = getResend();
    await resend.emails.send({
      from: FROM_EMAIL,
      to: memberEmail,
      subject: `Welcome to ${communityName}! 🎉`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f4f4f5; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; margin-top: 24px; margin-bottom: 24px; }
    .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 32px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
    .header p { margin: 8px 0 0; opacity: 0.9; font-size: 16px; }
    .body { padding: 32px; }
    .body h2 { margin: 0 0 16px; font-size: 20px; color: #18181b; }
    .body p { color: #52525b; line-height: 1.6; margin: 0 0 16px; }
    .steps { background: #fafafa; border-radius: 8px; padding: 20px; margin: 24px 0; }
    .step { display: flex; align-items: flex-start; margin-bottom: 12px; }
    .step:last-child { margin-bottom: 0; }
    .step-num { background: #6366f1; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; margin-right: 12px; flex-shrink: 0; }
    .step-text { color: #3f3f46; font-size: 14px; line-height: 1.5; }
    .cta { display: inline-block; background: #6366f1; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin: 8px 0 24px; }
    .footer { text-align: center; padding: 24px 32px; color: #a1a1aa; font-size: 13px; border-top: 1px solid #f4f4f5; }
    .footer a { color: #6366f1; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to ${escapeHtml(communityName)}!</h1>
      ${communityDescription ? `<p>${escapeHtml(communityDescription)}</p>` : ""}
    </div>
    <div class="body">
      <h2>Hey ${escapeHtml(memberName)}! 👋</h2>
      <p>We're thrilled to have you join the community. Here's everything you need to know to get started:</p>
      
      <div class="steps">
        <div class="step">
          <span class="step-num">1</span>
          <span class="step-text"><strong>Complete your profile</strong> — Add a photo and bio so others can get to know you</span>
        </div>
        <div class="step">
          <span class="step-num">2</span>
          <span class="step-text"><strong>Introduce yourself</strong> — Post in the community feed and say hello</span>
        </div>
        <div class="step">
          <span class="step-num">3</span>
          <span class="step-text"><strong>Explore programs</strong> — Check out our courses and start learning</span>
        </div>
        <div class="step">
          <span class="step-num">4</span>
          <span class="step-text"><strong>Join an event</strong> — RSVP to an upcoming workshop or meetup</span>
        </div>
      </div>
      
      <div style="text-align: center;">
        <a href="${communityUrl}" class="cta">Go to ${escapeHtml(communityName)} →</a>
      </div>
      
      <p>If you have any questions, just reply to this email. We're here to help!</p>
    </div>
    <div class="footer">
      <p>Sent by <a href="https://klasscommunity.com">KLASS</a> on behalf of ${escapeHtml(communityName)}</p>
    </div>
  </div>
</body>
</html>`,
    });

    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown email error";
    console.error("[Email] Failed to send welcome email:", message);
    return { success: false, error: message };
  }
}

/**
 * Send notification when new content is published
 */
export async function sendContentNotification(
  params: ContentNotificationParams
): Promise<{ success: boolean; error?: string }> {
  if (!isEmailAvailable()) {
    console.log("[Email] Skipping content notification — RESEND_API_KEY not set");
    return { success: false, error: "Email not configured" };
  }

  const {
    recipientEmail,
    recipientName,
    communityName,
    communitySlug,
    contentType,
    contentTitle,
    contentPreview,
    authorName,
  } = params;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://klasscommunity.com";
  const communityUrl = `${appUrl}/${communitySlug}`;

  const contentTypeLabels = {
    post: "New Post",
    lesson: "New Lesson",
    event: "New Event",
  };

  const contentEmojis = {
    post: "📝",
    lesson: "📚",
    event: "📅",
  };

  const label = contentTypeLabels[contentType];
  const emoji = contentEmojis[contentType];

  try {
    const resend = getResend();
    await resend.emails.send({
      from: FROM_EMAIL,
      to: recipientEmail,
      subject: `${emoji} ${label} in ${communityName}: ${contentTitle}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f4f4f5; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; margin-top: 24px; margin-bottom: 24px; }
    .badge { display: inline-block; background: #eef2ff; color: #6366f1; padding: 4px 12px; border-radius: 9999px; font-size: 13px; font-weight: 600; margin-bottom: 12px; }
    .header { padding: 32px 32px 0; }
    .header h1 { margin: 0 0 8px; font-size: 24px; color: #18181b; }
    .header .meta { color: #71717a; font-size: 14px; margin: 0; }
    .body { padding: 24px 32px 32px; }
    .body p { color: #52525b; line-height: 1.6; margin: 0 0 16px; }
    .preview { background: #fafafa; border-left: 3px solid #6366f1; padding: 16px; border-radius: 0 8px 8px 0; margin: 16px 0; }
    .preview p { margin: 0; color: #3f3f46; font-size: 14px; }
    .cta { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; }
    .footer { text-align: center; padding: 20px 32px; color: #a1a1aa; font-size: 13px; border-top: 1px solid #f4f4f5; }
    .footer a { color: #6366f1; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">${emoji} ${label}</span>
      <h1>${escapeHtml(contentTitle)}</h1>
      <p class="meta">
        ${authorName ? `By ${escapeHtml(authorName)} · ` : ""}${escapeHtml(communityName)}
      </p>
    </div>
    <div class="body">
      <p>Hey ${escapeHtml(recipientName)}!</p>
      ${
        contentPreview
          ? `<div class="preview"><p>${escapeHtml(contentPreview)}</p></div>`
          : ""
      }
      <p>Check it out in the community:</p>
      <a href="${communityUrl}" class="cta">View ${label} →</a>
    </div>
    <div class="footer">
      <p>From <a href="https://klasscommunity.com">${escapeHtml(communityName)}</a> via KLASS</p>
    </div>
  </div>
</body>
</html>`,
    });

    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown email error";
    console.error("[Email] Failed to send content notification:", message);
    return { success: false, error: message };
  }
}

/**
 * Send membership confirmation/receipt email
 */
export async function sendMembershipConfirmation(
  params: MembershipConfirmationParams
): Promise<{ success: boolean; error?: string }> {
  if (!isEmailAvailable()) {
    console.log(
      "[Email] Skipping membership confirmation — RESEND_API_KEY not set"
    );
    return { success: false, error: "Email not configured" };
  }

  const {
    memberEmail,
    memberName,
    communityName,
    communitySlug,
    tierName,
    priceFormatted,
    billingCycle,
  } = params;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://klasscommunity.com";
  const communityUrl = `${appUrl}/${communitySlug}`;

  const isPaid = priceFormatted && priceFormatted !== "$0" && priceFormatted !== "Free";

  try {
    const resend = getResend();
    await resend.emails.send({
      from: FROM_EMAIL,
      to: memberEmail,
      subject: isPaid
        ? `🎉 ${tierName} membership confirmed — ${communityName}`
        : `Welcome to ${communityName}!`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f4f4f5; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; margin-top: 24px; margin-bottom: 24px; }
    .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 24px; }
    .body { padding: 32px; }
    .body p { color: #52525b; line-height: 1.6; margin: 0 0 16px; }
    .receipt { background: #fafafa; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .receipt-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e4e4e7; }
    .receipt-row:last-child { border-bottom: none; font-weight: 600; }
    .receipt-label { color: #71717a; }
    .receipt-value { color: #18181b; font-weight: 500; }
    .cta { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; }
    .footer { text-align: center; padding: 20px 32px; color: #a1a1aa; font-size: 13px; border-top: 1px solid #f4f4f5; }
    .footer a { color: #6366f1; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Membership Confirmed</h1>
    </div>
    <div class="body">
      <p>Hey ${escapeHtml(memberName)}!</p>
      <p>Your <strong>${escapeHtml(tierName)}</strong> membership in <strong>${escapeHtml(communityName)}</strong> is confirmed and active.</p>
      
      ${
        isPaid
          ? `
      <div class="receipt">
        <div class="receipt-row">
          <span class="receipt-label">Plan</span>
          <span class="receipt-value">${escapeHtml(tierName)}</span>
        </div>
        ${
          billingCycle
            ? `<div class="receipt-row">
          <span class="receipt-label">Billing</span>
          <span class="receipt-value">${billingCycle === "yearly" ? "Annual" : "Monthly"}</span>
        </div>`
            : ""
        }
        <div class="receipt-row">
          <span class="receipt-label">Amount</span>
          <span class="receipt-value">${escapeHtml(priceFormatted || "")}${billingCycle === "yearly" ? "/year" : "/month"}</span>
        </div>
      </div>
      `
          : ""
      }
      
      <p>You now have full access to all ${escapeHtml(tierName)} features. Dive in!</p>
      <div style="text-align: center; margin-top: 24px;">
        <a href="${communityUrl}" class="cta">Go to ${escapeHtml(communityName)} →</a>
      </div>
    </div>
    <div class="footer">
      <p>Powered by <a href="https://klasscommunity.com">KLASS</a></p>
    </div>
  </div>
</body>
</html>`,
    });

    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown email error";
    console.error("[Email] Failed to send membership confirmation:", message);
    return { success: false, error: message };
  }
}

// ============================================================================
// Utility
// ============================================================================

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
