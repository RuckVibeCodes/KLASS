import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/whop/settings
 *
 * Save or update Whop integration settings for a community.
 * Only accessible by community admins.
 */
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      communityId,
      enabled,
      whopProductId,
      whopAccessPassId,
      whopCompanyId,
    } = await req.json();

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
      return NextResponse.json(
        { error: "Only community admins can manage Whop settings" },
        { status: 403 }
      );
    }

    // Check if integration exists
    const { data: existing } = await supabase
      .from("whop_integrations")
      .select("id")
      .eq("community_id", communityId)
      .single();

    const integrationData = {
      community_id: communityId,
      enabled: enabled ?? false,
      whop_product_id: whopProductId || null,
      whop_access_pass_id: whopAccessPassId || null,
      whop_company_id: whopCompanyId || null,
    };

    if (existing) {
      // Update
      await supabase
        .from("whop_integrations")
        .update(integrationData)
        .eq("id", existing.id);
    } else {
      // Insert
      await supabase.from("whop_integrations").insert(integrationData);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Whop settings error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Failed to save Whop settings" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/whop/settings?communityId=xxx
 *
 * Get Whop integration settings for a community.
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

    const { data: integration } = await supabase
      .from("whop_integrations")
      .select("*")
      .eq("community_id", communityId)
      .single();

    // Get Whop member count
    const { count: whopMemberCount } = await supabase
      .from("whop_members")
      .select("*", { count: "exact", head: true })
      .eq("community_id", communityId)
      .eq("status", "active");

    return NextResponse.json({
      integration: integration || null,
      whopMemberCount: whopMemberCount || 0,
    });
  } catch (error) {
    console.error("Whop settings fetch error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Failed to fetch Whop settings" },
      { status: 500 }
    );
  }
}
