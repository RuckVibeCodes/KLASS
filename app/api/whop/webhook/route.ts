import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  verifyWhopWebhook,
  parseWhopWebhookEvent,
  type WhopWebhookEvent,
} from "@/lib/whop/webhook";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("whop-signature") || "";
  const webhookSecret = process.env.WHOP_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("WHOP_WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  // Verify webhook signature
  if (!verifyWhopWebhook(body, signature, webhookSecret)) {
    console.error("Invalid Whop webhook signature");
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 401 }
    );
  }

  let event: WhopWebhookEvent;
  try {
    event = parseWhopWebhookEvent(body);
  } catch (err) {
    console.error("Failed to parse Whop webhook:", err instanceof Error ? err.message : "Unknown error");
    return NextResponse.json(
      { error: "Invalid event body" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  try {
    switch (event.action) {
      case "membership.went_valid":
        await handleMembershipValid(supabase, event);
        break;

      case "membership.went_invalid":
        await handleMembershipInvalid(supabase, event);
        break;

      case "payment.succeeded":
        console.log("Whop payment succeeded:", event.data.id);
        break;

      case "payment.failed":
        console.log("Whop payment failed:", event.data.id);
        break;

      default:
        console.log("Unhandled Whop event:", event.action);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Whop webhook handler error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

/**
 * Handle membership becoming valid (new purchase or renewal)
 * Maps the Whop user to a KLASS community member
 */
async function handleMembershipValid(
  supabase: ReturnType<typeof createAdminClient>,
  event: WhopWebhookEvent
) {
  const { data } = event;

  // Find the community linked to this Whop product
  const { data: whopIntegration } = await supabase
    .from("whop_integrations")
    .select("community_id")
    .or(
      `whop_product_id.eq.${data.product},whop_access_pass_id.eq.${data.access_pass}`
    )
    .eq("enabled", true)
    .single();

  if (!whopIntegration) {
    console.error(
      "No KLASS community found for Whop product:",
      data.product
    );
    return;
  }

  const communityId = whopIntegration.community_id;

  // Upsert whop member mapping
  await supabase.from("whop_members").upsert(
    {
      community_id: communityId,
      whop_user_id: data.user_id,
      whop_membership_id: data.id,
      email: data.email,
      status: "active",
    },
    { onConflict: "community_id,whop_user_id" }
  );

  // Try to link to existing KLASS profile by email
  if (data.email) {
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("community_id", communityId)
      .eq("email", data.email)
      .single();

    if (existingProfile) {
      await supabase
        .from("whop_members")
        .update({ profile_id: existingProfile.id })
        .eq("community_id", communityId)
        .eq("whop_user_id", data.user_id);

      // Upgrade profile tier
      await supabase
        .from("profiles")
        .update({ tier: "PAID" })
        .eq("id", existingProfile.id);
    }
  }

  console.log(
    `Whop member mapped to community successfully`
  );
}

/**
 * Handle membership becoming invalid (cancellation/expiry)
 */
async function handleMembershipInvalid(
  supabase: ReturnType<typeof createAdminClient>,
  event: WhopWebhookEvent
) {
  const { data } = event;

  const { data: whopMember } = await supabase
    .from("whop_members")
    .select("id, profile_id, community_id")
    .eq("whop_user_id", data.user_id)
    .single();

  if (!whopMember) {
    console.log("No Whop member found for:", data.user_id);
    return;
  }

  const newStatus = data.status === "canceled" ? "canceled" : "expired";
  await supabase
    .from("whop_members")
    .update({ status: newStatus })
    .eq("id", whopMember.id);

  // If linked to a profile, downgrade tier
  if (whopMember.profile_id) {
    await supabase
      .from("profiles")
      .update({ tier: "FREE" })
      .eq("id", whopMember.profile_id);
  }

  console.log(`Whop member ${data.user_id} marked as ${newStatus}`);
}
