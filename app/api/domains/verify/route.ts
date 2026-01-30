import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;

// POST /api/domains/verify - Verify domain DNS configuration
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { communityId } = body;

  if (!communityId) {
    return NextResponse.json({ error: "Missing communityId" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Verify user is admin of this community
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("clerk_user_id", userId)
    .eq("community_id", communityId)
    .single();

  if (profile?.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  // Get community domain
  const { data: community } = await supabase
    .from("communities")
    .select("custom_domain")
    .eq("id", communityId)
    .single();

  if (!community?.custom_domain) {
    return NextResponse.json({ error: "No domain configured" }, { status: 404 });
  }

  // Check with Vercel API
  let verified = false;
  let vercelStatus = null;

  if (VERCEL_TOKEN && VERCEL_PROJECT_ID) {
    try {
      const vercelResponse = await fetch(
        `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains/${community.custom_domain}${
          VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ""
        }`,
        {
          headers: {
            Authorization: `Bearer ${VERCEL_TOKEN}`,
          },
        }
      );

      if (vercelResponse.ok) {
        const domainInfo = await vercelResponse.json();
        verified = domainInfo.verified === true;
        vercelStatus = domainInfo;
      }
    } catch (vercelError) {
      console.error("Vercel verification error:", vercelError);
    }
  }

  // Update database
  if (verified) {
    await supabase
      .from("communities")
      .update({
        custom_domain_verified: true,
        custom_domain_verified_at: new Date().toISOString(),
      })
      .eq("id", communityId);
  }

  return NextResponse.json({
    domain: community.custom_domain,
    verified,
    vercelStatus,
  });
}
