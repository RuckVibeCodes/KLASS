import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isFeatureEnabled } from "@/lib/feature-flags";
import {
  isAIAvailable,
  generateOnboardingContentAI,
} from "@/lib/ai/client";
import {
  generateOnboardingContent as generateOnboardingStub,
  type OnboardingInputs,
} from "@/lib/ai/prompts";

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

    // Use real AI if available
    if (isAIAvailable()) {
      try {
        const content = await generateOnboardingContentAI({
          communityName: community.name,
          communityType: communityType || "membership",
          communityDescription: communityDescription || "",
          tone: tone || "friendly",
          primaryCTA: primaryCTA || "",
        });

        return NextResponse.json({ ...content, source: "ai" });
      } catch (aiError) {
        console.error(
          "AI generation failed, falling back to templates:",
          aiError instanceof Error ? aiError.message : "Unknown error"
        );
        // Fall through to stub
      }
    }

    // Fallback: template-based generation
    const inputs: OnboardingInputs = {
      communityName: community.name,
      communityType: communityType || "membership",
      communityDescription: communityDescription || "",
      tone: tone || "friendly",
      primaryCTA: primaryCTA || "",
    };

    const content = generateOnboardingStub(inputs);

    return NextResponse.json({
      welcomePost: content.welcomePost,
      firstDm: content.firstDm,
      emailSubject: content.emailSubject,
      emailBody: content.emailBody,
      source: "template",
    });
  } catch (error) {
    console.error(
      "AI onboarding error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
