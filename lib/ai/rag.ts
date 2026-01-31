/**
 * RAG (Retrieval Augmented Generation) for KLASS Member Chatbot
 * 
 * Features:
 * - Content indexing (posts, lessons, resources)
 * - Semantic search using embeddings
 * - Context retrieval for chatbot
 * 
 * Requires OPENAI_API_KEY for embeddings.
 */

import OpenAI from "openai";
import { createAdminClient } from "@/lib/supabase/server";

// ============================================
// Types
// ============================================

export type ContentType = "post" | "lesson" | "resource" | "comment";

export interface ContentChunk {
  content_type: ContentType;
  content_id: string;
  chunk_index: number;
  chunk_text: string;
  metadata: {
    title?: string;
    author?: string;
    visibility?: string;
    created_at?: string;
  };
}

export interface SearchResult {
  id: string;
  content_type: ContentType;
  content_id: string;
  chunk_text: string;
  metadata: Record<string, unknown>;
  similarity: number;
}

export interface ChatContext {
  sources: SearchResult[];
  contextText: string;
}

// ============================================
// OpenAI Client
// ============================================

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is required for embeddings");
    }
    _openai = new OpenAI({ apiKey });
  }
  return _openai;
}

export function isEmbeddingsAvailable(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

// ============================================
// Embedding Generation
// ============================================

const EMBEDDING_MODEL = "text-embedding-3-small";
const MAX_CHUNK_LENGTH = 1500; // Characters per chunk

/**
 * Generate embedding for a text string
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const openai = getOpenAI();
  
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.substring(0, 8000), // Max input length
  });

  return response.data[0].embedding;
}

/**
 * Split text into chunks for embedding
 */
function splitIntoChunks(text: string): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  let currentChunk = "";

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > MAX_CHUNK_LENGTH) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? " " : "") + sentence;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [text.substring(0, MAX_CHUNK_LENGTH)];
}

// ============================================
// Content Indexing
// ============================================

/**
 * Index a piece of content (creates embeddings and stores them)
 */
export async function indexContent(
  communityId: string,
  contentType: ContentType,
  contentId: string,
  text: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  const supabase = await createAdminClient();

  // Delete existing embeddings for this content
  await supabase
    .from("content_embeddings")
    .delete()
    .eq("content_type", contentType)
    .eq("content_id", contentId);

  // Split text into chunks
  const chunks = splitIntoChunks(text);

  // Generate and store embeddings for each chunk
  for (let i = 0; i < chunks.length; i++) {
    const chunkText = chunks[i];
    const embedding = await generateEmbedding(chunkText);

    await supabase.from("content_embeddings").insert({
      community_id: communityId,
      content_type: contentType,
      content_id: contentId,
      chunk_index: i,
      chunk_text: chunkText,
      embedding: embedding,
      metadata,
    });
  }
}

/**
 * Index all posts in a community
 */
export async function indexCommunityPosts(communityId: string): Promise<number> {
  const supabase = await createAdminClient();

  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, content, created_at, author_profile_id, profiles(display_name)")
    .eq("community_id", communityId)
    .eq("visibility", "members"); // Only index member-visible content

  if (error || !posts) {
    console.error("Failed to fetch posts:", error);
    return 0;
  }

  let indexed = 0;
  for (const post of posts) {
    try {
      await indexContent(communityId, "post", post.id, post.content, {
        author: (post.profiles as { display_name?: string })?.display_name,
        created_at: post.created_at,
      });
      indexed++;
    } catch (err) {
      console.error(`Failed to index post ${post.id}:`, err);
    }
  }

  return indexed;
}

/**
 * Index all lessons in a community
 */
