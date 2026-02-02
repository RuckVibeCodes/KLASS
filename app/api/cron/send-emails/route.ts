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
const CRON_SECRET = process.env.CRON_SECRET;

// Email content by key
const EMAIL_CONTENT: Record<string, { subject: string; getHtml: (lead: { first_name?: string | null; email: string }) => string }> = {
  value_story: {
    subject: "Why I built KLASS (and quit paying Skool $99/mo)",
    getHtml: (lead) => `
      <!DOCTYPE html>
      <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <p>Hey ${lead.first_name || "there"},</p>
          
          <p>I built communities on Skool, Circle, and paid thousands in platform fees over the years.</p>
          
          <p>Then one day I realized something that bothered me:</p>
          
          <p><strong>Every member I brought in saw someone else's logo. Someone else's brand. I was essentially building their business while paying for the privilege.</strong></p>
          
          <p>What I wanted was simple:</p>
          <ul>
            <li>AI that actually helps (not just a buzzword)</li>
            <li>White-label that's REAL (my brand, my domain)</li>
            <li>Direct payments (keep 100%, not 90%)</li>
          </ul>
          
          <p>So I built it. And now I'm sharing it with 100 creators who get it.</p>
          
          <p>Here's the deal: You're either early (pay once, use forever) or you're paying $79/mo like everyone else.</p>
          
          <p><a href="https://klasscommunity.com/founders" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">Lock in lifetime access ($297) →</a></p>
          
          <p>Talk soon,<br>Matt</p>
          
          <p style="font-size: 12px; color: #9ca3af; margin-top: 32px;">
            <a href="https://klasscommunity.com/unsubscribe?email=${encodeURIComponent(lead.email)}" style="color: #9ca3af;">Unsubscribe</a>
          </p>
        </body>
      </html>
    `,
  },
  pain_point: {
    subject: "$3,564 — that's what Skool costs over 3 years",
    getHtml: (lead) => `
      <!DOCTYPE html>
      <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <p>Hey ${lead.first_name || "there"},</p>
          
          <p>Quick math:</p>
          <ul>
            <li>Skool: $99/mo = $1,188/yr = <strong>$3,564 over 3 years</strong></li>
            <li>Circle: $89/mo = $1,068/yr = <strong>$3,204 over 3 years</strong></li>
            <li>KLASS Founder: <strong>$297. Total. Forever.</strong></li>
          </ul>
          
          <p>But cost isn't even the real problem...</p>
          
          <p><strong>The real problem:</strong> Your members see THEIR brand, not yours. Every email, every notification, every login page — it's "Powered by Skool" or "Circle Community."</p>
          
          <p>White-label isn't just a feature. It's respect for what you're building.</p>
          
          <p>You're not just saving $3,267+ over three years. You're building YOUR brand, not renting someone else's.</p>
          
          <p><a href="https://klasscommunity.com/founders" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">Save $3,267+ (literally) →</a></p>
          
          <p>— Matt</p>
          
          <p style="font-size: 12px; color: #9ca3af; margin-top: 32px;">
            <a href="https://klasscommunity.com/unsubscribe?email=${encodeURIComponent(lead.email)}" style="color: #9ca3af;">Unsubscribe</a>
          </p>
        </body>
      </html>
    `,
  },
  social_proof: {
    subject: '"I moved 847 members from Skool in one weekend"',
    getHtml: (lead) => `
      <!DOCTYPE html>
      <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <p>Hey ${lead.first_name || "there"},</p>
          
          <p>Here's what early KLASS creators are saying:</p>
          
          <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0; font-style: italic;">"Moved 847 members from Skool in one weekend. They didn't even notice the switch — except now everything matches my brand."</p>
            <p style="margin: 8px 0 0 0; font-weight: 600; font-size: 14px;">— Marcus, Fitness Community</p>
          </div>
          
          <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0; font-style: italic;">"Built my first course using the AI in 30 minutes. It would've taken me days before."</p>
            <p style="margin: 8px 0 0 0; font-weight: 600; font-size: 14px;">— Sarah, Business Coach</p>
          </div>
          
          <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0; font-style: italic;">"My members think I built this platform myself. That's exactly what I wanted."</p>
            <p style="margin: 8px 0 0 0; font-weight: 600; font-size: 14px;">— Jordan, Creative Community</p>
          </div>
          
          <p>What these creators have in common: <strong>They stopped renting.</strong></p>
          
          <p>23 founders already in. 77 spots left.</p>
          
          <p><a href="https://klasscommunity.com/founders" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">Join 23 founders who get it →</a></p>
          
          <p>— Matt</p>
          
          <p style="font-size: 12px; color: #9ca3af; margin-top: 32px;">
            <a href="https://klasscommunity.com/unsubscribe?email=${encodeURIComponent(lead.email)}" style="color: #9ca3af;">Unsubscribe</a>
          </p>
        </body>
      </html>
    `,
  },
  objection_handling: {
    subject: '"I already have a community on [X]..."',
    getHtml: (lead) => `
      <!DOCTYPE html>
      <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <p>Hey ${lead.first_name || "there"},</p>
          
          <p>I hear this a lot: "I'm already on Skool/Circle/Discord..."</p>
          
          <p>Here's the thing: You're not losing what you built. The members, the content, the relationships — those are yours.</p>
          
          <p>The platform? That's just infrastructure. And it can be replaced.</p>
          
          <p><strong>Migration is easier than you think:</strong></p>
          <ul>
            <li>Export your members (CSV)</li>
            <li>Import to KLASS (one click)</li>
            <li>Send one email: "We've upgraded our community!"</li>
          </ul>
          
          <p>The question isn't "should I switch" — it's "do I want to own my brand?"</p>
          
          <p>Every month you wait = another $99 gone + more content locked in someone else's platform.</p>
          
          <p><strong>Lock in now. Migrate when you're ready.</strong> The founder deal won't wait.</p>
          
          <p><a href="https://klasscommunity.com/founders" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">Lock in $297 lifetime →</a></p>
          
          <p>— Matt</p>
          
          <p style="font-size: 12px; color: #9ca3af; margin-top: 32px;">
            <a href="https://klasscommunity.com/unsubscribe?email=${encodeURIComponent(lead.email)}" style="color: #9ca3af;">Unsubscribe</a>
          </p>
        </body>
      </html>
    `,
  },
  urgency: {
    subject: "77 → 54 (founder spots going fast)",
    getHtml: (lead) => `
      <!DOCTYPE html>
      <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <p>Hey ${lead.first_name || "there"},</p>
          
          <p>Quick update: We went from 77 spots to 54 this week.</p>
          
          <p><strong>What Founding Members get that Pro users won't:</strong></p>
          <ul>
            <li>✅ Lifetime access (no monthly fees ever)</li>
            <li>✅ All future features included</li>
            <li>✅ Founding Member badge</li>
            <li>✅ Priority support + direct line to me</li>
            <li>✅ Shape the product roadmap</li>
          </ul>
          
          <p><strong>This deal ends when 100 spots fill.</strong> No extensions. No "last chance" deals at a higher price.</p>
          
          <p>Pro pricing ($79/mo) starts the second spot #100 is claimed.</p>
          
          <p><a href="https://klasscommunity.com/founders" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">Claim your founder spot →</a></p>
          
          <p>— Matt</p>
          
          <p style="font-size: 12px; color: #9ca3af; margin-top: 32px;">
            <a href="https://klasscommunity.com/unsubscribe?email=${encodeURIComponent(lead.email)}" style="color: #9ca3af;">Unsubscribe</a>
          </p>
        </body>
      </html>
    `,
  },
  last_chance: {
    subject: "Final reminder: $297 lifetime vs $79/mo forever",
    getHtml: (lead) => `
      <!DOCTYPE html>
      <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <p>Hey ${lead.first_name || "there"},</p>
          
          <p>This is it — my last email about the Founding Member deal.</p>
          
          <p><strong>Quick recap:</strong></p>
          <ul>
            <li>$297 once = lifetime access</li>
            <li>Unlimited members</li>
            <li>All AI features</li>
            <li>All future updates</li>
            <li>White-label everything</li>
          </ul>
          
          <p><strong>After 100 spots:</strong> $79/mo ($948/yr) for the same thing.</p>
          
          <p>The math is simple. The decision is yours.</p>
          
          <p>Either way, I appreciate you being here. If now isn't the right time, no hard feelings. But if you've been waiting for a sign — this is it.</p>
          
          <p><a href="https://klasscommunity.com/founders" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">Become a Founding Member ($297) →</a></p>
          
          <p>P.S. — 30-day money-back guarantee. Zero risk.</p>
          
          <p>— Matt</p>
          
          <p style="font-size: 12px; color: #9ca3af; margin-top: 32px;">
            <a href="https://klasscommunity.com/unsubscribe?email=${encodeURIComponent(lead.email)}" style="color: #9ca3af;">Unsubscribe</a>
          </p>
        </body>
      </html>
    `,
  },
};

