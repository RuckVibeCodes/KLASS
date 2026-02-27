import { createClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { PostForm } from "@/components/feed/post-form";
import { PostCard } from "@/components/feed/post-card";
import { CategoryFilterBar } from "@/components/feed/category-filter-bar";
import { UpcomingEventBanner } from "@/components/feed/upcoming-event-banner";
import { FeedFilter, type FeedSortOption } from "@/components/feed/feed-filter";
import { getCommunityBySlug, getProfileByClerkId } from "@/lib/supabase/queries";

// Revalidate every 60 seconds for fresh content
export const revalidate = 60;

export default async function CommunityHomePage({
  params,
  searchParams,
}: {
  params: Promise<{ "community-slug": string }>;
  searchParams: Promise<{ category?: string; sort?: string }>;
}) {
  const { userId } = await auth();
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const communitySlug = resolvedParams["community-slug"];
  const categoryFilter = resolvedSearchParams.category;
  const sortFilter = (resolvedSearchParams.sort || "default") as FeedSortOption;
  const supabase = await createClient();

  // Use cached query for community (deduplicated with layout)
  const community = await getCommunityBySlug(communitySlug);

  if (!community) return notFound();

  // Use cached query for profile (deduplicated with layout)
  const profile = userId ? await getProfileByClerkId(userId, community.id) : null;

  // Get post categories first (needed for filtering)
  const { data: categories } = await supabase
    .from("post_categories")
    .select("id, name, slug, color")
    .eq("community_id", community.id)
    .order("display_order");

  // Find category ID if filtering by category
  let filterCategoryId: string | null = null;
  if (categoryFilter) {
    const filterCategory = categories?.find((c) => c.slug === categoryFilter);
    filterCategoryId = filterCategory?.id || null;
  }

  // Get posts with authors, comments, categories, and polls
  let postsQuery = supabase
    .from("posts")
    .select(`
      *,
      author:profiles!posts_author_profile_id_fkey(id, display_name, avatar_url),
      category:post_categories(id, name, slug, color),
      comments:comments(
        id,
        content,
        created_at,
        parent_comment_id,
        author:profiles!comments_author_profile_id_fkey(id, display_name, avatar_url)
      ),
      poll:polls(
        id,
        question,
        ends_at,
        multiple_choice,
        options:poll_options(id, option_text, votes_count, display_order)
      )
    `)
    .eq("community_id", community.id);

  // Apply category filter if specified
  if (filterCategoryId) {
    postsQuery = postsQuery.eq("category_id", filterCategoryId);
  }

  // Apply sort filter
  // Always show pinned posts first
  postsQuery = postsQuery.order("pinned", { ascending: false });

  switch (sortFilter) {
    case "new":
      postsQuery = postsQuery.order("created_at", { ascending: false });
      break;
    case "top":
      postsQuery = postsQuery.order("likes_count", { ascending: false });
      break;
    case "unread":
      // For unread, we sort by newest - actual unread tracking would need a read_posts table
      postsQuery = postsQuery.order("created_at", { ascending: false });
      break;
    default:
      // Default: pinned first, then by engagement (likes + comments), then by date
      postsQuery = postsQuery.order("created_at", { ascending: false });
      break;
  }

  const { data: posts } = await postsQuery.limit(20);

  // Get user's poll votes and liked posts in parallel
  let userPollVotes: { poll_id: string; option_id: string }[] = [];
  let userLikedPostIds: string[] = [];

  if (profile) {
    const [votesResult, likesResult] = await Promise.all([
      supabase
        .from("poll_votes")
        .select("poll_id, option_id")
        .eq("profile_id", profile.id),
      supabase
        .from("post_likes")
        .select("post_id")
        .eq("profile_id", profile.id),
    ]);
    userPollVotes = votesResult.data || [];
    userLikedPostIds = likesResult.data?.map((l) => l.post_id) || [];
  }

  // Get all community members for @mentions
  const { data: members } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .eq("community_id", community.id)
    .order("display_name");

  // Get next upcoming event
  const { data: upcomingEvents } = await supabase
    .from("events")
    .select("*")
    .eq("community_id", community.id)
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(1);

  const upcomingEvent = upcomingEvents?.[0] || null;

  const isAdmin = profile?.role === "ADMIN";

  return (
    <div className="container max-w-3xl py-6 space-y-6">
      {/* Upcoming Event Banner */}
      {upcomingEvent && (
        <UpcomingEventBanner
          event={upcomingEvent}
          communitySlug={communitySlug}
          primaryColor={community.primary_color}
        />
      )}

      {/* Category Filter Bar with Feed Filter */}
      <div className="flex items-center gap-2">
        <div className="flex-1 overflow-hidden">
          {categories && categories.length > 0 && (
            <CategoryFilterBar
              categories={categories}
              primaryColor={community.primary_color}
            />
          )}
        </div>
        <FeedFilter currentSort={sortFilter} />
      </div>

      <PostForm
        profile={profile}
        communityId={community.id}
        communitySlug={communitySlug}
        members={members || []}
        categories={categories || []}
      />

      <div className="space-y-4">
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              communitySlug={communitySlug}
              communityId={community.id}
              isAdmin={isAdmin}
              currentProfileId={profile?.id}
              primaryColor={community.primary_color}
              isLiked={userLikedPostIds.includes(post.id)}
              members={members || []}
              userVotedOptionIds={userPollVotes
                .filter((v) => v.poll_id === post.poll?.[0]?.id)
                .map((v) => v.option_id)}
            />
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
              <p className="text-muted-foreground">
                Be the first to share something with the community!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
