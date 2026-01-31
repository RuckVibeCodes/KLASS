"use client";

import { useState, useTransition, useCallback } from "react";
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
  Sparkles,
} from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import {
  createLesson,
  updateLesson,
  deleteLesson,
  duplicateLesson,
  reorderLessons,
} from "@/actions/programs";
import {
  createSection,
  updateSection,
  deleteSection,
  reorderSections,
} from "@/actions/sections";
import { useToast } from "@/hooks/use-toast";
import type { Lesson, ProgramSection } from "@/types/database";
import Link from "next/link";

interface LessonsListProps {
  programId: string;
  programTitle: string;
  programDescription?: string;
  lessons: Lesson[];
  sections?: ProgramSection[];
  communitySlug: string;
}

interface GeneratedLesson {
  title: string;
  description: string;
  duration: string;
}

interface GeneratedOutline {
  title: string;
  description: string;
  lessons: GeneratedLesson[];
}

export function LessonsList({ programId, programTitle, programDescription, lessons, sections = [], communitySlug }: LessonsListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [createLessonOpen, setCreateLessonOpen] = useState(false);
  const [createSectionOpen, setCreateSectionOpen] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonSectionId, setNewLessonSectionId] = useState<string | null>(null);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newSectionDescription, setNewSectionDescription] = useState("");
  
  // AI Curriculum state
  const [aiCurriculumOpen, setAiCurriculumOpen] = useState(false);
  const [isGeneratingCurriculum, setIsGeneratingCurriculum] = useState(false);
  const [generatedOutline, setGeneratedOutline] = useState<GeneratedOutline | null>(null);
  const [lessonCount, setLessonCount] = useState(5);

  // Local state for optimistic reordering
  const [localSections, setLocalSections] = useState(sections);
  const [localLessons, setLocalLessons] = useState(lessons);

  // Group lessons by section
  const unsectionedLessons = localLessons.filter((l) => !l.section_id);
  const sectionLessons = (sectionId: string) =>
    localLessons.filter((l) => l.section_id === sectionId).sort((a, b) => a.order_index - b.order_index);

  // AI Curriculum generation
  const handleGenerateCurriculum = async () => {
    setIsGeneratingCurriculum(true);
    setGeneratedOutline(null);
    
    try {
      const response = await fetch("/api/ai/lesson-outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: programTitle,
          targetAudience: programDescription || "beginners",
          lessonCount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate curriculum");
      }

      setGeneratedOutline(data.outline);
      toast({
        variant: "success",
        title: "Curriculum generated!",
        description: `Generated ${data.outline.lessons.length} lessons. Review and apply below.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsGeneratingCurriculum(false);
    }
  };

  const handleApplyCurriculum = async () => {
    if (!generatedOutline) return;
    
    startTransition(async () => {
      try {
        // Create each lesson from the generated outline
        for (let i = 0; i < generatedOutline.lessons.length; i++) {
          const lesson = generatedOutline.lessons[i];
          await createLesson(programId, communitySlug, {
            title: lesson.title,
            content: lesson.description,
          });
        }

        toast({
          variant: "success",
          title: "Curriculum applied!",
          description: `Added ${generatedOutline.lessons.length} lessons to your program.`,
        });

        setAiCurriculumOpen(false);
        setGeneratedOutline(null);
        router.refresh();
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Failed to apply curriculum",
          description: "Please try again.",
        });
      }
    });
  };

  // Handle drag end for lessons within a section or unsectioned
  const handleLessonDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    // Same position
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceDroppableId = source.droppableId;
    const destDroppableId = destination.droppableId;

    // Get source and dest lists
    const getListForDroppable = (droppableId: string) => {
      if (droppableId === "unsectioned") {
        return localLessons.filter(l => !l.section_id).sort((a, b) => a.order_index - b.order_index);
      }
      return localLessons.filter(l => l.section_id === droppableId).sort((a, b) => a.order_index - b.order_index);
    };

    if (sourceDroppableId === destDroppableId) {
      // Reorder within the same list
      const list = getListForDroppable(sourceDroppableId);
      const [movedItem] = list.splice(source.index, 1);
      list.splice(destination.index, 0, movedItem);

      // Update order_index and persist
      const reorderedIds = list.map(l => l.id);
      const updatedLessons = localLessons.map(l => {
        const idx = reorderedIds.indexOf(l.id);
        if (idx !== -1) {
          return { ...l, order_index: idx };
        }
        return l;
      });

      setLocalLessons(updatedLessons);

      startTransition(async () => {
        const result = await reorderLessons(programId, communitySlug, reorderedIds);
        if (result.error) {
          toast({ variant: "destructive", title: "Error", description: "Failed to reorder lessons." });
          setLocalLessons(lessons); // Revert
        }
      });
    }
    // Cross-section drag could be added later (move lesson between sections)
  }, [localLessons, lessons, programId, communitySlug, toast, startTransition]);

  // Handle section drag end
  const handleSectionDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;

    const newSections = [...localSections];
    const [movedSection] = newSections.splice(result.source.index, 1);
    newSections.splice(result.destination.index, 0, movedSection);

    // Update local state optimistically
    const updatedSections = newSections.map((s, i) => ({ ...s, order_index: i }));
    setLocalSections(updatedSections);

    // Persist
    const sectionIds = newSections.map(s => s.id);
    startTransition(async () => {
      const res = await reorderSections(programId, communitySlug, sectionIds);
      if (res.error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to reorder modules." });
        setLocalSections(sections); // Revert
      }
    });
  }, [localSections, sections, programId, communitySlug, toast, startTransition]);

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

  const hasSections = localSections.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Course Content</CardTitle>
            <CardDescription>
              {localSections.length > 0
                ? `${localSections.length} modules, ${localLessons.length} lessons`
                : `${localLessons.length} ${localLessons.length === 1 ? "lesson" : "lessons"}`
              }
              {" · "}
              <span className="text-muted-foreground">Drag to reorder</span>
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

            {/* AI Curriculum Generator */}
            <Dialog open={aiCurriculumOpen} onOpenChange={(open) => {
              setAiCurriculumOpen(open);
              if (!open) setGeneratedOutline(null);
            }}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  AI Curriculum
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Generate Curriculum with AI
                  </DialogTitle>
                  <DialogDescription>
                    AI will create a lesson outline based on your program title and description.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div className="space-y-2">
                    <Label>Program</Label>
                    <p className="text-sm font-medium">{programTitle}</p>
                    {programDescription && (
                      <p className="text-sm text-muted-foreground">{programDescription}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lesson-count">Number of Lessons</Label>
                    <Input
                      id="lesson-count"
                      type="number"
                      min={3}
                      max={15}
                      value={lessonCount}
                      onChange={(e) => setLessonCount(parseInt(e.target.value) || 5)}
                      disabled={isGeneratingCurriculum}
                    />
                  </div>

                  {!generatedOutline && (
                    <Button 
                      onClick={handleGenerateCurriculum} 
                      disabled={isGeneratingCurriculum}
                      className="w-full gap-2"
                    >
                      {isGeneratingCurriculum ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Generate Curriculum
                        </>
                      )}
                    </Button>
                  )}

                  {generatedOutline && (
                    <div className="space-y-4">
                      <div className="rounded-lg border p-4 bg-muted/50">
                        <h4 className="font-semibold mb-2">{generatedOutline.title}</h4>
                        <p className="text-sm text-muted-foreground mb-4">{generatedOutline.description}</p>
                        <div className="space-y-2">
                          {generatedOutline.lessons.map((lesson, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-2 rounded bg-background">
                              <span className="text-xs font-medium text-muted-foreground w-6">{idx + 1}.</span>
                              <div className="flex-1">
                                <p className="text-sm font-medium">{lesson.title}</p>
                                <p className="text-xs text-muted-foreground">{lesson.description}</p>
                              </div>
                              <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setGeneratedOutline(null)}
                          className="flex-1"
                        >
                          Regenerate
                        </Button>
                        <Button
                          onClick={handleApplyCurriculum}
                          disabled={isPending}
                          className="flex-1 gap-2"
                        >
                          {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                          Apply Curriculum
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
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
                    {localSections.length > 0 && (
                      <div className="space-y-2">
                        <Label>Module (optional)</Label>
                        <select
                          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                          value={newLessonSectionId || ""}
                          onChange={(e) => setNewLessonSectionId(e.target.value || null)}
                          disabled={isPending}
                        >
                          <option value="">No module (standalone)</option>
                          {localSections.map((s) => (
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
        {localLessons.length === 0 && localSections.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No content yet. Add a module or lesson to get started.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Sections with drag-to-reorder */}
            {hasSections && (
              <DragDropContext onDragEnd={handleSectionDragEnd}>
                <Droppable droppableId="sections" type="section">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-4"
                    >
                      {localSections
                        .sort((a, b) => a.order_index - b.order_index)
                        .map((section, sIdx) => (
                          <Draggable
                            key={section.id}
                            draggableId={`section-${section.id}`}
                            index={sIdx}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={snapshot.isDragging ? "opacity-80 shadow-lg rounded-lg" : ""}
                              >
                                <SectionBlock
                                  section={section}
                                  sectionIndex={sIdx}
                                  lessons={sectionLessons(section.id)}
                                  programId={programId}
                                  communitySlug={communitySlug}
                                  onAddLesson={() => openCreateLessonInSection(section.id)}
                                  dragHandleProps={provided.dragHandleProps as unknown as Record<string, unknown> | null}
                                  onLessonDragEnd={handleLessonDragEnd}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}

            {/* Unsectioned lessons with drag-to-reorder */}
            {unsectionedLessons.length > 0 && (
              <div className="space-y-2">
                {hasSections && (
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground px-1 pb-1">
                    <FileText className="h-4 w-4" />
                    Standalone Lessons
                  </div>
                )}
                <DragDropContext onDragEnd={handleLessonDragEnd}>
                  <Droppable droppableId="unsectioned" type="lesson">
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="space-y-1"
                      >
                        {unsectionedLessons
                          .sort((a, b) => a.order_index - b.order_index)
                          .map((lesson, index) => (
                            <Draggable
                              key={lesson.id}
                              draggableId={`lesson-${lesson.id}`}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={snapshot.isDragging ? "opacity-80 shadow-lg rounded-lg" : ""}
                                >
                                  <LessonItem
                                    lesson={lesson}
                                    index={index}
                                    programId={programId}
                                    communitySlug={communitySlug}
                                    dragHandleProps={provided.dragHandleProps as unknown as Record<string, unknown> | null}
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            )}

            {/* No sections and no lessons */}
            {!hasSections && unsectionedLessons.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No content yet. Add a module or lesson to get started.</p>
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
  dragHandleProps,
  onLessonDragEnd,
}: {
  section: ProgramSection;
  sectionIndex: number;
  lessons: Lesson[];
  programId: string;
  communitySlug: string;
  onAddLesson: () => void;
  dragHandleProps?: Record<string, unknown> | null;
  onLessonDragEnd: (result: DropResult) => void;
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
        <div {...(dragHandleProps || {})} className="text-muted-foreground cursor-grab active:cursor-grabbing">
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

      {/* Section lessons with drag-to-reorder */}
      <DragDropContext onDragEnd={onLessonDragEnd}>
        <Droppable droppableId={section.id} type="lesson">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="p-2 space-y-1"
            >
              {lessons.length > 0 ? (
                lessons.map((lesson, index) => (
                  <Draggable
                    key={lesson.id}
                    draggableId={`lesson-${lesson.id}`}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={snapshot.isDragging ? "opacity-80 shadow-lg rounded-lg" : ""}
                      >
                        <LessonItem
                          lesson={lesson}
                          index={index}
                          programId={programId}
                          communitySlug={communitySlug}
                          dragHandleProps={provided.dragHandleProps as unknown as Record<string, unknown> | null}
                        />
                      </div>
                    )}
                  </Draggable>
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
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

function LessonItem({
  lesson,
  index,
  programId,
  communitySlug,
  dragHandleProps,
}: {
  lesson: Lesson;
  index: number;
  programId: string;
  communitySlug: string;
  dragHandleProps?: Record<string, unknown> | null;
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
      <div {...(dragHandleProps || {})} className="text-muted-foreground cursor-grab active:cursor-grabbing">
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
          {lesson.video_duration_seconds && (
            <span className="text-xs text-muted-foreground">
              {Math.floor(lesson.video_duration_seconds / 60)} min
            </span>
          )}
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
