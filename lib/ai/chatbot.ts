/**
 * Member Chatbot Service for KLASS
 * 
 * RAG-powered chatbot that answers questions using community content.
 * Pro-only feature with usage tracking.
 */

import { createAdminClient } from "@/lib/supabase/server";
import { chatCompletion, canUseAIFeature, AILimitExceededError } from "./client";
import { buildChatContext, type SearchResult } from "./rag";

// ============================================
// Types
// ============================================

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: SearchResult[];
}

export interface ChatSession {
  id: string;
  communityId: string;
  profileId: string;
  title: string | null;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatResponse {
  message: string;
  sources: SearchResult[];
  sessionId: string;
}

// ============================================
// System Prompt
// ============================================

function buildSystemPrompt(communityName: string, context: string): string {
  return `You are a helpful assistant for the "${communityName}" community. Your role is to help members find information, answer questions, and guide them through the community content.

IMPORTANT RULES:
1. ONLY answer based on the provided context from the community content
2. If the context doesn't contain relevant information, say "I don't have information about that in our community content"
3. Be friendly, helpful, and concise
4. When referencing information, mention the source (e.g., "According to a lesson on..." or "In a community post...")
5. Don't make up information that isn't in the context
6. Keep responses focused and actionable

COMMUNITY CONTENT:
${context}

Remember: You represent this community. Be helpful but only share what's actually in the content above.`;
}

// ============================================
// Chat Session Management
// ============================================

/**
 * Create a new chat session
 */
export async function createChatSession(
  communityId: string,
  profileId: string
): Promise<string> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({
      community_id: communityId,
      profile_id: profileId,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error("Failed to create chat session");
  }

  return data.id;
}

/**
 * Get chat session with messages
 */
export async function getChatSession(
  sessionId: string,
  profileId: string
): Promise<ChatSession | null> {
  const supabase = await createAdminClient();

  // Get session
  const { data: session, error: sessionError } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("profile_id", profileId)
    .single();

  if (sessionError || !session) {
    return null;
  }

  // Get messages
  const { data: messages, error: messagesError } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (messagesError) {
    return null;
  }

  return {
    id: session.id,
    communityId: session.community_id,
    profileId: session.profile_id,
    title: session.title,
    messages: (messages || []).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
      sources: m.sources || undefined,
    })),
    createdAt: session.created_at,
    updatedAt: session.updated_at,
  };
}

/**
 * Get all chat sessions for a user in a community
 */
export async function getUserChatSessions(
  communityId: string,
  profileId: string
): Promise<Array<{ id: string; title: string | null; updatedAt: string }>> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("chat_sessions")
    .select("id, title, updated_at")
    .eq("community_id", communityId)
    .eq("profile_id", profileId)
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
 * Send a message and get a response
 */
export async function sendChatMessage(
  communityId: string,
  profileId: string,
  sessionId: string | null,
  userMessage: string,
  userId?: string
): Promise<ChatResponse> {
  const supabase = await createAdminClient();

  // Check if chatbot is allowed (Pro feature)
  const canUse = await canUseAIFeature(communityId, "chatbot");
  if (!canUse.allowed) {
    throw new AILimitExceededError(canUse.reason || "Chatbot not available");
  }

  // Get community name
  const { data: community } = await supabase
    .from("communities")
    .select("name")
    .eq("id", communityId)
    .single();

  if (!community) {
    throw new Error("Community not found");
  }

  // Create or get session
  let activeSessionId = sessionId;
  if (!activeSessionId) {
    activeSessionId = await createChatSession(communityId, profileId);
  }

  // Get conversation history
  const { data: historyMessages } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("session_id", activeSessionId)
    .order("created_at", { ascending: true })
    .limit(10); // Last 10 messages for context

  // Build RAG context
  const { sources, contextText } = await buildChatContext(communityId, userMessage);

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
    feature: "chatbot",
    messages,
    systemPrompt: buildSystemPrompt(community.name, contextText),
    maxTokens: 1024,
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
    sources: sources.map((s) => ({
      type: s.content_type,
      id: s.content_id,
      text: s.chunk_text.substring(0, 200),
      similarity: s.similarity,
    })),
  });

  // Update session title if first message
  if (!historyMessages || historyMessages.length === 0) {
    const title = userMessage.substring(0, 50) + (userMessage.length > 50 ? "..." : "");
    await supabase
      .from("chat_sessions")
      .update({ title, updated_at: new Date().toISOString() })
      .eq("id", activeSessionId);
  } else {
    // Just update timestamp
    await supabase
      .from("chat_sessions")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", activeSessionId);
  }

  return {
    message: response,
    sources,
    sessionId: activeSessionId,
  };
}

// ============================================
// Delete Session
// ============================================

/**
 * Delete a chat session and all its messages
 */
export async function deleteChatSession(
  sessionId: string,
  profileId: string
): Promise<boolean> {
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("chat_sessions")
    .delete()
    .eq("id", sessionId)
    .eq("profile_id", profileId);

  return !error;
}
