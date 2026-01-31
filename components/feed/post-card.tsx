"use client";

import { useState, useTransition, useRef, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  deletePost,
  togglePinPost,
  createComment,
  toggleLikePost,
  voteOnPoll,
} from "@/actions/posts";
import { formatDistanceToNow } from "date-fns";
import {
  MessageSquare,
  Heart,
  Pin,
  MoreHorizontal,
  Trash2,
  Loader2,
  Reply,
  Crown,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useCommunity } from "@/components/providers/community-provider";

interface Member {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  parent_comment_id: string | null;
  author: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface PollOption {
  id: string;
  option_text: string;
  votes_count: number;
  display_order: number;
}

interface Poll {
  id: string;
  question: string;
  ends_at: string | null;
  multiple_choice: boolean;
  options: PollOption[];
}

interface PostCardProps {
  post: {
    id: string;
    content: string;
    media_urls: string[] | null;
    pinned: boolean;
    likes_count: number;
    comments_count: number;
    created_at: string;
    author: {
      id: string;
      display_name: string | null;
      avatar_url: string | null;
    } | null;
    comments?: Comment[];
    category?: Category | null;
    poll?: Poll[] | null;
    // Tier gating fields
    min_tier_id?: string | null;
    min_tier?: {
      id: string;
      name: string;
      tier_level: number;
    } | null;
    preview_content?: string | null;
  };
  communitySlug: string;
  communityId: string;
  isAdmin: boolean;
  currentProfileId?: string;
  currentProfileTierLevel?: number;
  primaryColor?: string;
  isLiked?: boolean;
  members?: Member[];
  userVotedOptionIds?: string[];
}

// Helper to render content with @mentions highlighted
function renderContentWithMentions(
  content: string,
  primaryColor: string = "#6366f1"
) {
  const mentionRegex = /@(\w+)/g;
  const parts = content.split(mentionRegex);

  return parts.map((part, index) => {
    // Odd indices are captured groups (usernames)
    if (index % 2 === 1) {
      return (
        <span
          key={index}
          className="font-semibold cursor-pointer hover:underline"
          style={{ color: primaryColor }}
        >
          @{part}
        </span>
      );
    }
    return part;
  });
}

export function PostCard({
  post,
  communitySlug,
  communityId,
  isAdmin,
  currentProfileId,
  currentProfileTierLevel = 0,
  primaryColor = "#6366f1",
  isLiked: initialIsLiked = false,
  members = [],
  userVotedOptionIds = [],
}: PostCardProps) {
  const { effectiveIsAdmin } = useCommunity();
  const author = post.author;
  const poll = post.poll?.[0] || null;
  const category = post.category;
  const [showComments, setShowComments] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [commentsCount, setCommentsCount] = useState(post.comments?.length || post.comments_count || 0);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [votedOptions, setVotedOptions] = useState<string[]>(userVotedOptionIds);
  const [pollOptionsState, setPollOptionsState] = useState<PollOption[]>(
    poll?.options?.sort((a, b) => a.display_order - b.display_order) || []
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Use effectiveIsAdmin to respect view mode
  // When viewing as member, admin actions are hidden
  const canModify = effectiveIsAdmin || currentProfileId === author?.id;

  // Check if user can view full post content (tier gating)
  const isTierGated = !!post.min_tier_id && !!post.min_tier;
  
  // Collapse long posts by default (280 chars or 4 newlines)
  const COLLAPSE_THRESHOLD = 280;
  const MAX_LINES = 4;
  const postContent = post.content || '';
  const contentLength = postContent.length;
  const lineCount = (postContent.match(/\n/g) || []).length;
  const shouldCollapse = contentLength > COLLAPSE_THRESHOLD || lineCount > MAX_LINES;
  
  const truncatedContent = shouldCollapse && !isExpanded
    ? postContent.substring(0, COLLAPSE_THRESHOLD).split('\n').slice(0, MAX_LINES).join('\n') + '...'
    : postContent;
  const requiredTierLevel = post.min_tier?.tier_level ?? 0;
  const canViewFullContent = !isTierGated || effectiveIsAdmin || currentProfileTierLevel >= requiredTierLevel;

  // Get top-level comments and their replies
  const topLevelComments =
    post.comments?.filter((c) => !c.parent_comment_id) || [];
  const getReplies = (commentId: string) =>
    post.comments?.filter((c) => c.parent_comment_id === commentId) || [];

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deletePost(post.id, communitySlug);
      } catch (error) {
        console.error("Failed to delete post:", error);
      }
    });
  };

  const handleTogglePin = () => {
    startTransition(async () => {
      try {
        await togglePinPost(post.id, communitySlug, post.pinned);
      } catch (error) {
        console.error("Failed to toggle pin:", error);
      }
    });
  };

  const handleLike = () => {
    // Optimistic update
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);

    startTransition(async () => {
      try {
        await toggleLikePost(post.id, communityId, communitySlug);
      } catch (error) {
        // Revert on error
        setIsLiked(isLiked);
        setLikesCount(likesCount);
        console.error("Failed to toggle like:", error);
      }
    });
  };

  const handleVote = (optionId: string) => {
    if (!poll || !currentProfileId) return;

    // Optimistic update
    const wasVoted = votedOptions.includes(optionId);
    const newVotedOptions = wasVoted
      ? votedOptions.filter((id) => id !== optionId)
      : poll.multiple_choice
        ? [...votedOptions, optionId]
        : [optionId];

    // Update vote counts
    const newPollOptions = pollOptionsState.map((opt) => {
      if (opt.id === optionId) {
        return {
          ...opt,
          votes_count: wasVoted
            ? Math.max(0, opt.votes_count - 1)
            : opt.votes_count + 1,
        };
      }
      // If not multiple choice, decrement previous selection
      if (!poll.multiple_choice && votedOptions.includes(opt.id)) {
        return {
          ...opt,
          votes_count: Math.max(0, opt.votes_count - 1),
        };
      }
      return opt;
    });

    setVotedOptions(newVotedOptions);
    setPollOptionsState(newPollOptions);

    startTransition(async () => {
      try {
        await voteOnPoll(poll.id, optionId, communityId, communitySlug);
      } catch (error) {
        // Revert on error
        setVotedOptions(votedOptions);
        setPollOptionsState(pollOptionsState);
        console.error("Failed to vote:", error);
      }
    });
  };

  const handleComment = (parentCommentId?: string) => {
    if (!commentContent.trim()) return;

    const formData = new FormData();
    formData.append("postId", post.id);
    formData.append("content", commentContent);
    formData.append("communityId", communityId);
    formData.append("communitySlug", communitySlug);
    if (parentCommentId) {
      formData.append("parentCommentId", parentCommentId);
    }

    // Optimistically update comment count
    setCommentsCount(commentsCount + 1);

    startTransition(async () => {
      try {
        await createComment(formData);
        setCommentContent("");
        setReplyingTo(null);
      } catch (error) {
        // Revert on error
        setCommentsCount(commentsCount);
        console.error("Failed to create comment:", error);
      }
    });
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const position = e.target.selectionStart || 0;
    setCommentContent(value);
    setCursorPosition(position);

    // Check for @ mention
    const textBeforeCursor = value.slice(0, position);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      setShowMentions(true);
      setMentionSearch(mentionMatch[1].toLowerCase());
    } else {
      setShowMentions(false);
      setMentionSearch("");
    }
  };

  const insertMention = useCallback(
    (member: Member) => {
      const textBeforeCursor = commentContent.slice(0, cursorPosition);
      const textAfterCursor = commentContent.slice(cursorPosition);
      const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

      if (mentionMatch) {
        const newTextBefore =
          textBeforeCursor.slice(0, mentionMatch.index) +
          `@${member.display_name?.replace(/\s+/g, "")} `;
        setCommentContent(newTextBefore + textAfterCursor);
      }

      setShowMentions(false);
      setMentionSearch("");
      textareaRef.current?.focus();
    },
    [commentContent, cursorPosition]
  );

  const filteredMembers = members.filter(
    (m) =>
      m.display_name?.toLowerCase().includes(mentionSearch) &&
      m.id !== currentProfileId
  );

  const startReply = (comment: Comment) => {
    setReplyingTo({
      id: comment.id,
      name: comment.author?.display_name || "User",
    });
    setCommentContent(`@${comment.author?.display_name?.replace(/\s+/g, "")} `);
    setShowComments(true);
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden",
        post.pinned && "ring-2"
      )}
      style={
        post.pinned
          ? {
              ["--tw-ring-color" as string]: primaryColor,
              backgroundColor: `${primaryColor}08`,
            }
          : undefined
      }
    >
      {post.pinned && (
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: primaryColor }}
        />
      )}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={author?.avatar_url || undefined} />
              <AvatarFallback>
                {author?.display_name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  {author?.display_name || "User"}
                </span>
                {post.pinned && (
                  <div
                    className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${primaryColor}20`,
                      color: primaryColor,
                    }}
                  >
                    <Pin className="h-3 w-3 fill-current" />
                    Pinned
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>
                  {formatDistanceToNow(new Date(post.created_at), {
                    addSuffix: true,
                  })}
                </span>
                {category && (
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${category.color}20`,
                      color: category.color,
                    }}
                  >
                    {category.name}
                  </span>
                )}
              </div>
            </div>
          </div>
          {canModify && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {effectiveIsAdmin && (
                  <DropdownMenuItem onClick={handleTogglePin}>
                    <Pin className="h-4 w-4 mr-2" />
                    {post.pinned ? "Unpin" : "Pin"} post
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        {/* Tier gating badge */}
        {isTierGated && (
          <div className="mb-3 flex items-center gap-2">
            <div
              className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium"
              style={{
                backgroundColor: "rgba(245, 158, 11, 0.15)",
                color: "rgb(180, 83, 9)",
              }}
            >
              <Crown className="h-3 w-3" />
              {post.min_tier?.name} & above
            </div>
          </div>
        )}

        {canViewFullContent ? (
          <>
            <p className="whitespace-pre-wrap">
              {renderContentWithMentions(truncatedContent, primaryColor)}
            </p>
            
            {shouldCollapse && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm font-medium mt-1 hover:underline"
                style={{ color: primaryColor || 'hsl(var(--primary))' }}
              >
                {isExpanded ? 'Show less' : 'Read more'}
              </button>
            )}

            {post.media_urls && post.media_urls.length > 0 && (
              <div className="mt-4 grid gap-2">
                {post.media_urls.map((url: string, index: number) => (
                  <img
                    key={index}
                    src={url}
                    alt=""
                    className="rounded-lg max-h-96 object-cover"
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          /* Tier-gated content preview */
          <div className="space-y-4">
            {/* Preview content */}
            <p className="whitespace-pre-wrap text-muted-foreground">
              {post.preview_content ||
                (post.content.length > 150
                  ? post.content.substring(0, 150) + "..."
                  : post.content)}
            </p>

            {/* Blurred preview for media */}
            {post.media_urls && post.media_urls.length > 0 && (
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={post.media_urls[0]}
                  alt=""
                  className="w-full h-48 object-cover blur-xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-background/50" />
              </div>
            )}

            {/* Upgrade CTA */}
            <div className="p-4 rounded-lg border-2 border-dashed border-amber-300 bg-amber-50/50 dark:bg-amber-950/20">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/50">
                  <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-amber-900 dark:text-amber-100">
                    Exclusive content for {post.min_tier?.name} members
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    Upgrade to {post.min_tier?.name} to unlock this post and more premium content.
                  </p>
                  <Link
                    href={`/${communitySlug}/pricing`}
                    className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-amber-700 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-200"
                  >
                    <Crown className="h-4 w-4" />
                    View membership options →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Poll - only show if user can view full content */}
        {canViewFullContent && poll && pollOptionsState.length > 0 && (
          <div className="mt-4 space-y-3">
            <p className="font-medium">{poll.question}</p>
            <div className="space-y-2">
              {pollOptionsState.map((option) => {
                const totalVotes = pollOptionsState.reduce(
                  (sum, opt) => sum + opt.votes_count,
                  0
                );
                const percentage =
                  totalVotes > 0
                    ? Math.round((option.votes_count / totalVotes) * 100)
                    : 0;
                const isVoted = votedOptions.includes(option.id);
                const hasVoted = votedOptions.length > 0;

                return (
                  <button
                    key={option.id}
                    onClick={() => handleVote(option.id)}
                    disabled={!currentProfileId || isPending}
                    className={cn(
                      "relative w-full text-left rounded-lg border p-3 transition-all overflow-hidden",
                      isVoted
                        ? "border-2"
                        : "hover:bg-muted/50",
                      !currentProfileId && "cursor-not-allowed opacity-60"
                    )}
                    style={
                      isVoted
                        ? { borderColor: primaryColor }
                        : undefined
                    }
                  >
                    {/* Progress bar background */}
                    {hasVoted && (
                      <div
                        className="absolute inset-0 transition-all"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: isVoted
                            ? `${primaryColor}20`
                            : "hsl(var(--muted))",
                        }}
                      />
                    )}
                    <div className="relative flex items-center justify-between">
                      <span
                        className={cn(
                          "text-sm",
                          isVoted && "font-medium"
                        )}
                        style={isVoted ? { color: primaryColor } : undefined}
                      >
                        {option.option_text}
                      </span>
                      {hasVoted && (
                        <span className="text-sm text-muted-foreground">
                          {percentage}%
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {pollOptionsState.reduce((sum, opt) => sum + opt.votes_count, 0)}{" "}
              {pollOptionsState.reduce((sum, opt) => sum + opt.votes_count, 0) ===
              1
                ? "vote"
                : "votes"}
            </p>
          </div>
        )}
      </CardContent>
      <CardContent className="pt-0 space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <button
            className={cn(
              "flex items-center gap-1 transition-colors",
              isLiked
                ? "text-red-500"
                : "hover:text-red-500"
            )}
            onClick={handleLike}
            disabled={!currentProfileId}
          >
            <Heart
              className={cn("h-4 w-4", isLiked && "fill-current")}
            />
            {likesCount}
          </button>
          <button
            className="flex items-center gap-1 hover:text-foreground transition-colors"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageSquare className="h-4 w-4" />
            {commentsCount}
          </button>
        </div>

        {showComments && (
          <div className="border-t pt-4 space-y-4">
            {/* Existing comments */}
            {topLevelComments.length > 0 && (
              <div className="space-y-3">
                {topLevelComments.map((comment) => (
                  <div key={comment.id} className="space-y-2">
                    {/* Top-level comment */}
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={comment.author?.avatar_url || undefined}
                        />
                        <AvatarFallback className="text-xs">
                          {comment.author?.display_name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-muted rounded-lg px-3 py-2">
                          <span className="font-semibold text-sm">
                            {comment.author?.display_name || "User"}
                          </span>
                          <p className="text-sm">
                            {renderContentWithMentions(
                              comment.content,
                              primaryColor
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>
                            {formatDistanceToNow(new Date(comment.created_at), {
                              addSuffix: true,
                            })}
                          </span>
                          <button
                            className="hover:text-foreground flex items-center gap-1"
                            onClick={() => startReply(comment)}
                          >
                            <Reply className="h-3 w-3" />
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Replies to this comment */}
                    {getReplies(comment.id).length > 0 && (
                      <div className="ml-11 space-y-2">
                        {getReplies(comment.id).map((reply) => (
                          <div key={reply.id} className="flex gap-3">
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={reply.author?.avatar_url || undefined}
                              />
                              <AvatarFallback className="text-xs">
                                {reply.author?.display_name?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="bg-muted rounded-lg px-3 py-2">
                                <span className="font-semibold text-sm">
                                  {reply.author?.display_name || "User"}
                                </span>
                                <p className="text-sm">
                                  {renderContentWithMentions(
                                    reply.content,
                                    primaryColor
                                  )}
                                </p>
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                <span>
                                  {formatDistanceToNow(
                                    new Date(reply.created_at),
                                    { addSuffix: true }
                                  )}
                                </span>
                                <button
                                  className="hover:text-foreground flex items-center gap-1"
                                  onClick={() => startReply(comment)}
                                >
                                  <Reply className="h-3 w-3" />
                                  Reply
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Comment input */}
            <div className="space-y-2">
              {replyingTo && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Replying to {replyingTo.name}</span>
                  <button
                    className="text-xs hover:text-foreground"
                    onClick={() => {
                      setReplyingTo(null);
                      setCommentContent("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  placeholder={
                    replyingTo
                      ? `Reply to ${replyingTo.name}...`
                      : "Write a comment... Use @ to mention someone"
                  }
                  className="min-h-[60px] resize-none text-sm"
                  value={commentContent}
                  onChange={handleTextareaChange}
                  disabled={isPending || !currentProfileId}
                />
                {/* Mentions dropdown */}
                {showMentions && filteredMembers.length > 0 && (
                  <div className="absolute bottom-full left-0 mb-1 w-64 bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto z-50">
                    {filteredMembers.slice(0, 5).map((member) => (
                      <button
                        key={member.id}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted text-left"
                        onClick={() => insertMention(member)}
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={member.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {member.display_name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">
                          {member.display_name || "User"}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={() => handleComment(replyingTo?.id)}
                  disabled={isPending || !commentContent.trim() || !currentProfileId}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : replyingTo ? (
                    "Reply"
                  ) : (
                    "Comment"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
