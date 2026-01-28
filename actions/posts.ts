"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isDemoSlug } from "@/lib/demo";
import { sendContentNotification, isEmailAvailable } from "@/lib/email";

export async function createPost(formData: FormData) {
  const communitySlugCheck = formData.get("communitySlug") as string;
  if (isDemoSlug(communitySlugCheck || "")) {
    return { id: "demo-post", content: formData.get("content") };
  }

  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const communityId = formData.get("communityId") as string;
  const content = formData.get("content") as string;
  const visibility = (formData.get("visibility") as string) || "members";
  const communitySlug = formData.get("communitySlug") as string;
  const mediaUrlsJson = formData.get("mediaUrls") as string | null;
  const mediaUrls = mediaUrlsJson ? JSON.parse(mediaUrlsJson) : [];
  const categoryId = formData.get("categoryId") as string | null;
  const pollQuestion = formData.get("pollQuestion") as string | null;
  const pollOptionsJson = formData.get("pollOptions") as string | null;
  const pollOptions = pollOptionsJson ? JSON.parse(pollOptionsJson) : [];

  // Allow post if it has content, media, or a poll
  const hasPoll = pollQuestion && pollOptions.length >= 2;
  if (!communityId || (!content && mediaUrls.length === 0 && !hasPoll)) {
    throw new Error("Missing required fields");
  }

  const supabase = await createClient();

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_user_id", userId)
    .eq("community_id", communityId)
    .single();

  if (!profile) {
    throw new Error("Profile not found");
  }

  // Create post
  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      community_id: communityId,
      author_profile_id: profile.id,
      content: content || "",
      visibility,
      media_urls: mediaUrls,
      category_id: categoryId || null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to create post:", error.message);
    throw new Error("Failed to create post");
  }

  // Create poll if provided
  if (hasPoll && post) {
    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .insert({
        post_id: post.id,
        question: pollQuestion,
      })
      .select("id")
      .single();

    if (pollError) {
      console.error("Failed to create poll:", pollError.message);
      throw new Error("Failed to create poll");
    }

    if (poll) {
      const pollOptionsData = pollOptions.map((text: string, index: number) => ({
        poll_id: poll.id,
        option_text: text,
        display_order: index,
      }));

      const { error: optionsError } = await supabase
        .from("poll_options")
        .insert(pollOptionsData);

      if (optionsError) {
        console.error("Failed to create poll options:", optionsError.message);
        throw new Error("Failed to create poll options");
      }
    }
  }

  // Send content notifications asynchronously to community admins (non-blocking)
  if (post && isEmailAvailable()) {
    const { data: admins } = await supabase
      .from("profiles")
      .select("display_name, email")
      .eq("community_id", communityId)
      .eq("role", "ADMIN")
      .neq("id", profile.id);

    const { data: community } = await supabase
      .from("communities")
      .select("name")
      .eq("id", communityId)
      .single();

    if (admins && community) {
      const contentPreview = content ? content.substring(0, 200) : undefined;
      for (const admin of admins) {
        if (admin.email) {
          sendContentNotification({
            recipientEmail: admin.email,
            recipientName: admin.display_name || "Admin",
            communityName: community.name,
            communitySlug,
            contentType: "post",
            contentTitle: contentPreview?.substring(0, 60) || "New post",
            contentPreview,
            authorName: profile ? undefined : undefined,
          }).catch((err) => {
            console.error("[Email] Content notification failed:", err);
          });
        }
      }
    }
  }

  revalidatePath(`/${communitySlug}`);
}

export async function deletePost(postId: string, communitySlug: string) {
  if (isDemoSlug(communitySlug)) return { success: true };

  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const supabase = await createClient();

  const { error } = await supabase.from("posts").delete().eq("id", postId);

  if (error) {
    console.error("Failed to delete post:", error.message);
    throw new Error("Failed to delete post");
  }

  revalidatePath(`/${communitySlug}`);
}

export async function togglePinPost(
  postId: string,
  communitySlug: string,
  pinned: boolean
) {
  if (isDemoSlug(communitySlug)) return { success: true };

  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("posts")
    .update({ pinned: !pinned })
    .eq("id", postId);

  if (error) {
    console.error("Failed to toggle pin:", error.message);
    throw new Error("Failed to update post");
  }

  revalidatePath(`/${communitySlug}`);
}

export async function createComment(formData: FormData) {
  const commentSlugCheck = formData.get("communitySlug") as string;
  if (isDemoSlug(commentSlugCheck || "")) {
    return { id: "demo-comment", content: formData.get("content") };
  }

  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const postId = formData.get("postId") as string;
  const content = formData.get("content") as string;
  const communityId = formData.get("communityId") as string;
  const communitySlug = formData.get("communitySlug") as string;
  const parentCommentId = formData.get("parentCommentId") as string | null;

  if (!postId || !content || !communityId) {
    throw new Error("Missing required fields");
  }

  const supabase = await createClient();

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_user_id", userId)
    .eq("community_id", communityId)
    .single();

  if (!profile) {
    throw new Error("Profile not found");
  }

  // Create comment
  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    author_profile_id: profile.id,
    content,
    parent_comment_id: parentCommentId || null,
  });

  if (error) {
    console.error("Failed to create comment:", error.message);
    throw new Error("Failed to create comment");
  }

  // Update post comment count
  await supabase.rpc("increment_comment_count", { post_id: postId });

  revalidatePath(`/${communitySlug}`);
}

export async function toggleLikePost(
  postId: string,
  communityId: string,
  communitySlug: string
) {
  if (isDemoSlug(communitySlug)) return { liked: true, count: Math.floor(Math.random() * 10) + 1 };

  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const supabase = await createClient();

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_user_id", userId)
    .eq("community_id", communityId)
    .single();

  if (!profile) {
    throw new Error("Profile not found");
  }

  // Toggle like using the database function
  const { data: liked, error } = await supabase.rpc("toggle_post_like", {
    p_post_id: postId,
    p_profile_id: profile.id,
  });

  if (error) {
    console.error("Failed to toggle like:", error.message);
    throw new Error("Failed to update like");
  }

  revalidatePath(`/${communitySlug}`);

  return liked;
}

export async function hasUserLikedPost(
  postId: string,
  profileId: string
): Promise<boolean> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("post_likes")
    .select("id")
    .eq("post_id", postId)
    .eq("profile_id", profileId)
    .single();

  return !!data;
}

export async function voteOnPoll(
  pollId: string,
  optionId: string,
  communityId: string,
  communitySlug: string
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const supabase = await createClient();

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_user_id", userId)
    .eq("community_id", communityId)
    .single();

  if (!profile) {
    throw new Error("Profile not found");
  }

  // Vote using the database function
  const { data: voted, error } = await supabase.rpc("vote_on_poll", {
    p_poll_id: pollId,
    p_option_id: optionId,
    p_profile_id: profile.id,
  });

  if (error) {
    console.error("Failed to vote on poll:", error.message);
    throw new Error("Failed to submit vote");
  }

  revalidatePath(`/${communitySlug}`);

  return voted;
}
