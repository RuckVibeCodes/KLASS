import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";

// Lazy initialize Resend to avoid build-time errors
let resend: Resend | null = null;
function getResend() {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

// Email sequence configuration
const EMAIL_SEQUENCE = {
  founders_nurture: [
    { emailKey: "welcome", delayHours: 0, subject: "Your Creator Community Checklist (+ something special)" },
    { emailKey: "value_story", delayHours: 24, subject: "Why I built KLASS (and quit paying Skool $99/mo)" },
    { emailKey: "pain_point", delayHours: 48, subject: "$3,564 — that's what Skool costs over 3 years" },
    { emailKey: "social_proof", delayHours: 72, subject: '"I moved 847 members from Skool in one weekend"' },
    { emailKey: "objection_handling", delayHours: 96, subject: '"I already have a community on [X]..."' },
    { emailKey: "urgency", delayHours: 120, subject: "77 → 54 (founder spots going fast)" },
    { emailKey: "last_chance", delayHours: 144, subject: "Final reminder: $297 lifetime vs $79/mo forever" },
  ],
};

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

async function sendWelcomeEmail(lead: { email: string; first_name?: string | null }) {
  try {
    const { data, error } = await getResend().emails.send({
      from: "KLASS <founders@klasscommunity.com>",
      to: lead.email,
      subject: "Welcome to KLASS! 🎉 Your Creator Community Checklist is here",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
            <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <h1 style="color: #1a1a1a; margin-bottom: 24px;">Welcome to KLASS, ${lead.first_name || "there"}! 🎉</h1>
              
              <p style="font-size: 16px;">Thanks for joining — you're clearly serious about building something real.</p>
              
              <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); border-radius: 8px; padding: 24px; margin: 24px 0; color: white;">
                <p style="margin: 0; font-size: 18px; font-weight: 600;">📋 Your Creator Community Launch Checklist</p>
                <p style="margin: 12px 0 0 0; opacity: 0.9;">50 points to go from zero to your first paying members. This is the exact framework successful creators use.</p>
                <a href="https://klasscommunity.com/checklist" style="display: inline-block; margin-top: 16px; background: white; color: #3b82f6; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">Download Checklist →</a>
              </div>
              
              <h2 style="color: #1a1a1a; margin-top: 32px; font-size: 18px;">Quick intro to KLASS:</h2>
              <ul style="padding-left: 20px;">
                <li style="margin-bottom: 8px;">🧠 <strong>AI-powered</strong> — Generate course outlines, manage your community smarter</li>
                <li style="margin-bottom: 8px;">🎨 <strong>White-label</strong> — Your members see YOUR brand, not ours</li>
                <li style="margin-bottom: 8px;">💰 <strong>Direct payments</strong> — Keep 100% of your revenue</li>
                <li style="margin-bottom: 8px;">🚀 <strong>Free to start</strong> — No credit card required</li>
              </ul>
              
              <div style="background: #ecfdf5; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 32px 0;">
                <p style="margin: 0; font-size: 18px; font-weight: 600; color: #065f46;">🎯 Founding Member Deal</p>
                <p style="margin: 8px 0 0 0; color: #047857;">77/100 spots remaining at <strong>$297 lifetime</strong> — no monthly fees ever.</p>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #6b7280;">After these spots fill: $79/mo forever.</p>
              </div>
              
              <a href="https://klasscommunity.com/founders" style="display: block; text-align: center; background: #10b981; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin: 24px 0;">Claim Your Founder Spot ($297) →</a>
              
              <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">What to expect: Over the next few days, I'll share the story behind KLASS, the real cost of renting your platform, and stories from creators who made the switch.</p>
              
              <p style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">P.S. — Reply and tell me what you're building. I read every response.</p>
              
              <p style="font-size: 12px; color: #9ca3af; margin-top: 32px;">
                <a href="https://klasscommunity.com/unsubscribe?email=${encodeURIComponent(lead.email)}" style="color: #9ca3af;">Unsubscribe</a>
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Failed to send welcome email:", error);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      email,
      first_name,
      source,
      utm_source,
      utm_medium,
      utm_campaign,
      referrer,
      landing_page,
      creator_type,
      current_platform,
      community_size,
    } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const normalizedEmail = email.toLowerCase().trim();

    // Check if lead already exists
    const { data: existingLead } = await supabase
      .from("leads")
      .select("id, status")
      .eq("email", normalizedEmail)
      .single();

    if (existingLead) {
      // Update existing lead's activity
      await supabase
        .from("leads")
        .update({ last_activity_at: new Date().toISOString() })
        .eq("id", existingLead.id);

      return NextResponse.json({
        success: true,
        leadId: existingLead.id,
        message: "Welcome back!",
        existing: true,
      });
    }

    // Create new lead
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .insert({
        email: normalizedEmail,
        first_name: first_name?.trim() || null,
        source: source || "founders_page",
        utm_source: utm_source || null,
        utm_medium: utm_medium || null,
        utm_campaign: utm_campaign || null,
        referrer: referrer || null,
        landing_page: landing_page || null,
        creator_type: creator_type || null,
        current_platform: current_platform || null,
        community_size: community_size || null,
        status: "new",
        lead_score: 10,
        last_activity_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (leadError) {
      console.error("Lead insert error:", leadError);
      return NextResponse.json(
        { error: "Failed to capture lead" },
        { status: 500 }
      );
    }

    // Send welcome email
    const resendId = await sendWelcomeEmail({
      email: lead.email,
      first_name: lead.first_name,
    });

    // Record welcome email
    await supabase.from("lead_emails").insert({
      lead_id: lead.id,
      sequence_id: "founders_nurture",
      email_number: 0,
      email_key: "welcome",
      sent_at: new Date().toISOString(),
      resend_id: resendId,
    });

    // Schedule remaining sequence emails
    const now = new Date();
    const emailRecords = EMAIL_SEQUENCE.founders_nurture.slice(1).map((emailConfig, index) => ({
      lead_id: lead.id,
      sequence_id: "founders_nurture",
      email_number: index + 1,
      email_key: emailConfig.emailKey,
      scheduled_for: new Date(now.getTime() + emailConfig.delayHours * 60 * 60 * 1000).toISOString(),
    }));

    if (emailRecords.length > 0) {
      await supabase.from("lead_emails").insert(emailRecords);
    }

    // Update status to nurturing
    await supabase
      .from("leads")
      .update({ status: "nurturing" })
      .eq("id", lead.id);

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      message: "Thanks for joining! Check your email.",
    });
  } catch (error) {
    console.error("Lead capture error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
