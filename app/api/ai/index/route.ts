import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import {
  indexCommunityPosts,
  indexCommunityLessons,
  indexCommunityResources,
  getIndexingStatus,
  isEmbeddingsAvailable,
} from "@/lib/ai/rag";

/**
 * GET /api/ai/index
 * Get indexing status for a community
 * Query params: communityId
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
        { error: "communityId is required" },
        { status: 400 }
      );
    }

    // Verify user is admin
    const supabase = await createAdminClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("clerk_user_id", userId)
      .eq("community_id", communityId)
      .single();

    if (!profile || profile.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can view indexing status" },
        { status: 403 }
      );
    }

    const status = await getIndexingStatus(communityId);

    return NextResponse.json({
      available: isEmbeddingsAvailable(),
      ...status,
    });
  } catch (error) {
    console.error(
      "Index GET error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Failed to get indexing status" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai/index
 * Index community content (posts, lessons, resources)
 * Body: { communityId, contentTypes?: string[] }
 */
export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { communityId, contentTypes } = await req.json();

    if (!communityId) {
      return NextResponse.json(
        { error: "communityId is required" },
        { status: 400 }
      );
    }

    // Check if embeddings are available
    if (!isEmbeddingsAvailable()) {
      return NextResponse.json(
        { error: "Embeddings service not configured (OPENAI_API_KEY required)" },
        { status: 503 }
      );
    }

    // Verify user is admin
    const supabase = await createAdminClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("clerk_user_id", userId)
      .eq("community_id", communityId)
      .single();

    if (!profile || profile.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can index content" },
        { status: 403 }
      );
    }

    // Index requested content types (or all)
    const types = contentTypes || ["posts", "lessons", "resources"];
    const results: Record<string, number> = {};

    if (types.includes("posts")) {
      results.posts = await indexCommunityPosts(communityId);
    }

    if (types.includes("lessons")) {
      results.lessons = await indexCommunityLessons(communityId);
    }

    if (types.includes("resources")) {
      results.resources = await indexCommunityResources(communityId);
    }

    return NextResponse.json({
      success: true,
      indexed: results,
      total: Object.values(results).reduce((a, b) => a + b, 0),
    });
  } catch (error) {
    console.error(
      "Index POST error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Failed to index content" },
      { status: 500 }
    );
  }
}
