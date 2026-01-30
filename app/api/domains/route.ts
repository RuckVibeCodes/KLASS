import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;

// GET /api/domains?communityId=xxx - Get domain status
export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const communityId = request.nextUrl.searchParams.get("communityId");
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

  // Get community domain info
  const { data: community } = await supabase
    .from("communities")
    .select("custom_domain, custom_domain_verified, custom_domain_verified_at")
    .eq("id", communityId)
    .single();

  if (!community) {
    return NextResponse.json({ error: "Community not found" }, { status: 404 });
  }

  return NextResponse.json({
    domain: community.custom_domain,
    verified: community.custom_domain_verified,
    verifiedAt: community.custom_domain_verified_at,
  });
}

// POST /api/domains - Add a custom domain
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { communityId, domain } = body;

  if (!communityId || !domain) {
    return NextResponse.json(
      { error: "Missing required fields: communityId, domain" },
      { status: 400 }
    );
  }

  // Validate domain format
  const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
  if (!domainRegex.test(domain)) {
    return NextResponse.json(
      { error: "Invalid domain format" },
      { status: 400 }
    );
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

  // Check if domain is already in use
  const { data: existingCommunity } = await supabase
    .from("communities")
    .select("id")
    .eq("custom_domain", domain.toLowerCase())
    .single();

  if (existingCommunity && existingCommunity.id !== communityId) {
    return NextResponse.json(
      { error: "This domain is already in use by another community" },
      { status: 409 }
    );
  }

  // Add domain to Vercel (if configured)
  let vercelAdded = false;
  if (VERCEL_TOKEN && VERCEL_PROJECT_ID) {
    try {
      const vercelResponse = await fetch(
        `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/domains${
          VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ""
        }`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${VERCEL_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: domain.toLowerCase() }),
        }
      );

      if (vercelResponse.ok) {
        vercelAdded = true;
      } else {
        const vercelError = await vercelResponse.json();
        console.error("Vercel domain error:", vercelError);
        // Don't fail - still save to DB, user can retry verification
      }
    } catch (vercelError) {
      console.error("Vercel API error:", vercelError);
    }
  }

  // Save domain to database
  const { data: community, error } = await supabase
    .from("communities")
    .update({
      custom_domain: domain.toLowerCase(),
      custom_domain_verified: false,
      custom_domain_verified_at: null,
    })
    .eq("id", communityId)
    .select()
    .single();

  if (error) {
    console.error("Failed to save domain:", error);
    return NextResponse.json(
      { error: "Failed to save domain" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    domain: community.custom_domain,
    vercelAdded,
    dnsRecords: [
      {
        type: "CNAME",
        name: domain.split(".")[0], // subdomain part
        value: "cname.vercel-dns.com",
      },
    ],
  });
}

// DELETE /api/domains - Remove a custom domain
export async function DELETE(request: NextRequest) {
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

  // Get current domain
  const { data: community } = await supabase
    .from("communities")
    .select("custom_domain")
    .eq("id", communityId)
    .single();

  if (!community?.custom_domain) {
    return NextResponse.json({ error: "No domain configured" }, { status: 404 });
  }

  // Remove from Vercel (if configured)
  if (VERCEL_TOKEN && VERCEL_PROJECT_ID) {
    try {
      await fetch(
        `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains/${community.custom_domain}${
          VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ""
        }`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${VERCEL_TOKEN}`,
          },
        }
      );
    } catch (vercelError) {
      console.error("Vercel delete error:", vercelError);
    }
  }

  // Remove from database
  const { error } = await supabase
    .from("communities")
    .update({
      custom_domain: null,
      custom_domain_verified: false,
      custom_domain_verified_at: null,
    })
    .eq("id", communityId);

  if (error) {
    console.error("Failed to remove domain:", error);
    return NextResponse.json(
      { error: "Failed to remove domain" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
