import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/stripe/connect/status?communityId=xxx
 *
 * Get the Stripe Connect account status for a community.
 */
export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const communityId = searchParams.get("communityId");

    if (!communityId) {
      return NextResponse.json(
        { error: "Missing communityId" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Verify admin access
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("clerk_user_id", userId)
      .eq("community_id", communityId)
      .single();

    if (!profile || profile.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: account } = await supabase
      .from("stripe_connect_accounts")
      .select("*")
      .eq("community_id", communityId)
      .single();

    return NextResponse.json({ account: account || null });
  } catch (error) {
    console.error("Connect status error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Failed to fetch Connect status" },
      { status: 500 }
    );
  }
}
