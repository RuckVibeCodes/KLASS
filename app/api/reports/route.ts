import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { communityId, contentType, contentId, reportedProfileId, reason, description } = body;

    if (!communityId || !contentType || !contentId || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const validReasons = [
      "spam", "harassment", "hate_speech", "violence", 
      "adult_content", "copyright", "misinformation", "illegal_activity", "other"
    ];
    
    if (!validReasons.includes(reason)) {
      return NextResponse.json({ error: "Invalid reason" }, { status: 400 });
    }

    const validContentTypes = ["post", "comment", "profile", "message", "event", "resource"];
    if (!validContentTypes.includes(contentType)) {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
    }

    const supabase = await createClient();

    // Get reporter's profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("clerk_user_id", userId)
      .eq("community_id", communityId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Check for duplicate report (same reporter, same content)
    const { data: existingReport } = await supabase
      .from("reports")
      .select("id")
      .eq("reporter_profile_id", profile.id)
      .eq("content_type", contentType)
      .eq("content_id", contentId)
      .eq("status", "pending")
      .single();

    if (existingReport) {
      return NextResponse.json({ error: "You have already reported this content" }, { status: 409 });
    }

    // Determine severity based on reason
    const severityMap: Record<string, string> = {
      violence: "critical",
      hate_speech: "high",
      adult_content: "high",
      illegal_activity: "critical",
      harassment: "medium",
      copyright: "medium",
      misinformation: "medium",
      spam: "low",
      other: "low",
    };

    // Create the report
    const { data: report, error } = await supabase
      .from("reports")
      .insert({
        community_id: communityId,
        reporter_profile_id: profile.id,
        content_type: contentType,
        content_id: contentId,
        reported_profile_id: reportedProfileId || null,
        reason,
        description: description || null,
        severity: severityMap[reason] || "low",
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating report:", error);
      return NextResponse.json({ error: "Failed to create report" }, { status: 500 });
    }

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error("Report API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const communityId = searchParams.get("communityId");
    const status = searchParams.get("status");

    if (!communityId) {
      return NextResponse.json({ error: "Community ID required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify user is admin of this community
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("clerk_user_id", userId)
      .eq("community_id", communityId)
      .single();

    if (!profile || profile.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Fetch reports
    let query = supabase
      .from("reports")
      .select(`
        *,
        reporter:profiles!reports_reporter_profile_id_fkey(id, display_name, avatar_url),
        reported:profiles!reports_reported_profile_id_fkey(id, display_name, avatar_url),
        resolver:profiles!reports_resolved_by_fkey(id, display_name)
      `)
      .eq("community_id", communityId)
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data: reports, error } = await query;

    if (error) {
      console.error("Error fetching reports:", error);
      return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
    }

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Report API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
