"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Loader2,
  MoreHorizontal,
  Pencil,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  GripVertical,
  Video,
  FileText,
} from "lucide-react";
import {
  createLesson,
  updateLesson,
  deleteLesson,
  duplicateLesson,
} from "@/actions/programs";
import { useToast } from "@/hooks/use-toast";
import type { Lesson } from "@/types/database";
import Link from "next/link";

interface LessonsListProps {
  programId: string;
  lessons: Lesson[];
  communitySlug: string;
}

export function LessonsList({ programId, lessons, communitySlug }: LessonsListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [createOpen, setCreateOpen] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState("");

  const handleCreateLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle.trim()) return;

    startTransition(async () => {
      const result = await createLesson(programId, communitySlug, {
        title: newLessonTitle.trim(),
      });

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create lesson. Please try again.",
        });
        return;
      }

      toast({
        variant: "success",
        title: "Lesson created",
        description: "Your new lesson has been created.",
      });

      setNewLessonTitle("");
      setCreateOpen(false);

      // Navigate to edit the new lesson
      if (result.data) {
        router.push(
          `/${communitySlug}/admin/content/programs/${programId}/lessons/${result.data.id}`
        );
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Lessons</CardTitle>
            <CardDescription>
              {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"} in this program
            </CardDescription>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Lesson
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateLesson}>
                <DialogHeader>
                  <DialogTitle>Add New Lesson</DialogTitle>
                  <DialogDescription>
                    Create a new lesson for this program.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <div className="space-y-2">
                    <Label htmlFor="lesson-title">Lesson Title</Label>
                    <Input
                      id="lesson-title"
                      value={newLessonTitle}
                      onChange={(e) => setNewLessonTitle(e.target.value)}
                      placeholder="e.g., Introduction to the Course"
                      disabled={isPending}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateOpen(false)}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending || !newLessonTitle.trim()}>
                    {isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Create Lesson
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {lessons.length > 0 ? (
          <div className="space-y-2">
            {lessons.map((lesson, index) => (
              <LessonItem
                key={lesson.id}
                lesson={lesson}
                index={index}
                programId={programId}
                communitySlug={communitySlug}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No lessons yet. Add your first lesson to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LessonItem({
  lesson,
  index,
  programId,
  communitySlug,
}: {
  lesson: Lesson;
  index: number;
  programId: string;
  communitySlug: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleTogglePublish = () => {
    startTransition(async () => {
      const result = await updateLesson(lesson.id, programId, communitySlug, {
        published: !lesson.published,
      });

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update lesson. Please try again.",
        });
        return;
      }

      toast({
        variant: "success",
        title: lesson.published ? "Lesson unpublished" : "Lesson published",
      });

      router.refresh();
    });
  };

  const handleDuplicate = () => {
    startTransition(async () => {
      const result = await duplicateLesson(lesson.id, programId, communitySlug);

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to duplicate lesson. Please try again.",
        });
        return;
      }

      toast({
        variant: "success",
        title: "Lesson duplicated",
        description: "A copy of the lesson has been created.",
      });

      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this lesson? This cannot be undone.")) {
      return;
    }

    startTransition(async () => {
      const result = await deleteLesson(lesson.id, programId, communitySlug);

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete lesson. Please try again.",
        });
        return;
      }

      toast({
        variant: "success",
        title: "Lesson deleted",
      });

      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="text-muted-foreground cursor-grab">
        <GripVertical className="h-4 w-4" />
      </div>
      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-sm font-medium">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{lesson.title}</p>
          {lesson.video_url && (
            <Video className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <Badge variant={lesson.published ? "default" : "outline"} className="text-xs">
            {lesson.published ? "Published" : "Draft"}
          </Badge>
          <span className="text-xs text-muted-foreground capitalize">
            {lesson.visibility}
          </span>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreHorizontal className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link
              href={`/${communitySlug}/admin/content/programs/${programId}/lessons/${lesson.id}`}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit Lesson
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleTogglePublish}>
            {lesson.published ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Unpublish
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Publish
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
