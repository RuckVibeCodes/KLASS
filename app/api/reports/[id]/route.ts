import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";

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
    const { status, actionTaken, resolutionNotes } = body;

    const supabase = await createClient();

    // Get the report first
    const { data: report } = await supabase
      .from("reports")
      .select("community_id")
      .eq("id", id)
      .single();

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Verify user is admin of this community
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("clerk_user_id", userId)
      .eq("community_id", report.community_id)
      .single();

    if (!profile || profile.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Build update object
    const updateData: Record<string, unknown> = {};
    
    if (status) {
      updateData.status = status;
    }
    
    if (actionTaken) {
      updateData.action_taken = actionTaken;
    }
    
    if (resolutionNotes !== undefined) {
      updateData.resolution_notes = resolutionNotes;
    }

    // If resolving, add resolver info
    if (status === "resolved" || status === "dismissed") {
      updateData.resolved_by = profile.id;
      updateData.resolved_at = new Date().toISOString();
    }

    const { data: updatedReport, error } = await supabase
      .from("reports")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating report:", error);
      return NextResponse.json({ error: "Failed to update report" }, { status: 500 });
    }

    return NextResponse.json({ success: true, report: updatedReport });
  } catch (error) {
    console.error("Report API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