export async function indexCommunityLessons(communityId: string): Promise<number> {
  const supabase = await createAdminClient();

  const { data: lessons, error } = await supabase
    .from("lessons")
    .select(`
      id, 
      title, 
      description,
      programs!inner(community_id, visibility)
    `)
    .eq("programs.community_id", communityId);

  if (error || !lessons) {
    console.error("Failed to fetch lessons:", error);
    return 0;
  }

  let indexed = 0;
  for (const lesson of lessons) {
    try {
      const text = `${lesson.title}\n\n${lesson.description || ""}`;
      await indexContent(communityId, "lesson", lesson.id, text, {
        title: lesson.title,
      });
      indexed++;
    } catch (err) {
      console.error(`Failed to index lesson ${lesson.id}:`, err);
    }
  }

  return indexed;
}

/**
 * Index all resources in a community
 */
export async function indexCommunityResources(communityId: string): Promise<number> {
  const supabase = await createAdminClient();

  const { data: resources, error } = await supabase
    .from("resources")
    .select("id, title, description")
    .eq("community_id", communityId);

  if (error || !resources) {
    console.error("Failed to fetch resources:", error);
    return 0;
  }

  let indexed = 0;
  for (const resource of resources) {
    try {
      const text = `${resource.title}\n\n${resource.description || ""}`;
      await indexContent(communityId, "resource", resource.id, text, {
        title: resource.title,
      });
      indexed++;
    } catch (err) {
      console.error(`Failed to index resource ${resource.id}:`, err);
    }
  }

  return indexed;
}

// ============================================
// Semantic Search
// ============================================

/**
 * Search for relevant content using semantic similarity
 */
export async function searchContent(
  communityId: string,
  query: string,
  options: {
    contentTypes?: ContentType[];
    matchThreshold?: number;
    matchCount?: number;
  } = {}
): Promise<SearchResult[]> {
  const supabase = await createAdminClient();

  const {
    contentTypes = null,
    matchThreshold = 0.7,
    matchCount = 5,
  } = options;

  // Generate embedding for query
  const queryEmbedding = await generateEmbedding(query);

  // Search using the stored function
  const { data, error } = await supabase.rpc("search_content_embeddings", {
    query_embedding: queryEmbedding,
    community_uuid: communityId,
    match_threshold: matchThreshold,
    match_count: matchCount,
    content_types: contentTypes,
  });

  if (error) {
    console.error("Search failed:", error);
    return [];
  }

  return (data || []) as SearchResult[];
}

// ============================================
// Chat Context Building
// ============================================

/**
 * Build context for chatbot from search results
 */
export async function buildChatContext(
  communityId: string,
  query: string
): Promise<ChatContext> {
  const sources = await searchContent(communityId, query, {
    matchCount: 5,
    matchThreshold: 0.65,
  });

  if (sources.length === 0) {
    return {
      sources: [],
      contextText: "No relevant information found in the community content.",
    };
  }

  // Build context text from sources
  const contextParts = sources.map((source, i) => {
    const typeLabel = {
      post: "Community Post",
      lesson: "Lesson",
      resource: "Resource",
      comment: "Comment",
    }[source.content_type];

    return `[${i + 1}] ${typeLabel}:\n${source.chunk_text}`;
  });

  const contextText = contextParts.join("\n\n---\n\n");

  return { sources, contextText };
}

// ============================================
// Indexing Status
// ============================================

/**
 * Get indexing status for a community
 */
export async function getIndexingStatus(communityId: string): Promise<{
  total: number;
  byType: Record<ContentType, number>;
  lastUpdated: string | null;
}> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("content_embeddings")
    .select("content_type, updated_at")
    .eq("community_id", communityId);

  if (error || !data) {
    return { total: 0, byType: {} as Record<ContentType, number>, lastUpdated: null };
  }

  const byType: Record<string, number> = {};
  let lastUpdated: string | null = null;

  for (const row of data) {
    byType[row.content_type] = (byType[row.content_type] || 0) + 1;
    if (!lastUpdated || row.updated_at > lastUpdated) {
      lastUpdated = row.updated_at;
    }
  }

  return {
    total: data.length,
    byType: byType as Record<ContentType, number>,
    lastUpdated,
  };
}
