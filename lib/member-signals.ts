import { SupabaseClient } from "@supabase/supabase-js";

export interface MemberSignal {
  id: string;
  type: "new-no-post" | "inactive-14d" | "program-completion" | "new-this-week";
  title: string;
  description: string;
  count: number;
  members?: SignalMember[];
  actionLabel?: string;
  actionType?: "view" | "tag" | "dm";
  filterTag?: string; // System tag ID to filter members list
}

export interface SignalMember {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface MemberSignals {
  newNoPost: MemberSignal;
  inactive14Days: MemberSignal;
  recentCompletions: MemberSignal;
  newThisWeek: MemberSignal;
}

// Get all member signals for a community
export async function getMemberSignals(
  supabase: SupabaseClient,
  communityId: string
): Promise<MemberSignals> {
  const [newNoPost, inactive14Days, recentCompletions, newThisWeek] = await Promise.all([
    getNewMembersWithoutPosts(supabase, communityId),
    getInactiveMembers(supabase, communityId),
    getRecentProgramCompletions(supabase, communityId),
    getNewMembersThisWeek(supabase, communityId),
  ]);

  return {
    newNoPost,
    inactive14Days,
    recentCompletions,
    newThisWeek,
  };
}

// Members who joined in last 14 days but haven't posted
async function getNewMembersWithoutPosts(
  supabase: SupabaseClient,
  communityId: string
): Promise<MemberSignal> {
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

  // Get new members
  const { data: newMembers } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, created_at")
    .eq("community_id", communityId)
    .eq("role", "MEMBER")
    .gte("created_at", fourteenDaysAgo);

  if (!newMembers || newMembers.length === 0) {
    return {
      id: "new-no-post",
      type: "new-no-post",
      title: "New members without posts",
      description: "Members who joined recently but haven't posted yet",
      count: 0,
      members: [],
      actionLabel: "View Members",
      actionType: "view",
      filterTag: "system-no-posts",
    };
  }

  // Get those who have posted
  const { data: postsAuthors } = await supabase
    .from("posts")
    .select("author_id")
    .eq("community_id", communityId)
    .in("author_id", newMembers.map((m) => m.id));

  const authorsWithPosts = new Set(postsAuthors?.map((p) => p.author_id) || []);
  const membersWithoutPosts = newMembers.filter((m) => !authorsWithPosts.has(m.id));

  return {
    id: "new-no-post",
    type: "new-no-post",
    title: "New members without posts",
    description: "Members who joined recently but haven't posted yet",
    count: membersWithoutPosts.length,
    members: membersWithoutPosts.slice(0, 5),
    actionLabel: "View Members",
    actionType: "view",
    filterTag: "system-no-posts",
  };
}

// Members inactive for 14+ days
async function getInactiveMembers(
  supabase: SupabaseClient,
  communityId: string
): Promise<MemberSignal> {
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Get all non-admin members who joined more than 14 days ago
  const { data: oldMembers } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, created_at")
    .eq("community_id", communityId)
    .eq("role", "MEMBER")
    .lt("created_at", fourteenDaysAgo);

  if (!oldMembers || oldMembers.length === 0) {
    return {
      id: "inactive-14d",
      type: "inactive-14d",
      title: "Inactive members",
      description: "Members with no activity in the last 14 days",
      count: 0,
      members: [],
      actionLabel: "View Members",
      actionType: "view",
      filterTag: "system-inactive-14d",
    };
  }

  // Get recent activity (posts and comments)
  const { data: recentPosts } = await supabase
    .from("posts")
    .select("author_id")
    .eq("community_id", communityId)
    .gte("created_at", fourteenDaysAgo);

  const { data: recentComments } = await supabase
    .from("comments")
    .select("author_id")
    .gte("created_at", fourteenDaysAgo);

  const activeMembers = new Set([
    ...(recentPosts?.map((p) => p.author_id) || []),
    ...(recentComments?.map((c) => c.author_id) || []),
  ]);

  const inactiveMembers = oldMembers.filter((m) => !activeMembers.has(m.id));

  return {
    id: "inactive-14d",
    type: "inactive-14d",
    title: "Inactive members",
    description: "Members with no activity in the last 14 days",
    count: inactiveMembers.length,
    members: inactiveMembers.slice(0, 5),
    actionLabel: "View Members",
    actionType: "view",
    filterTag: "system-inactive-14d",
  };
}

// Members who recently completed programs
async function getRecentProgramCompletions(
  supabase: SupabaseClient,
  communityId: string
): Promise<MemberSignal> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Get programs with their lesson counts
  const { data: programs } = await supabase
    .from("programs")
    .select("id, title, lessons(id)")
    .eq("community_id", communityId);

