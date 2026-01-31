import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import {
  getMonthlyUsage,
  getCommunityAITier,
  getUsageHistory,
} from "@/lib/ai/usage-tracking";

/**
 * GET /api/ai/usage
 * Get AI usage stats for a community
 * Query params: communityId, days (for history)
 */
export async function GET(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const communityId = searchParams.get("communityId");
    const days = parseInt(searchParams.get("days") || "30", 10);

    if (!communityId) {
      return NextResponse.json(
        { error: "communityId is required" },
        { status: 400 }
      );
    }

    // Verify user is admin of this community
    const supabase = await createAdminClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("clerk_user_id", userId)
      .eq("community_id", communityId)
      .single();

    if (!profile || profile.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can view AI usage" },
        { status: 403 }
      );
    }

    // Get usage data
    const [monthlyUsage, tier, history] = await Promise.all([
      getMonthlyUsage(communityId),
      getCommunityAITier(communityId),
      getUsageHistory(communityId, days),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        monthly: monthlyUsage,
        tier,
        history,
      },
    });
  } catch (error) {
    console.error(
      "AI usage API error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Failed to get AI usage" },
      { status: 500 }
    );
  }
}
