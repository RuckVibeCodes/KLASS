import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { AILimitExceededError } from "@/lib/ai/client";
import {
  sendAssistantMessage,
  getAdminAssistantSessions,
  getAssistantSession,
  generateWelcomePost,
  generateContentIdeas,
  analyzeEngagement,
} from "@/lib/ai/assistant";

/**
 * GET /api/ai/assistant
 * Get assistant sessions or a specific session
 * Query params: communityId, sessionId (optional)
 */
export async function GET(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const communityId = searchParams.get("communityId");
    const sessionId = searchParams.get("sessionId");

    if (!communityId) {
      return NextResponse.json(
        { error: "communityId is required" },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    // Verify user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("clerk_user_id", userId)
      .eq("community_id", communityId)
      .single();

    if (!profile || profile.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can access the creator assistant" },
        { status: 403 }
      );
    }

    // Check if AI is enabled
    const aiEnabled = await isFeatureEnabled(communityId, "ai_enabled");
    if (!aiEnabled) {
      return NextResponse.json(
        { error: "AI features are not enabled for this community" },
        { status: 403 }
      );
    }

    // Get specific session or list all
    if (sessionId) {
      const session = await getAssistantSession(sessionId, profile.id);
      if (!session) {
        return NextResponse.json(
          { error: "Session not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ session });
    }

    const sessions = await getAdminAssistantSessions(communityId, profile.id);
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error(
      "Assistant GET error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Failed to get assistant data" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai/assistant
 * Send a message or use a quick action
 * Body: { communityId, message?, sessionId?, action? }
 * Actions: 'welcome', 'ideas', 'engagement'
 */
export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { communityId, message, sessionId, action } = await req.json();

    if (!communityId) {
      return NextResponse.json(
        { error: "communityId is required" },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    // Verify user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("clerk_user_id", userId)
      .eq("community_id", communityId)
      .single();

    if (!profile || profile.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can access the creator assistant" },
        { status: 403 }
      );
    }

    // Check if AI is enabled
    const aiEnabled = await isFeatureEnabled(communityId, "ai_enabled");
    if (!aiEnabled) {
      return NextResponse.json(
        { error: "AI features are not enabled for this community" },
        { status: 403 }
      );
    }

    // Handle quick actions
    if (action) {
      let result: string;

      switch (action) {
        case "welcome":
          result = await generateWelcomePost(communityId, userId);
          break;
        case "ideas":
          result = await generateContentIdeas(communityId, 5, userId);
          break;
        case "engagement":
          result = await analyzeEngagement(communityId, userId);
          break;
        default:
          return NextResponse.json(
            { error: "Invalid action" },
            { status: 400 }
          );
      }

      return NextResponse.json({
        success: true,
        message: result,
        action,
      });
    }

    // Handle regular chat message
    if (!message) {
      return NextResponse.json(
        { error: "message or action is required" },
        { status: 400 }
      );
    }

    const response = await sendAssistantMessage(
      communityId,
      profile.id,
      sessionId || null,
      message,
      userId
    );

    return NextResponse.json({
      success: true,
      ...response,
    });
  } catch (error) {
    if (error instanceof AILimitExceededError) {
      return NextResponse.json(
        { error: error.message, code: "LIMIT_EXCEEDED" },
        { status: 429 }
      );
    }

    console.error(
      "Assistant POST error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
