"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";

// ============================================================================
// LESSON COMMENTS
// ============================================================================

export async function createLessonComment(
  lessonId: string,
  programId: string,
  communitySlug: string,
  data: {
    content: string;
    parent_comment_id?: string | null;
  }
) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  const supabase = await createClient();

  // Get user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_user_id", userId)
    .single();

  if (!profile) {
    return { error: "Profile not found" };
  }

  const adminSupabase = await createAdminClient();

  const { data: comment, error } = await adminSupabase
    .from("lesson_comments")
    .insert({
      lesson_id: lessonId,
      profile_id: profile.id,
      content: data.content,
      parent_comment_id: data.parent_comment_id || null,
    })
    .select(`
      *,
      profile:profiles (
        id,
        display_name,
        avatar_url,
        role
      )
    `)
    .single();

  if (error) {
    console.error("Failed to create comment:", error.message);
    return { error: "Failed to create comment" };
  }

  revalidatePath(`/${communitySlug}/programs/${programId}/lessons/${lessonId}`);

  return { data: comment };
}

export async function updateLessonComment(
  commentId: string,
  lessonId: string,
  programId: string,
  communitySlug: string,
  data: {
    content: string;
  }
) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  const supabase = await createClient();

  // Get user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_user_id", userId)
    .single();

  if (!profile) {
    return { error: "Profile not found" };
  }

  const adminSupabase = await createAdminClient();

  // Verify ownership
  const { data: existingComment } = await adminSupabase
    .from("lesson_comments")
    .select("profile_id")
    .eq("id", commentId)
    .single();

  if (!existingComment || existingComment.profile_id !== profile.id) {
    return { error: "Not authorized to edit this comment" };
  }

  const { data: comment, error } = await adminSupabase
    .from("lesson_comments")
    .update({ content: data.content })
    .eq("id", commentId)
    .select()
    .single();

  if (error) {
    console.error("Failed to update comment:", error.message);
    return { error: "Failed to update comment" };
  }

  revalidatePath(`/${communitySlug}/programs/${programId}/lessons/${lessonId}`);

  return { data: comment };
}

export async function deleteLessonComment(
  commentId: string,
  lessonId: string,
  programId: string,
  communitySlug: string
) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  const supabase = await createClient();

  // Get user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("clerk_user_id", userId)
    .single();

  if (!profile) {
    return { error: "Profile not found" };
  }

  const adminSupabase = await createAdminClient();

  // Verify ownership or admin
  const { data: existingComment } = await adminSupabase
    .from("lesson_comments")
    .select("profile_id")
    .eq("id", commentId)
    .single();

  if (!existingComment) {
    return { error: "Comment not found" };
  }

  if (existingComment.profile_id !== profile.id && profile.role !== "ADMIN") {
    return { error: "Not authorized to delete this comment" };
  }

  const { error } = await adminSupabase
    .from("lesson_comments")
    .delete()
    .eq("id", commentId);

  if (error) {
    console.error("Failed to delete comment:", error.message);
    return { error: "Failed to delete comment" };
  }

  revalidatePath(`/${communitySlug}/programs/${programId}/lessons/${lessonId}`);

  return { success: true };
}

export async function toggleCommentLike(
  commentId: string,
  lessonId: string,
  programId: string,
  communitySlug: string
) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  const supabase = await createClient();

  // Get user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_user_id", userId)
    .single();

  if (!profile) {
    return { error: "Profile not found" };
  }

  const adminSupabase = await createAdminClient();

  // Check if like exists
  const { data: existingLike } = await adminSupabase
    .from("lesson_comment_likes")
    .select("id")
    .eq("comment_id", commentId)
    .eq("profile_id", profile.id)
    .single();

  if (existingLike) {
    // Unlike
    const { error } = await adminSupabase
      .from("lesson_comment_likes")
      .delete()
      .eq("id", existingLike.id);

    if (error) {
      return { error: "Operation failed" };
    }

    // Update likes count
    await adminSupabase.rpc("decrement_comment_likes", { comment_id: commentId });
  } else {
    // Like
    const { error } = await adminSupabase
      .from("lesson_comment_likes")
      .insert({
        comment_id: commentId,
        profile_id: profile.id,
      });

    if (error) {
      return { error: "Operation failed" };
    }

    // Update likes count
    await adminSupabase.rpc("increment_comment_likes", { comment_id: commentId });
  }

  revalidatePath(`/${communitySlug}/programs/${programId}/lessons/${lessonId}`);

  return { success: true, liked: !existingLike };
}

export async function getLessonComments(lessonId: string) {
  const supabase = await createClient();
  const { userId } = await auth();

  // Get current user's profile for checking likes
  let userProfileId: string | null = null;
  if (userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("clerk_user_id", userId)
      .single();
    userProfileId = profile?.id || null;
  }

  // Get comments with profiles
  const { data: comments, error } = await supabase
    .from("lesson_comments")
    .select(`
      *,
      profile:profiles (
        id,
        display_name,
        avatar_url,
        role
      )
    `)
    .eq("lesson_id", lessonId)
    .is("parent_comment_id", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to get comments:", error.message);
    return { error: "Failed to get comments" };
  }

  // Get replies for each comment
  const commentIds = comments.map((c) => c.id);
  const { data: replies } = await supabase
    .from("lesson_comments")
    .select(`
      *,
      profile:profiles (
        id,
        display_name,
        avatar_url,
        role
      )
    `)
    .in("parent_comment_id", commentIds)
    .order("created_at", { ascending: true });

  // Get user's likes if logged in
  let userLikes: string[] = [];
  if (userProfileId) {
    const allCommentIds = [...commentIds, ...(replies?.map((r) => r.id) || [])];
    const { data: likes } = await supabase
      .from("lesson_comment_likes")
      .select("comment_id")
      .eq("profile_id", userProfileId)
      .in("comment_id", allCommentIds);
    userLikes = likes?.map((l) => l.comment_id) || [];
  }

  // Combine comments with replies
  const commentsWithReplies = comments.map((comment) => ({
    ...comment,
    isLiked: userLikes.includes(comment.id),
    replies: (replies || [])
      .filter((r) => r.parent_comment_id === comment.id)
      .map((r) => ({
        ...r,
        isLiked: userLikes.includes(r.id),
      })),
  }));

  return { data: commentsWithReplies };
}
