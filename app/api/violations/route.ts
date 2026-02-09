import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";

// Create a violation (issue a strike)
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      communityId, 
      profileId, 
      reportId,
      violationType, 
      severity,
      description,
      actionTaken 
    } = body;

    if (!communityId || !profileId || !violationType || !severity || !actionTaken) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify user is admin of this community
    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("clerk_user_id", userId)
      .eq("community_id", communityId)
      .single();

    if (!adminProfile || adminProfile.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Calculate suspension dates if applicable
    let suspensionStartsAt = null;
    let suspensionEndsAt = null;

    if (actionTaken === "suspension_7_days") {
      suspensionStartsAt = new Date().toISOString();
      suspensionEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    } else if (actionTaken === "suspension_30_days") {
      suspensionStartsAt = new Date().toISOString();
      suspensionEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    }

    // Create the violation
    const { data: violation, error } = await supabase
      .from("violations")
      .insert({
        community_id: communityId,
        profile_id: profileId,
        report_id: reportId || null,
        violation_type: violationType,
        severity,
        description: description || null,
        action_taken: actionTaken,
        suspension_starts_at: suspensionStartsAt,
        suspension_ends_at: suspensionEndsAt,
        issued_by: adminProfile.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating violation:", error);
      return NextResponse.json({ error: "Failed to create violation" }, { status: 500 });
    }

    // If there was a report, update it
    if (reportId) {
      await supabase
        .from("reports")
        .update({
          status: "resolved",
          action_taken: actionTaken.replace("_", " "),
          resolved_by: adminProfile.id,
          resolved_at: new Date().toISOString(),
        })
        .eq("id", reportId);
    }

    return NextResponse.json({ success: true, violation });
  } catch (error) {
    console.error("Violation API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Get violations for a user or community
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const communityId = searchParams.get("communityId");
    const profileId = searchParams.get("profileId");

    if (!communityId) {
      return NextResponse.json({ error: "Community ID required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify user is admin of this community
    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("clerk_user_id", userId)
      .eq("community_id", communityId)
      .single();

    if (!adminProfile || adminProfile.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Build query
    let query = supabase
      .from("violations")
      .select(`
        *,
        profile:profiles!violations_profile_id_fkey(id, display_name, avatar_url),
        issuer:profiles!violations_issued_by_fkey(id, display_name),
        report:reports(id, content_type, content_id)
      `)
      .eq("community_id", communityId)
      .order("created_at", { ascending: false });

    if (profileId) {
      query = query.eq("profile_id", profileId);
    }

    const { data: violations, error } = await query;

    if (error) {
      console.error("Error fetching violations:", error);
      return NextResponse.json({ error: "Failed to fetch violations" }, { status: 500 });
    }

    return NextResponse.json({ violations });
  } catch (error) {
    console.error("Violation API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
