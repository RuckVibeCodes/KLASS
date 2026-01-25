import { SupabaseClient } from "@supabase/supabase-js";

export interface SystemTag {
  id: string;
  name: string;
  color: string;
  description: string;
}

// System tag definitions (computed on-read, not stored)
export const SYSTEM_TAGS: Record<string, SystemTag> = {
  "new-member": {
    id: "system-new-member",
    name: "New Member",
    color: "#22c55e", // green
    description: "Joined in the last 7 days",
  },
  "inactive-14d": {
    id: "system-inactive-14d",
    name: "Inactive 14d",
    color: "#f59e0b", // amber
    description: "No activity in the last 14 days",
  },
  "no-posts": {
    id: "system-no-posts",
    name: "No Posts",
    color: "#ef4444", // red
    description: "Has never created a post",
  },
  "active-streak": {
    id: "system-active-streak",
    name: "Active Streak",
    color: "#8b5cf6", // purple
    description: "Activity every day for 7+ days",
  },
};

export interface ProfileWithSystemTags {
  id: string;
  systemTags: SystemTag[];
}

// Compute system tags for a single profile
export async function computeSystemTags(
  supabase: SupabaseClient,
  profileId: string,
  communityId: string
): Promise<SystemTag[]> {
  const tags: SystemTag[] = [];

  // Get profile data
  const { data: profile } = await supabase
    .from("profiles")
    .select("created_at")
    .eq("id", profileId)
    .single();

  if (!profile) return tags;

  const now = new Date();
  const createdAt = new Date(profile.created_at);
  const daysSinceJoined = Math.floor(
    (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  // New member (joined in last 7 days)
  if (daysSinceJoined <= 7) {
    tags.push(SYSTEM_TAGS["new-member"]);
  }

  // Check posts
  const { count: postCount } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("author_id", profileId);

  // No posts ever
  if (postCount === 0) {
    tags.push(SYSTEM_TAGS["no-posts"]);
  }

  // Check recent activity (posts, comments, lesson completions)
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();

  const [{ count: recentPosts }, { count: recentComments }, { count: recentCompletions }] =
    await Promise.all([
      supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("author_id", profileId)
        .gte("created_at", fourteenDaysAgo),
      supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("author_id", profileId)
        .gte("created_at", fourteenDaysAgo),
      supabase
        .from("lesson_completions")
        .select("*", { count: "exact", head: true })
        .eq("profile_id", profileId)
        .gte("completed_at", fourteenDaysAgo),
    ]);

  const hasRecentActivity =
    (recentPosts || 0) > 0 || (recentComments || 0) > 0 || (recentCompletions || 0) > 0;

  // Inactive 14 days (not new, no recent activity)
  if (daysSinceJoined > 14 && !hasRecentActivity) {
    tags.push(SYSTEM_TAGS["inactive-14d"]);
  }

  // Active streak (activity every day for 7+ days) - simplified check
  // This is a more complex query, for now we'll use a simplified version
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: recentActivityDays } = await supabase.rpc("get_activity_days", {
    p_profile_id: profileId,
    p_since: sevenDaysAgo,
  });

  // If we have activity on 7 different days, they have an active streak
  if (recentActivityDays && recentActivityDays >= 7) {
    tags.push(SYSTEM_TAGS["active-streak"]);
  }

  return tags;
}

// Compute system tags for multiple profiles (batched for efficiency)
export async function computeSystemTagsBatch(
  supabase: SupabaseClient,
  profileIds: string[],
  communityId: string
): Promise<Map<string, SystemTag[]>> {
  const result = new Map<string, SystemTag[]>();
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // Get all profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, created_at")
    .in("id", profileIds);

  if (!profiles) return result;

  // Initialize all profiles with empty arrays
  profileIds.forEach((id) => result.set(id, []));

  // Get post counts per profile
  const { data: postCounts } = await supabase
    .from("posts")
    .select("author_id")
    .in("author_id", profileIds);

  const postCountMap = new Map<string, number>();
  postCounts?.forEach((p) => {
    postCountMap.set(p.author_id, (postCountMap.get(p.author_id) || 0) + 1);
  });

  // Get recent activity per profile
  const { data: recentPosts } = await supabase
    .from("posts")
    .select("author_id")
    .in("author_id", profileIds)
    .gte("created_at", fourteenDaysAgo.toISOString());

  const { data: recentComments } = await supabase
    .from("comments")
    .select("author_id")
    .in("author_id", profileIds)
    .gte("created_at", fourteenDaysAgo.toISOString());

  const recentActivitySet = new Set<string>();
  recentPosts?.forEach((p) => recentActivitySet.add(p.author_id));
  recentComments?.forEach((c) => recentActivitySet.add(c.author_id));

  // Process each profile
  profiles.forEach((profile) => {
    const tags: SystemTag[] = [];
    const createdAt = new Date(profile.created_at);
    const daysSinceJoined = Math.floor(
      (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    // New member
    if (daysSinceJoined <= 7) {
      tags.push(SYSTEM_TAGS["new-member"]);
    }

    // No posts
    if (!postCountMap.has(profile.id) || postCountMap.get(profile.id) === 0) {
      tags.push(SYSTEM_TAGS["no-posts"]);
    }

    // Inactive 14 days
    if (daysSinceJoined > 14 && !recentActivitySet.has(profile.id)) {
      tags.push(SYSTEM_TAGS["inactive-14d"]);
    }

    result.set(profile.id, tags);
  });

  return result;
}

// Get profiles matching a specific system tag
export async function getProfilesBySystemTag(
  supabase: SupabaseClient,
  communityId: string,
  tagKey: keyof typeof SYSTEM_TAGS
): Promise<string[]> {
  const now = new Date();
  const profileIds: string[] = [];

  switch (tagKey) {
    case "new-member": {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("community_id", communityId)
        .gte("created_at", sevenDaysAgo);
      data?.forEach((p) => profileIds.push(p.id));
      break;
    }
    case "no-posts": {
      // Get all profiles in community
      const { data: allProfiles } = await supabase
        .from("profiles")
        .select("id")
        .eq("community_id", communityId);

      // Get profiles with posts
      const { data: postsAuthors } = await supabase
        .from("posts")
        .select("author_id")
        .eq("community_id", communityId);

      const authorsWithPosts = new Set(postsAuthors?.map((p) => p.author_id));
      allProfiles?.forEach((p) => {
        if (!authorsWithPosts.has(p.id)) {
          profileIds.push(p.id);
        }
      });
      break;
    }
    case "inactive-14d": {
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();

      // Get all profiles older than 14 days
      const { data: oldProfiles } = await supabase
        .from("profiles")
        .select("id")
        .eq("community_id", communityId)
        .lt("created_at", fourteenDaysAgo);

      // Get profiles with recent activity
      const { data: recentPosts } = await supabase
        .from("posts")
        .select("author_id")
        .eq("community_id", communityId)
        .gte("created_at", fourteenDaysAgo);

      const { data: recentComments } = await supabase
        .from("comments")
        .select("author_id")
        .gte("created_at", fourteenDaysAgo);

      const activeProfiles = new Set<string>();
      recentPosts?.forEach((p) => activeProfiles.add(p.author_id));
      recentComments?.forEach((c) => activeProfiles.add(c.author_id));

      oldProfiles?.forEach((p) => {
        if (!activeProfiles.has(p.id)) {
          profileIds.push(p.id);
        }
      });
      break;
    }
  }

  return profileIds;
}
