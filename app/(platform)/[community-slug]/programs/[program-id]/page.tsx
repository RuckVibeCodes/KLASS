import { createAdminClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  CheckCircle,
  Circle,
  Clock,
  Lock,
  Play,
  ArrowLeft,
  Layers,
} from "lucide-react";
import Link from "next/link";

export default async function ProgramPage({
  params,
}: {
  params: Promise<{ "community-slug": string; "program-id": string }>;
}) {
  const { userId } = await auth();
  const resolvedParams = await params;
  const supabase = await createAdminClient();

  // Get community
  const { data: community } = await supabase
    .from("communities")
    .select("*")
    .eq("slug", resolvedParams["community-slug"])
    .single();

  if (!community) return notFound();

  // Get program with lessons and sections
  const { data: program } = await supabase
    .from("programs")
    .select(`
      *,
      lessons(*),
      program_sections(*)
    `)
    .eq("id", resolvedParams["program-id"])
    .eq("community_id", community.id)
    .single();

  if (!program) return notFound();

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("clerk_user_id", userId)
    .eq("community_id", community.id)
    .single();

  // Get lesson progress
  const { data: progressData } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("profile_id", profile?.id || "");

  const completedLessonIds = new Set(
    progressData?.map((p) => p.lesson_id) || []
  );

  const lessons = program.lessons || [];
  const sections = (program.program_sections || []).sort(
    (a: any, b: any) => a.order_index - b.order_index
  );
  const sortedLessons = lessons.sort(
    (a: any, b: any) => a.order_index - b.order_index
  );

  const completedCount = lessons.filter((l: any) =>
    completedLessonIds.has(l.id)
  ).length;
  const progressPercent =
    lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;

  const isPaid = program.visibility === "paid";
  const canAccess = profile?.tier === "PAID" || profile?.role === "ADMIN" || !isPaid;

  // Group lessons
  const unsectionedLessons = sortedLessons.filter((l: any) => !l.section_id);
  const sectionLessons = (sectionId: string) =>
    sortedLessons.filter((l: any) => l.section_id === sectionId);

  const hasSections = sections.length > 0;

  // Global lesson counter for numbering
  let globalLessonIndex = 0;

  return (
    <div className="container py-6 max-w-4xl">
      {/* Back link */}
      <Link
        href={`/${resolvedParams["community-slug"]}/programs`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Programs
      </Link>

      {/* Program Header */}
      <div className="mb-8">
        <div className="flex items-start gap-6">
          {/* Thumbnail */}
          <div className="w-48 aspect-video bg-muted rounded-lg flex-shrink-0 hidden md:block">
            {program.thumbnail_url ? (
              <img
                src={program.thumbnail_url}
                alt={program.title}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {isPaid && (
                <Badge variant="secondary">
                  <Lock className="h-3 w-3 mr-1" />
                  Pro
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-2">{program.title}</h1>
            {program.description && (
              <p className="text-muted-foreground mb-4">{program.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {lessons.length} lessons
              </span>
              {hasSections && (
                <span className="flex items-center gap-1">
                  <Layers className="h-4 w-4" />
                  {sections.length} modules
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Progress */}
        {lessons.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium">Your Progress</span>
              <span className="text-muted-foreground">
                {completedCount} of {lessons.length} completed
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        )}
      </div>

      <Separator className="my-6" />

      {/* Content */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">
          {hasSections ? "Course Content" : "Lessons"}
        </h2>

        {hasSections ? (
          <>
            {/* Sections with lessons */}
            {sections.map((section: any, sIdx: number) => {
              const sLessons = sectionLessons(section.id);
              const sectionCompleted = sLessons.filter((l: any) =>
                completedLessonIds.has(l.id)
              ).length;
              const sectionProgress =
                sLessons.length > 0
                  ? (sectionCompleted / sLessons.length) * 100
                  : 0;

              return (
                <div key={section.id} className="space-y-2">
                  {/* Section header */}
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-semibold">
                        Module {sIdx + 1}: {section.title}
                      </h3>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {sectionCompleted}/{sLessons.length} completed
                    </span>
                  </div>
                  {section.description && (
                    <p className="text-sm text-muted-foreground px-1 -mt-1">
                      {section.description}
                    </p>
                  )}
                  <Progress value={sectionProgress} className="h-1 mx-1" />

                  {/* Section lessons */}
                  {sLessons.map((lesson: any) => {
                    globalLessonIndex++;
                    return (
                      <LessonRow
                        key={lesson.id}
                        lesson={lesson}
                        index={globalLessonIndex}
                        isCompleted={completedLessonIds.has(lesson.id)}
                        isLocked={lesson.visibility === "paid" && !canAccess}
                        communitySlug={resolvedParams["community-slug"]}
                        programId={program.id}
                      />
                    );
                  })}
                </div>
              );
            })}

            {/* Unsectioned lessons */}
            {unsectionedLessons.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold px-1">Additional Lessons</h3>
                {unsectionedLessons.map((lesson: any) => {
                  globalLessonIndex++;
                  return (
                    <LessonRow
                      key={lesson.id}
                      lesson={lesson}
                      index={globalLessonIndex}
                      isCompleted={completedLessonIds.has(lesson.id)}
                      isLocked={lesson.visibility === "paid" && !canAccess}
                      communitySlug={resolvedParams["community-slug"]}
                      programId={program.id}
                    />
                  );
                })}
              </div>
            )}
          </>
        ) : (
          /* Flat list (no sections) */
          sortedLessons.map((lesson: any, index: number) => (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              index={index + 1}
              isCompleted={completedLessonIds.has(lesson.id)}
              isLocked={lesson.visibility === "paid" && !canAccess}
              communitySlug={resolvedParams["community-slug"]}
              programId={program.id}
            />
          ))
        )}

        {lessons.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No lessons yet</h3>
              <p className="text-muted-foreground">
                Check back soon for new content!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function LessonRow({
  lesson,
  index,
  isCompleted,
  isLocked,
  communitySlug,
  programId,
}: {
  lesson: any;
  index: number;
  isCompleted: boolean;
  isLocked: boolean;
  communitySlug: string;
  programId: string;
}) {
  return (
    <Card
      className={isLocked ? "opacity-60" : "hover:bg-accent/50 transition-colors"}
    >
      <CardContent className="p-4">
        <Link
          href={
            isLocked
              ? "#"
              : `/${communitySlug}/programs/${programId}/lessons/${lesson.id}`
          }
          className="flex items-center gap-4"
        >
          {/* Status Icon */}
          <div className="flex-shrink-0">
            {isLocked ? (
              <Lock className="h-5 w-5 text-muted-foreground" />
            ) : isCompleted ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
          </div>

          {/* Lesson Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {index}.
              </span>
              <span className="font-medium truncate">{lesson.title}</span>
            </div>
          </div>

          {/* Duration */}
          {lesson.video_duration_seconds && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {Math.floor(lesson.video_duration_seconds / 60)} min
            </div>
          )}

          {/* Play Button */}
          {!isLocked && (
            <Button variant="ghost" size="icon">
              <Play className="h-4 w-4" />
            </Button>
          )}
        </Link>
      </CardContent>
    </Card>
  );
}
