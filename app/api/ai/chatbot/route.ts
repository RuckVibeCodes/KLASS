import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { isFeatureEnabled } from "@/lib/feature-flags";
import {
  sendChatMessage,
  getUserChatSessions,
  getChatSession,
  deleteChatSession,
} from "@/lib/ai/chatbot";
import { AILimitExceededError } from "@/lib/ai/client";

/**
 * GET /api/ai/chatbot
 * Get chat sessions or a specific session
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

    // Get user's profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, tier")
      .eq("clerk_user_id", userId)
      .eq("community_id", communityId)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "Not a member of this community" },
        { status: 403 }
      );
    }

    // Check if chatbot is enabled for this community
    const aiEnabled = await isFeatureEnabled(communityId, "ai_enabled");
    if (!aiEnabled) {
      return NextResponse.json(
        { error: "AI features are not enabled for this community" },
        { status: 403 }
      );
    }

    // Check if user has Pro tier
    if (profile.tier !== "PAID") {
      return NextResponse.json(
        { error: "Chatbot is a Pro feature. Upgrade to access." },
        { status: 403 }
      );
    }

    // Get specific session or list all
    if (sessionId) {
      const session = await getChatSession(sessionId, profile.id);
      if (!session) {
        return NextResponse.json(
          { error: "Session not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ session });
    }

    const sessions = await getUserChatSessions(communityId, profile.id);
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error(
      "Chatbot GET error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Failed to get chat data" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai/chatbot
 * Send a message and get a response
 * Body: { communityId, message, sessionId? }
 */
export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { communityId, message, sessionId } = await req.json();

    if (!communityId || !message) {
      return NextResponse.json(
        { error: "communityId and message are required" },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    // Get user's profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, tier")
      .eq("clerk_user_id", userId)
      .eq("community_id", communityId)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "Not a member of this community" },
        { status: 403 }
      );
    }

    // Check if chatbot is enabled
    const aiEnabled = await isFeatureEnabled(communityId, "ai_enabled");
    if (!aiEnabled) {
      return NextResponse.json(
        { error: "AI features are not enabled for this community" },
        { status: 403 }
      );
    }

    // Check Pro tier
    if (profile.tier !== "PAID") {
      return NextResponse.json(
        { error: "Chatbot is a Pro feature. Upgrade to access." },
        { status: 403 }
      );
    }

    // Send message and get response
    const response = await sendChatMessage(
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
      "Chatbot POST error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ai/chatbot
 * Delete a chat session
 * Query params: communityId, sessionId
 */
export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const communityId = searchParams.get("communityId");
    const sessionId = searchParams.get("sessionId");

    if (!communityId || !sessionId) {
      return NextResponse.json(
        { error: "communityId and sessionId are required" },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    // Get user's profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("clerk_user_id", userId)
      .eq("community_id", communityId)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "Not a member of this community" },
        { status: 403 }
      );
    }

    const success = await deleteChatSession(sessionId, profile.id);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      "Chatbot DELETE error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 }
    );
  }
}
