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
import { Textarea } from "@/components/ui/textarea";
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
  FolderPlus,
  Layers,
} from "lucide-react";
import {
  createLesson,
  updateLesson,
  deleteLesson,
  duplicateLesson,
} from "@/actions/programs";
import {
  createSection,
  updateSection,
  deleteSection,
} from "@/actions/sections";
import { useToast } from "@/hooks/use-toast";
import type { Lesson, ProgramSection } from "@/types/database";
import Link from "next/link";

interface LessonsListProps {
  programId: string;
  lessons: Lesson[];
  sections?: ProgramSection[];
  communitySlug: string;
}

export function LessonsList({ programId, lessons, sections = [], communitySlug }: LessonsListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [createLessonOpen, setCreateLessonOpen] = useState(false);
  const [createSectionOpen, setCreateSectionOpen] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonSectionId, setNewLessonSectionId] = useState<string | null>(null);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newSectionDescription, setNewSectionDescription] = useState("");

  // Group lessons by section
  const unsectionedLessons = lessons.filter((l) => !l.section_id);
  const sectionLessons = (sectionId: string) =>
    lessons.filter((l) => l.section_id === sectionId);

  const handleCreateLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle.trim()) return;

    startTransition(async () => {
      const result = await createLesson(programId, communitySlug, {
        title: newLessonTitle.trim(),
        section_id: newLessonSectionId,
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
      setNewLessonSectionId(null);
      setCreateLessonOpen(false);

      if (result.data) {
        router.push(
          `/${communitySlug}/admin/content/programs/${programId}/lessons/${result.data.id}`
        );
      }
    });
  };

  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionTitle.trim()) return;

    startTransition(async () => {
      const result = await createSection(programId, communitySlug, {
        title: newSectionTitle.trim(),
        description: newSectionDescription.trim() || undefined,
      });

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create module. Please try again.",
        });
        return;
      }

      toast({
        variant: "success",
        title: "Module created",
        description: "Your new module has been created.",
      });

      setNewSectionTitle("");
      setNewSectionDescription("");
      setCreateSectionOpen(false);
      router.refresh();
    });
  };

  const openCreateLessonInSection = (sectionId: string | null) => {
    setNewLessonSectionId(sectionId);
    setCreateLessonOpen(true);
  };

  const hasSections = sections.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Course Content</CardTitle>
            <CardDescription>
              {sections.length > 0
                ? `${sections.length} modules, ${lessons.length} lessons`
                : `${lessons.length} ${lessons.length === 1 ? "lesson" : "lessons"}`
              }
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={createSectionOpen} onOpenChange={setCreateSectionOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Add Module
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleCreateSection}>
                  <DialogHeader>
                    <DialogTitle>Add New Module</DialogTitle>
                    <DialogDescription>
                      Modules group related lessons together into chapters or sections.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="section-title">Module Title</Label>
                      <Input
                        id="section-title"
                        value={newSectionTitle}
                        onChange={(e) => setNewSectionTitle(e.target.value)}
                        placeholder="e.g., Getting Started"
                        disabled={isPending}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="section-description">Description (optional)</Label>
                      <Textarea
                        id="section-description"
                        value={newSectionDescription}
                        onChange={(e) => setNewSectionDescription(e.target.value)}
                        placeholder="Brief description of what this module covers..."
                        disabled={isPending}
                        rows={2}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCreateSectionOpen(false)}
                      disabled={isPending}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isPending || !newSectionTitle.trim()}>
                      {isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <FolderPlus className="h-4 w-4 mr-2" />
                      )}
                      Create Module
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={createLessonOpen} onOpenChange={setCreateLessonOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setNewLessonSectionId(null)}>
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
                  <div className="py-4 space-y-4">
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
                    {sections.length > 0 && (
                      <div className="space-y-2">
                        <Label>Module (optional)</Label>
                        <select
                          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                          value={newLessonSectionId || ""}
                          onChange={(e) => setNewLessonSectionId(e.target.value || null)}
                          disabled={isPending}
                        >
                          <option value="">No module (standalone)</option>
                          {sections.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCreateLessonOpen(false)}
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
        </div>
      </CardHeader>
      <CardContent>
        {lessons.length === 0 && sections.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No content yet. Add a module or lesson to get started.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Render sections with their lessons */}
            {sections.map((section, sIdx) => (
              <SectionBlock
                key={section.id}
                section={section}
                sectionIndex={sIdx}
                lessons={sectionLessons(section.id)}
                programId={programId}
                communitySlug={communitySlug}
                onAddLesson={() => openCreateLessonInSection(section.id)}
              />
            ))}

            {/* Unsectioned lessons */}
            {unsectionedLessons.length > 0 && (
              <div className="space-y-2">
                {hasSections && (
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground px-1 pb-1">
                    <FileText className="h-4 w-4" />
                    Standalone Lessons
                  </div>
                )}
                {unsectionedLessons.map((lesson, index) => (
                  <LessonItem
                    key={lesson.id}
                    lesson={lesson}
                    index={index}
                    programId={programId}
                    communitySlug={communitySlug}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Section block component
function SectionBlock({
  section,
  sectionIndex,
  lessons,
  programId,
  communitySlug,
  onAddLesson,
}: {
  section: ProgramSection;
  sectionIndex: number;
  lessons: Lesson[];
  programId: string;
  communitySlug: string;
  onAddLesson: () => void;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(section.title);

  const handleSaveTitle = () => {
    if (!editTitle.trim() || editTitle === section.title) {
      setIsEditing(false);
      setEditTitle(section.title);
      return;
    }

    startTransition(async () => {
      const result = await updateSection(section.id, programId, communitySlug, {
        title: editTitle.trim(),
      });

      if (result.error) {
        toast({ variant: "destructive", title: "Error", description: result.error });
        setEditTitle(section.title);
      } else {
        toast({ variant: "success", title: "Module updated" });
      }
      setIsEditing(false);
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!confirm("Delete this module? Lessons inside will become standalone.")) return;

    startTransition(async () => {
      const result = await deleteSection(section.id, programId, communitySlug);
      if (result.error) {
        toast({ variant: "destructive", title: "Error", description: result.error });
      } else {
        toast({ variant: "success", title: "Module deleted" });
        router.refresh();
      }
    });
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Section header */}
      <div className="flex items-center gap-3 bg-muted/50 px-4 py-3">
        <div className="text-muted-foreground cursor-grab">
          <GripVertical className="h-4 w-4" />
        </div>
        <Layers className="h-4 w-4 text-muted-foreground" />
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="h-8 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveTitle();
                  if (e.key === "Escape") {
                    setIsEditing(false);
                    setEditTitle(section.title);
                  }
                }}
                autoFocus
              />
              <Button size="sm" variant="ghost" onClick={handleSaveTitle}>
                Save
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">
                Module {sectionIndex + 1}: {section.title}
              </span>
              <Badge variant="outline" className="text-xs">
                {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
              </Badge>
            </div>
          )}
          {section.description && !isEditing && (
            <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
          )}
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
            <DropdownMenuItem onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onAddLesson}>
              <Plus className="h-4 w-4 mr-2" />
              Add Lesson
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Module
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Section lessons */}
      <div className="p-2 space-y-1">
        {lessons.length > 0 ? (
          lessons.map((lesson, index) => (
            <LessonItem
              key={lesson.id}
              lesson={lesson}
              index={index}
              programId={programId}
              communitySlug={communitySlug}
            />
          ))
        ) : (
          <div className="text-center py-4 text-sm text-muted-foreground">
            No lessons in this module yet.
            <button
              onClick={onAddLesson}
              className="text-primary hover:underline ml-1"
            >
              Add one
            </button>
          </div>
        )}
      </div>
    </div>
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
