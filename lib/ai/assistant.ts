/**
 * Creator Assistant Service for KLASS
 * 
 * AI assistant for community admins/creators.
 * Helps with content creation, analytics insights, and community management.
 * Pro-only feature with usage tracking.
 */

import { createAdminClient } from "@/lib/supabase/server";
import { chatCompletion, canUseAIFeature, AILimitExceededError } from "./client";

// ============================================
// Types
// ============================================

export interface AssistantMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AssistantContext {
  communityName: string;
  memberCount: number;
  postCount: number;
  programCount: number;
  recentActivity: string;
}

export interface AssistantResponse {
  message: string;
  sessionId: string;
}

// ============================================
// Context Building
// ============================================

/**
 * Get community stats for assistant context
 */
async function getCommunityContext(communityId: string): Promise<AssistantContext> {
  const supabase = await createAdminClient();

  // Get community name
  const { data: community } = await supabase
    .from("communities")
    .select("name")
    .eq("id", communityId)
    .single();

  // Get member count
  const { count: memberCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("community_id", communityId);

  // Get post count
  const { count: postCount } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("community_id", communityId);

  // Get program count
  const { count: programCount } = await supabase
    .from("programs")
    .select("*", { count: "exact", head: true })
    .eq("community_id", communityId);

  // Get recent activity (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const { data: recentPosts } = await supabase
    .from("posts")
    .select("id")
    .eq("community_id", communityId)
    .gte("created_at", weekAgo.toISOString());

  const { data: recentMembers } = await supabase
    .from("profiles")
    .select("id")
    .eq("community_id", communityId)
    .gte("created_at", weekAgo.toISOString());

  const recentActivity = `In the last 7 days: ${recentPosts?.length || 0} new posts, ${recentMembers?.length || 0} new members.`;

  return {
    communityName: community?.name || "Unknown",
    memberCount: memberCount || 0,
    postCount: postCount || 0,
    programCount: programCount || 0,
    recentActivity,
  };
}

// ============================================
// System Prompt
// ============================================

function buildSystemPrompt(context: AssistantContext): string {
  return `You are a helpful assistant for community creators on KLASS, a platform similar to Skool.

You're helping the admin/creator of "${context.communityName}" manage and grow their community.

COMMUNITY STATS:
- Members: ${context.memberCount}
- Posts: ${context.postCount}
- Programs/Courses: ${context.programCount}
- ${context.recentActivity}

YOUR CAPABILITIES:
1. **Content Ideas** - Help brainstorm posts, lessons, and engagement content
2. **Analytics Insights** - Interpret engagement patterns and suggest improvements
3. **Member Engagement** - Strategies to boost participation and retention
4. **Community Building** - Best practices for growing and nurturing the community
5. **Course Planning** - Help structure programs and lesson outlines
6. **Welcome Content** - Draft onboarding messages, emails, and announcements

GUIDELINES:
- Be practical and actionable
- Give specific examples when possible
- Keep responses concise but helpful
- Reference the community stats when relevant
- Encourage consistent posting and engagement
- Suggest A/B testing for optimization

When asked to draft content, provide ready-to-use copy that matches the community's vibe.`;
}

// ============================================
// Session Management
// ============================================

/**
 * Create a new assistant session
 */
export async function createAssistantSession(
  communityId: string,
  profileId: string
): Promise<string> {
  const supabase = await createAdminClient();

  // Reuse chat_sessions table with a flag or separate table
  // For simplicity, we'll use a metadata flag
  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({
      community_id: communityId,
      profile_id: profileId,
      title: "Creator Assistant",
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error("Failed to create assistant session");
  }

  return data.id;
}

/**
 * Get assistant session with messages
 */
export async function getAssistantSession(
  sessionId: string,
  profileId: string
): Promise<{
  id: string;
  messages: AssistantMessage[];
} | null> {
  const supabase = await createAdminClient();

  // Verify session belongs to user
  const { data: session, error: sessionError } = await supabase
    .from("chat_sessions")
    .select("id")
    .eq("id", sessionId)
    .eq("profile_id", profileId)
    .single();

  if (sessionError || !session) {
    return null;
  }

  // Get messages
  const { data: messages, error: messagesError } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (messagesError) {
    return null;
  }

  return {
    id: session.id,
    messages: (messages || []).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  };
}

/**
 * Get all assistant sessions for an admin
 */
export async function getAdminAssistantSessions(
  communityId: string,
  profileId: string
): Promise<Array<{ id: string; title: string | null; updatedAt: string }>> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("chat_sessions")
    .select("id, title, updated_at")
    .eq("community_id", communityId)
    .eq("profile_id", profileId)
    .like("title", "Creator Assistant%")
    .order("updated_at", { ascending: false })
    .limit(20);

  if (error) {
    return [];
  }

  return (data || []).map((s) => ({
    id: s.id,
    title: s.title,
    updatedAt: s.updated_at,
  }));
}

// ============================================
// Chat Function
// ============================================

/**
 * Send a message to the creator assistant
 */
export async function sendAssistantMessage(
  communityId: string,
  profileId: string,
  sessionId: string | null,
  userMessage: string,
  userId?: string
): Promise<AssistantResponse> {
  const supabase = await createAdminClient();

  // Check if assistant is allowed (Pro feature)
  const canUse = await canUseAIFeature(communityId, "assistant");
  if (!canUse.allowed) {
    throw new AILimitExceededError(canUse.reason || "Assistant not available");
  }

  // Get community context
  const context = await getCommunityContext(communityId);

  // Create or get session
  let activeSessionId = sessionId;
  if (!activeSessionId) {
    activeSessionId = await createAssistantSession(communityId, profileId);
  }

  // Get conversation history
  const { data: historyMessages } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("session_id", activeSessionId)
    .order("created_at", { ascending: true })
    .limit(10);

  // Build message history
  const messages: Array<{ role: "user" | "assistant"; content: string }> = [
    ...(historyMessages || []).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: userMessage },
  ];

  // Generate response
  const response = await chatCompletion({
    communityId,
    userId,
    feature: "assistant",
    messages,
    systemPrompt: buildSystemPrompt(context),
    maxTokens: 1500,
  });

  // Save user message
  await supabase.from("chat_messages").insert({
    session_id: activeSessionId,
    role: "user",
    content: userMessage,
    sources: [],
  });

  // Save assistant response
  await supabase.from("chat_messages").insert({
    session_id: activeSessionId,
    role: "assistant",
    content: response,
    sources: [],
  });

  // Update session timestamp
  await supabase
    .from("chat_sessions")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", activeSessionId);

  return {
    message: response,
    sessionId: activeSessionId,
  };
}