  if (!programs || programs.length === 0) {
    return {
      id: "program-completion",
      type: "program-completion",
      title: "Recent program completions",
      description: "Members who completed a program in the last 7 days",
      count: 0,
      members: [],
      actionLabel: "View Members",
      actionType: "view",
    };
  }

  // Build a map of program ID to lesson count
  const programLessonCounts = new Map<string, number>();
  programs.forEach((p) => {
    const lessonCount = Array.isArray(p.lessons) ? p.lessons.length : 0;
    programLessonCounts.set(p.id, lessonCount);
  });

  // Get recent completions grouped by profile and program
  const { data: completions } = await supabase
    .from("lesson_completions")
    .select(`
      profile_id,
      lesson:lessons(program_id),
      completed_at
    `)
    .gte("completed_at", sevenDaysAgo);

  if (!completions || completions.length === 0) {
    return {
      id: "program-completion",
      type: "program-completion",
      title: "Recent program completions",
      description: "Members who completed a program in the last 7 days",
      count: 0,
      members: [],
      actionLabel: "View Members",
      actionType: "view",
    };
  }

  // Count completions per profile per program
  const profileProgramCompletions = new Map<string, Map<string, number>>();

  completions.forEach((c) => {
    // lesson can be an object or array depending on the join
    const lessonData = c.lesson as { program_id: string } | { program_id: string }[] | null;
    const programId = Array.isArray(lessonData)
      ? lessonData[0]?.program_id
      : lessonData?.program_id;
    if (!programId) return;

    if (!profileProgramCompletions.has(c.profile_id)) {
      profileProgramCompletions.set(c.profile_id, new Map());
    }
    const programMap = profileProgramCompletions.get(c.profile_id)!;
    programMap.set(programId, (programMap.get(programId) || 0) + 1);
  });

  // Find profiles who completed all lessons in any program
  const completedProfileIds = new Set<string>();
  profileProgramCompletions.forEach((programMap, profileId) => {
    programMap.forEach((completedCount, programId) => {
      const totalLessons = programLessonCounts.get(programId) || 0;
      if (totalLessons > 0 && completedCount >= totalLessons) {
        completedProfileIds.add(profileId);
      }
    });
  });

  if (completedProfileIds.size === 0) {
    return {
      id: "program-completion",
      type: "program-completion",
      title: "Recent program completions",
      description: "Members who completed a program in the last 7 days",
      count: 0,
      members: [],
      actionLabel: "View Members",
      actionType: "view",
    };
  }

  // Get profile details for completed members
  const { data: completedMembers } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, created_at")
    .in("id", Array.from(completedProfileIds));

  return {
    id: "program-completion",
    type: "program-completion",
    title: "Recent program completions",
    description: "Members who completed a program in the last 7 days",
    count: completedMembers?.length || 0,
    members: completedMembers?.slice(0, 5) || [],
    actionLabel: "View Members",
    actionType: "view",
  };
}

// New members this week
async function getNewMembersThisWeek(
  supabase: SupabaseClient,
  communityId: string
): Promise<MemberSignal> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: newMembers } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, created_at")
    .eq("community_id", communityId)
    .eq("role", "MEMBER")
    .gte("created_at", sevenDaysAgo)
    .order("created_at", { ascending: false });

  return {
    id: "new-this-week",
    type: "new-this-week",
    title: "New members this week",
    description: "Members who joined in the last 7 days",
    count: newMembers?.length || 0,
    members: newMembers?.slice(0, 5) || [],
    actionLabel: "View Members",
    actionType: "view",
    filterTag: "system-new-member",
  };
}

// Get a single signal with full member details
export async function getSignalMembers(
  supabase: SupabaseClient,
  communityId: string,
  signalType: MemberSignal["type"],
  limit: number = 50
): Promise<SignalMember[]> {
  const signal = await (async () => {
    switch (signalType) {
      case "new-no-post":
        return getNewMembersWithoutPosts(supabase, communityId);
      case "inactive-14d":
        return getInactiveMembers(supabase, communityId);
      case "program-completion":
        return getRecentProgramCompletions(supabase, communityId);
      case "new-this-week":
        return getNewMembersThisWeek(supabase, communityId);
      default:
        return null;
    }
  })();

  return signal?.members?.slice(0, limit) || [];
}
