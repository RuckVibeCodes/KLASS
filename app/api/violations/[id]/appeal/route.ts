import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";

// Submit an appeal
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { reason } = body;

    if (!reason || reason.trim().length < 10) {
      return NextResponse.json({ error: "Please provide a detailed appeal reason" }, { status: 400 });
    }

    const supabase = await createClient();

    // Get the violation
    const { data: violation } = await supabase
      .from("violations")
      .select("id, profile_id, appeal_status")
      .eq("id", id)
      .single();

    if (!violation) {
      return NextResponse.json({ error: "Violation not found" }, { status: 404 });
    }

    // Verify the user owns this violation
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("clerk_user_id", userId)
      .eq("id", violation.profile_id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "You cannot appeal this violation" }, { status: 403 });
    }

    // Check if already appealed
    if (violation.appeal_status !== "none") {
      return NextResponse.json({ error: "This violation has already been appealed" }, { status: 400 });
    }

    // Submit the appeal
    const { data: updatedViolation, error } = await supabase
      .from("violations")
      .update({
        appeal_status: "pending",
        appeal_reason: reason.trim(),
        appeal_submitted_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error submitting appeal:", error);
      return NextResponse.json({ error: "Failed to submit appeal" }, { status: 500 });
    }

    return NextResponse.json({ success: true, violation: updatedViolation });
  } catch (error) {
    console.error("Appeal API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Review an appeal (admin only)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { decision, notes } = body;

    if (!decision || !["approved", "denied"].includes(decision)) {
      return NextResponse.json({ error: "Invalid decision" }, { status: 400 });
    }

    const supabase = await createClient();

    // Get the violation
    const { data: violation } = await supabase
      .from("violations")
      .select("id, community_id, profile_id, appeal_status")
      .eq("id", id)
      .single();

    if (!violation) {
      return NextResponse.json({ error: "Violation not found" }, { status: 404 });
    }

    // Verify user is admin
    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("clerk_user_id", userId)
      .eq("community_id", violation.community_id)
      .single();

    if (!adminProfile || adminProfile.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Update the violation
    const { data: updatedViolation, error } = await supabase
      .from("violations")
      .update({
        appeal_status: decision,
        appeal_reviewed_by: adminProfile.id,
        appeal_reviewed_at: new Date().toISOString(),
        appeal_notes: notes || null,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error reviewing appeal:", error);
      return NextResponse.json({ error: "Failed to review appeal" }, { status: 500 });
    }

    // If approved, reduce strike count and potentially restore access
    if (decision === "approved") {
      const { data: enforcement } = await supabase
        .from("user_enforcement_status")
        .select("*")
        .eq("community_id", violation.community_id)
        .eq("profile_id", violation.profile_id)
        .single();

      if (enforcement) {
        const newStrikes = Math.max(0, enforcement.total_strikes - 1);
        let newStatus = "good_standing";
        
        if (newStrikes >= 4) newStatus = "banned";
        else if (newStrikes >= 2) newStatus = "suspended";
        else if (newStrikes >= 1) newStatus = "warned";

        await supabase
          .from("user_enforcement_status")
          .update({
            total_strikes: newStrikes,
            status: newStatus,
            suspended_until: newStatus !== "suspended" ? null : enforcement.suspended_until,
            banned_at: newStatus !== "banned" ? null : enforcement.banned_at,
          })
          .eq("id", enforcement.id);
      }
    }

    return NextResponse.json({ success: true, violation: updatedViolation });
  } catch (error) {
    console.error("Appeal API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
