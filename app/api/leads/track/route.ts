import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { lead_id, email, event_type, event_data } = body;

    if (!event_type) {
      return NextResponse.json(
        { error: "event_type is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    let leadId = lead_id;

    // If no lead_id but email provided, look up the lead
    if (!leadId && email) {
      const { data: lead } = await supabase
        .from("leads")
        .select("id")
        .eq("email", email.toLowerCase().trim())
        .single();
      
      if (lead) {
        leadId = lead.id;
      }
    }

    // If still no lead, we can't track
    if (!leadId) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    // Record the event
    const { error: eventError } = await supabase.from("lead_events").insert({
      lead_id: leadId,
      event_type,
      event_data: event_data || null,
    });

    if (eventError) {
      console.error("Event tracking error:", eventError);
      return NextResponse.json(
        { error: "Failed to track event" },
        { status: 500 }
      );
    }

    // Calculate score based on rules
    const { data: rules } = await supabase
      .from("lead_score_rules")
      .select("*")
      .eq("event_type", event_type)
      .eq("active", true);

    let pointsToAdd = 0;

    if (rules && rules.length > 0) {
      for (const rule of rules) {
        // Check if event_filter matches (if specified)
        if (rule.event_filter) {
          const filter = rule.event_filter as Record<string, unknown>;
          const matches = Object.entries(filter).every(
            ([key, value]) => event_data?.[key] === value
          );
          if (!matches) continue;
        }

        // Check max_per_day limit
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { count } = await supabase
          .from("lead_events")
          .select("*", { count: "exact", head: true })
          .eq("lead_id", leadId)
          .eq("event_type", event_type)
          .gte("created_at", today.toISOString());

        if ((count || 0) <= (rule.max_per_day || 1)) {
          pointsToAdd += rule.points;
        }
      }
    }

    // Update lead score and last_activity
    if (pointsToAdd > 0) {
      await supabase.rpc("increment_lead_score", {
        p_lead_id: leadId,
        p_points: pointsToAdd,
      });
    }

    // Update last activity
    await supabase
      .from("leads")
      .update({ last_activity_at: new Date().toISOString() })
      .eq("id", leadId);

    // Check if lead should be marked as "hot"
    const { data: lead } = await supabase
      .from("leads")
      .select("lead_score, status")
      .eq("id", leadId)
      .single();

    if (lead && lead.lead_score >= 50 && lead.status === "nurturing") {
      await supabase
        .from("leads")
        .update({ status: "hot" })
        .eq("id", leadId);
    }

    return NextResponse.json({
      success: true,
      pointsAdded: pointsToAdd,
    });
  } catch (error) {
    console.error("Track error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