// Get pending emails to process
async function getPendingEmails(supabase: ReturnType<typeof createAdminClient>, now: Date) {
  // First, get all pending email records
  const { data: pendingRecords, error: recordsError } = await supabase
    .from("lead_emails")
    .select("id, lead_id, sequence_id, email_number, email_key, sent_at")
    .is("sent_at", null)
    .order("email_number", { ascending: true })
    .limit(100);

  if (recordsError || !pendingRecords) {
    console.error("Error fetching pending emails:", recordsError);
    return [];
  }

  // Get the lead IDs
  const leadIds = [...new Set(pendingRecords.map((r) => r.lead_id))];
  if (leadIds.length === 0) {
    return [];
  }

  // Fetch leads in batches
  const { data: leads, error: leadsError } = await supabase
    .from("leads")
    .select("id, email, first_name, status, created_at")
    .in("id", leadIds)
    .in("status", ["new", "nurturing", "hot"]);

  if (leadsError || !leads) {
    console.error("Error fetching leads:", leadsError);
    return [];
  }

  // Map leads for quick lookup
  const leadMap = new Map(leads.map((l) => [l.id, l]));

  // Filter to only emails that are due
  const emailSequenceConfig: Record<string, Array<{ emailKey: string; delayHours: number }>> = {
    founders_nurture: [
      { emailKey: "welcome", delayHours: 0 },
      { emailKey: "value_story", delayHours: 24 },
      { emailKey: "pain_point", delayHours: 48 },
      { emailKey: "social_proof", delayHours: 72 },
      { emailKey: "objection_handling", delayHours: 96 },
      { emailKey: "urgency", delayHours: 120 },
      { emailKey: "last_chance", delayHours: 144 },
    ],
  };

  const result: Array<{
    emailRecord: typeof pendingRecords[0];
    lead: (typeof leads)[0];
  }> = [];

  for (const emailRec of pendingRecords) {
    const lead = leadMap.get(emailRec.lead_id);
    if (!lead) continue;

    const sequenceConfig = emailSequenceConfig[emailRec.sequence_id];
    if (!sequenceConfig) continue;

    const emailConfig = sequenceConfig[emailRec.email_number];
    if (!emailConfig) continue;

    const leadCreatedAt = new Date(lead.created_at);
    const dueAt = new Date(leadCreatedAt);
    dueAt.setHours(dueAt.getHours() + emailConfig.delayHours);

    if (now >= dueAt) {
      result.push({ emailRecord: emailRec, lead });
    }
  }

  return result;
}

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!resend) {
    return NextResponse.json({ error: "Resend not configured" }, { status: 500 });
  }

  try {
    const supabase = createAdminClient();
    const now = new Date();

    // Get emails that need to be sent
    const pendingItems = await getPendingEmails(supabase, now);

    if (pendingItems.length === 0) {
      return NextResponse.json({ message: "No emails due", sent: 0 });
    }

    let sentCount = 0;
    const errors: string[] = [];

    for (const item of pendingItems) {
      const { emailRecord, lead } = item;
      
      const emailContent = EMAIL_CONTENT[emailRecord.email_key];
      if (!emailContent) {
        console.error(`No content for email key: ${emailRecord.email_key}`);
        continue;
      }

      try {
        const { data, error } = await getResend().emails.send({
          from: "KLASS <founders@klasscommunity.com>",
          to: lead.email,
          subject: emailContent.subject,
          html: emailContent.getHtml({ email: lead.email, first_name: lead.first_name }),
        });

        if (error) {
          errors.push(`Failed to send to ${lead.email}: ${error.message}`);
          continue;
        }

        // Update record with sent info
        await supabase
          .from("lead_emails")
          .update({
            sent_at: now.toISOString(),
            resend_id: data?.id,
          })
          .eq("id", emailRecord.id);

        // Update lead status to nurturing if this is first email
        if (emailRecord.email_number === 0) {
          await supabase
            .from("leads")
            .update({
              status: "nurturing",
              updated_at: now.toISOString(),
            })
            .eq("id", lead.id);
        }

        sentCount++;
      } catch (err) {
        errors.push(`Error sending to ${lead.email}: ${err}`);
      }
    }

    return NextResponse.json({
      message: `Processed ${pendingItems.length} emails`,
      sent: sentCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Cron error:", error);
    return NextResponse.json(
      { error: "Cron job failed" },
      { status: 500 }
    );
  }
}
