import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/stripe/connect/earnings?communityId=xxx
 *
 * Fetch earnings data for a community's Stripe Connect account.
 * Only accessible by community admins.
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

    // Get Connect account
    const { data: connectAccount } = await supabase
      .from("stripe_connect_accounts")
      .select("stripe_account_id, total_earnings_cents, platform_fee_percent")
      .eq("community_id", communityId)
      .single();

    if (!connectAccount) {
      return NextResponse.json({
        totalEarnings: 0,
        monthlyEarnings: 0,
        previousMonthEarnings: 0,
        totalMembers: 0,
        paidMembers: 0,
        platformFeePercent: 5,
        recentTransactions: [],
        pendingPayouts: 0,
      });
    }

    // Get current month and previous month dates
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Fetch earnings for current month
    const { data: currentMonthEarnings } = await supabase
      .from("connect_earnings")
      .select("net_amount_cents")
      .eq("community_id", communityId)
      .eq("status", "succeeded")
      .gte("created_at", startOfMonth.toISOString());

    const monthlyTotal =
      currentMonthEarnings?.reduce(
        (sum, e) => sum + (e.net_amount_cents || 0),
        0
      ) || 0;

    // Fetch earnings for previous month
    const { data: prevMonthEarnings } = await supabase
      .from("connect_earnings")
      .select("net_amount_cents")
      .eq("community_id", communityId)
      .eq("status", "succeeded")
      .gte("created_at", startOfPrevMonth.toISOString())
      .lt("created_at", startOfMonth.toISOString());

    const prevMonthTotal =
      prevMonthEarnings?.reduce(
        (sum, e) => sum + (e.net_amount_cents || 0),
        0
      ) || 0;

    // Get member counts
    const { count: totalMembers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("community_id", communityId);

    const { count: paidMembers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("community_id", communityId)
      .eq("tier", "PAID");

    // Get recent transactions
    const { data: recentTxs } = await supabase
      .from("connect_earnings")
      .select("*")
      .eq("community_id", communityId)
      .order("created_at", { ascending: false })
      .limit(10);

    const recentTransactions = (recentTxs || []).map((tx) => ({
      id: tx.id,
      amount: tx.gross_amount_cents || 0,
      platformFee: tx.platform_fee_cents || 0,
      netAmount: tx.net_amount_cents || 0,
      status: tx.status || "unknown",
      date: tx.created_at,
      description: tx.metadata?.description || null,
    }));

    // Get pending payouts
    const { data: pendingPayoutData } = await supabase
      .from("connect_payouts")
      .select("amount_cents")
      .eq("community_id", communityId)
      .eq("status", "pending");

    const pendingPayouts =
      pendingPayoutData?.reduce(
        (sum, p) => sum + (p.amount_cents || 0),
        0
      ) || 0;

    return NextResponse.json({
      totalEarnings: connectAccount.total_earnings_cents || 0,
      monthlyEarnings: monthlyTotal,
      previousMonthEarnings: prevMonthTotal,
      totalMembers: totalMembers || 0,
      paidMembers: paidMembers || 0,
      platformFeePercent: connectAccount.platform_fee_percent || 5,
      recentTransactions,
      pendingPayouts,
    });
  } catch (error) {
    console.error("Earnings fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch earnings" },
      { status: 500 }
    );
  }
}
