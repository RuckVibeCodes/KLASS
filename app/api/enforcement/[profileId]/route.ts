import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";

// Get enforcement status for a user
export async function GET(
  request: Request,
  { params }: { params: Promise<{ profileId: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { profileId } = await params;
    const { searchParams } = new URL(request.url);
    const communityId = searchParams.get("communityId");

    if (!communityId) {
      return NextResponse.json({ error: "Community ID required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify user is admin or the user themselves
    const { data: requesterProfile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("clerk_user_id", userId)
      .eq("community_id", communityId)
      .single();

    const isAdmin = requesterProfile?.role === "ADMIN";
    const isSelf = requesterProfile?.id === profileId;

    if (!isAdmin && !isSelf) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get enforcement status
    const { data: enforcement } = await supabase
      .from("user_enforcement_status")
      .select("*")
      .eq("community_id", communityId)
      .eq("profile_id", profileId)
      .single();

    // Get violation history if admin
    let violations = null;
    if (isAdmin) {
      const { data } = await supabase
        .from("violations")
        .select(`
          *,
          issuer:profiles!violations_issued_by_fkey(id, display_name)
        `)
        .eq("community_id", communityId)
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false });
      violations = data;
    }

    return NextResponse.json({
      enforcement: enforcement || {
        status: "good_standing",
        total_strikes: 0,
        suspended_until: null,
        banned_at: null,
      },
      violations,
    });
  } catch (error) {
    console.error("Enforcement API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Update enforcement status (admin only)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ profileId: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { profileId } = await params;
    const body = await request.json();
    const { communityId, action, reason } = body;

    if (!communityId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify user is admin
    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("clerk_user_id", userId)
      .eq("community_id", communityId)
      .single();

    if (!adminProfile || adminProfile.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Get or create enforcement status
    let { data: enforcement } = await supabase
      .from("user_enforcement_status")
      .select("*")
      .eq("community_id", communityId)
      .eq("profile_id", profileId)
      .single();

    if (!enforcement) {
      const { data: newEnforcement } = await supabase
        .from("user_enforcement_status")
        .insert({
          community_id: communityId,
          profile_id: profileId,
          status: "good_standing",
          total_strikes: 0,
        })
        .select()
        .single();
      enforcement = newEnforcement;
    }

    // Apply action
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    switch (action) {
      case "lift_suspension":
        updates.status = enforcement.total_strikes > 0 ? "warned" : "good_standing";
        updates.suspended_until = null;
        break;
      case "lift_ban":
        updates.status = "good_standing";
        updates.banned_at = null;
        updates.ban_reason = null;
        updates.total_strikes = 0;
        break;
      case "suspend_7_days":
        updates.status = "suspended";
        updates.suspended_until = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case "suspend_30_days":
        updates.status = "suspended";
        updates.suspended_until = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case "ban":
        updates.status = "banned";
        updates.banned_at = new Date().toISOString();
        updates.ban_reason = reason || null;
        break;
      case "reset_strikes":
        updates.total_strikes = 0;
        updates.status = "good_standing";
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const { data: updatedEnforcement, error } = await supabase
      .from("user_enforcement_status")
      .update(updates)
      .eq("id", enforcement.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating enforcement:", error);
      return NextResponse.json({ error: "Failed to update enforcement" }, { status: 500 });
    }

    return NextResponse.json({ success: true, enforcement: updatedEnforcement });
  } catch (error) {
    console.error("Enforcement API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
