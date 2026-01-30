import { createAdminClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LessonEditor } from "./lesson-editor";

export default async function EditLessonPage({
  params,
}: {
  params: Promise<{
    "community-slug": string;
    "program-id": string;
    "lesson-id": string;
  }>;
}) {
  const { userId } = await auth();
  const resolvedParams = await params;
  const communitySlug = resolvedParams["community-slug"];
  const programId = resolvedParams["program-id"];
  const lessonId = resolvedParams["lesson-id"];
  const supabase = await createAdminClient();

  // Get community
  const { data: community } = await supabase
    .from("communities")
    .select("*")
    .eq("slug", communitySlug)
    .single();

  if (!community) redirect("/");

  // Get program
  const { data: program } = await supabase
    .from("programs")
    .select("id, title")
    .eq("id", programId)
    .eq("community_id", community.id)
    .single();

  if (!program) notFound();

  // Get lesson
  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .eq("program_id", programId)
    .single();

  if (!lesson) notFound();

  // Get quiz with questions and options
  const { data: quiz } = await supabase
    .from("quizzes")
    .select(`
      *,
      quiz_questions (
        *,
        quiz_options (*)
      )
    `)
    .eq("lesson_id", lessonId)
    .single();

  return (
    <div className="container py-6 max-w-4xl">
      <Link
        href={`/${communitySlug}/admin/content/programs/${programId}`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to {program.title}
      </Link>

      <LessonEditor
        lesson={lesson}
        programId={programId}
        communitySlug={communitySlug}
        communityId={community.id}
        quiz={quiz}
      />
    </div>
  );
}