// ============================================
// Quick Actions
// ============================================

/**
 * Generate a welcome post draft
 */
export async function generateWelcomePost(
  communityId: string,
  userId?: string
): Promise<string> {
  const canUse = await canUseAIFeature(communityId, "assistant");
  if (!canUse.allowed) {
    throw new AILimitExceededError(canUse.reason || "Assistant not available");
  }

  const context = await getCommunityContext(communityId);

  const response = await chatCompletion({
    communityId,
    userId,
    feature: "assistant",
    messages: [
      {
        role: "user",
        content: "Write a warm, engaging welcome post for new members. Include emojis, formatting, and clear next steps. Make it feel authentic, not corporate.",
      },
    ],
    systemPrompt: buildSystemPrompt(context),
    maxTokens: 800,
  });

  return response;
}

/**
 * Generate content ideas
 */
export async function generateContentIdeas(
  communityId: string,
  count: number = 5,
  userId?: string
): Promise<string> {
  const canUse = await canUseAIFeature(communityId, "assistant");
  if (!canUse.allowed) {
    throw new AILimitExceededError(canUse.reason || "Assistant not available");
  }

  const context = await getCommunityContext(communityId);

  const response = await chatCompletion({
    communityId,
    userId,
    feature: "assistant",
    messages: [
      {
        role: "user",
        content: `Give me ${count} engaging post ideas for my community. For each, include the post title/hook and a brief description of the content. Focus on driving engagement and discussion.`,
      },
    ],
    systemPrompt: buildSystemPrompt(context),
    maxTokens: 1000,
  });

  return response;
}

/**
 * Analyze engagement and suggest improvements
 */
export async function analyzeEngagement(
  communityId: string,
  userId?: string
): Promise<string> {
  const canUse = await canUseAIFeature(communityId, "assistant");
  if (!canUse.allowed) {
    throw new AILimitExceededError(canUse.reason || "Assistant not available");
  }

  const context = await getCommunityContext(communityId);

  const response = await chatCompletion({
    communityId,
    userId,
    feature: "assistant",
    messages: [
      {
        role: "user",
        content: "Based on my community stats, analyze the engagement level and give me 3-5 specific, actionable suggestions to improve it.",
      },
    ],
    systemPrompt: buildSystemPrompt(context),
    maxTokens: 1000,
  });

  return response;
}
