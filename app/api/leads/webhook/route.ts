import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Resend webhook events
interface ResendWebhookEvent {
  type: "email.sent" | "email.delivered" | "email.opened" | "email.clicked" | "email.bounced" | "email.complained";
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    click?: { link: string };
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as ResendWebhookEvent;
    const { type, data } = body;

    const supabase = createAdminClient();
    const resendId = data.email_id;
    const recipientEmail = data.to[0];

    // Find the lead email record by resend_id
    const { data: leadEmail } = await supabase
      .from("lead_emails")
      .select("id, lead_id")
      .eq("resend_id", resendId)
      .single();

    if (!leadEmail) {
      // Try to find by email address if resend_id not found
      const { data: lead } = await supabase
        .from("leads")
        .select("id")
        .eq("email", recipientEmail.toLowerCase())
        .single();

      if (!lead) {
        console.log("Lead not found for webhook:", recipientEmail);
        return NextResponse.json({ received: true });
      }
    }

    const now = new Date().toISOString();

    switch (type) {
      case "email.delivered":
        if (leadEmail) {
          await supabase
            .from("lead_emails")
            .update({ delivered_at: now })
            .eq("id", leadEmail.id);
        }
        break;

      case "email.opened":
        if (leadEmail) {
          await supabase
            .from("lead_emails")
            .update({ opened_at: now })
            .eq("id", leadEmail.id);

          // Track event for scoring
          await supabase.from("lead_events").insert({
            lead_id: leadEmail.lead_id,
            event_type: "email_open",
            event_data: { resend_id: resendId },
          });

          // Add score points (2 points per open)
          await supabase
            .from("leads")
            .update({ 
              lead_score: supabase.rpc("increment_lead_score_raw", { amount: 2 }),
              last_activity_at: now,
            })
            .eq("id", leadEmail.lead_id);
        }
        break;

      case "email.clicked":
        if (leadEmail) {
          await supabase
            .from("lead_emails")
            .update({ clicked_at: now })
            .eq("id", leadEmail.id);

          // Track event for scoring
          await supabase.from("lead_events").insert({
            lead_id: leadEmail.lead_id,
            event_type: "email_click",
            event_data: { 
              resend_id: resendId,
              link: data.click?.link,
            },
          });

          // Add score points (5 points per click)
          const { data: lead } = await supabase
            .from("leads")
            .select("lead_score, status")
            .eq("id", leadEmail.lead_id)
            .single();

          if (lead) {
            const newScore = (lead.lead_score || 0) + 5;
            const updates: Record<string, unknown> = {
              lead_score: newScore,
              last_activity_at: now,
            };

            // Upgrade to hot if score crosses threshold
            if (newScore >= 50 && lead.status === "nurturing") {
              updates.status = "hot";
            }

            await supabase
              .from("leads")
              .update(updates)
              .eq("id", leadEmail.lead_id);
          }
        }
        break;

      case "email.bounced":
        if (leadEmail) {
          await supabase
            .from("lead_emails")
            .update({ bounced_at: now })
            .eq("id", leadEmail.id);

          // Mark lead as dead if email bounced
          await supabase
            .from("leads")
            .update({ status: "dead" })
            .eq("id", leadEmail.lead_id);
        }
        break;

      case "email.complained":
        // Unsubscribe if they complained
        if (leadEmail) {
          await supabase
            .from("leads")
            .update({ status: "unsubscribed" })
            .eq("id", leadEmail.lead_id);
        }
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
