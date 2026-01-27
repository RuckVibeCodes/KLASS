import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { generateOnboardingContent, type OnboardingInputs } from "@/lib/ai/prompts";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      communitySlug,
      communityType,
      communityDescription,
      tone,
      primaryCTA,
    } = body;

    if (!communitySlug) {
      return NextResponse.json(
        { error: "Community slug is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get community and verify admin
    const { data: community } = await supabase
      .from("communities")
      .select("id, name")
      .eq("slug", communitySlug)
      .single();

    if (!community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

    // Verify user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("clerk_user_id", userId)
      .eq("community_id", community.id)
      .single();

    if (profile?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can generate onboarding content" },
        { status: 403 }
      );
    }

    // Check if AI is enabled for this community
    const aiEnabled = await isFeatureEnabled(community.id, "ai_enabled");
    if (!aiEnabled) {
      return NextResponse.json(
        { error: "AI features are not enabled for this community" },
        { status: 403 }
      );
    }

    // Generate content
    const inputs: OnboardingInputs = {
      communityName: community.name,
      communityType: communityType || "membership",
      communityDescription: communityDescription || "",
      tone: tone || "friendly",
      primaryCTA: primaryCTA || "",
    };

    const content = generateOnboardingContent(inputs);

    return NextResponse.json({
      welcomePost: content.welcomePost,
      firstDm: content.firstDm,
      emailSubject: content.emailSubject,
      emailBody: content.emailBody,
    });
  } catch (error) {
    console.error("AI onboarding error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
