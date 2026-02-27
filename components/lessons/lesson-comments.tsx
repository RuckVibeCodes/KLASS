"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
  Send,
} from "lucide-react";
import {
  createLessonComment,
  updateLessonComment,
  deleteLessonComment,
  toggleCommentLike,
} from "@/actions/comments";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import type { Profile } from "@/types/database";

interface CommentWithProfile {
  id: string;
  lesson_id: string;
  profile_id: string;
  parent_comment_id: string | null;
  content: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  profile: Pick<Profile, "id" | "display_name" | "avatar_url" | "role">;
  isLiked: boolean;
  replies?: CommentWithProfile[];
}

interface LessonCommentsProps {
  lessonId: string;
  programId: string;
  communitySlug: string;
  comments: CommentWithProfile[];
  currentUserId?: string;
  isAdmin?: boolean;
}

export function LessonComments({
  lessonId,
  programId,
  communitySlug,
  comments,
  currentUserId,
  isAdmin,
}: LessonCommentsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [newComment, setNewComment] = useState("");

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    startTransition(async () => {
      const result = await createLessonComment(lessonId, programId, communitySlug, {
        content: newComment.trim(),
      });

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to post comment. Please try again.",
        });
        return;
      }

      setNewComment("");
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5" />
        <h2 className="text-lg font-semibold">
          Comments ({comments.length})
        </h2>
      </div>

      {/* New comment form */}
      {currentUserId && (
        <div className="space-y-3">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts or ask a question..."
            rows={3}
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmitComment}
              disabled={isPending || !newComment.trim()}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Post Comment
            </Button>
          </div>
        </div>
      )}

      {/* Comments list */}
      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              lessonId={lessonId}
              programId={programId}
              communitySlug={communitySlug}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  );
}

function CommentItem({
  comment,
  lessonId,
  programId,
  communitySlug,
  currentUserId,
  isAdmin,
  isReply = false,
}: {
  comment: CommentWithProfile;
  lessonId: string;
  programId: string;
  communitySlug: string;
  currentUserId?: string;
  isAdmin?: boolean;
  isReply?: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const commentId = comment.id;
  const isOwner = currentUserId && comment.profile.id === currentUserId;
  const canDelete = isOwner || isAdmin;
  const canEdit = isOwner;

  const handleLike = () => {
    if (!currentUserId) return;

    startTransition(async () => {
      const result = await toggleCommentLike(commentId, lessonId, programId, communitySlug);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update like.",
        });
      }
      router.refresh();
    });
  };

  const handleEdit = () => {
    if (!editContent.trim()) return;

    startTransition(async () => {
      const result = await updateLessonComment(commentId, lessonId, programId, communitySlug, {
        content: editContent.trim(),
      });

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update comment.",
        });
        return;
      }

      setIsEditing(false);
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!confirm("Delete this comment?")) return;

    startTransition(async () => {
      const result = await deleteLessonComment(commentId, lessonId, programId, communitySlug);

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete comment.",
        });
        return;
      }

      router.refresh();
    });
  };

  const handleReply = () => {
    if (!replyContent.trim()) return;

    startTransition(async () => {
      const result = await createLessonComment(lessonId, programId, communitySlug, {
        content: replyContent.trim(),
        parent_comment_id: commentId,
      });

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to post reply.",
        });
        return;
      }

      setReplyContent("");
      setShowReplyInput(false);
      router.refresh();
    });
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`flex gap-3 ${isReply ? "ml-12" : ""}`}>
      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarImage src={comment.profile.avatar_url || undefined} />
        <AvatarFallback>{getInitials(comment.profile.display_name)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">{comment.profile.display_name || "Anonymous"}</span>
          {comment.profile.role === "ADMIN" && (
            <Badge variant="secondary" className="text-xs">Admin</Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </span>
          {comment.created_at !== comment.updated_at && (
            <span className="text-xs text-muted-foreground">(edited)</span>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={2}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleEdit} disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
        )}

        {!isEditing && (
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              disabled={!currentUserId || isPending}
              className={`flex items-center gap-1 text-sm ${
                comment.isLiked ? "text-red-500" : "text-muted-foreground hover:text-foreground"
              } transition-colors disabled:opacity-50`}
            >
              <Heart className={`h-4 w-4 ${comment.isLiked ? "fill-current" : ""}`} />
              {comment.likes_count > 0 && <span>{comment.likes_count}</span>}
            </button>
            {!isReply && currentUserId && (
              <button
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                Reply
              </button>
            )}
            {(canEdit || canDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {canEdit && (
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}

        {/* Reply input */}
        {showReplyInput && (
          <div className="space-y-2 pt-2">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              rows={2}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleReply} disabled={isPending || !replyContent.trim()}>
                {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Reply
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowReplyInput(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-4 pt-4">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                lessonId={lessonId}
                programId={programId}
                communitySlug={communitySlug}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                isReply
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
