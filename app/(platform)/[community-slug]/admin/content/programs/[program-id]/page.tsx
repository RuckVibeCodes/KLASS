import { createClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProgramEditor } from "./program-editor";
import { LessonsList } from "./lessons-list";
import { ProgramPricing } from "@/components/admin/program-pricing";

export default async function EditProgramPage({
  params,
}: {
  params: Promise<{ "community-slug": string; "program-id": string }>;
}) {
  const { userId } = await auth();
  const resolvedParams = await params;
  const communitySlug = resolvedParams["community-slug"];
  const programId = resolvedParams["program-id"];
  const supabase = await createClient();

  // Get community
  const { data: community } = await supabase
    .from("communities")
    .select("*")
    .eq("slug", communitySlug)
    .single();

  if (!community) redirect("/");

  // Get program with lessons
  const { data: program } = await supabase
    .from("programs")
    .select(`
      *,
      lessons(*)
    `)
    .eq("id", programId)
    .eq("community_id", community.id)
    .single();

  if (!program) notFound();

  // Sort lessons by order_index
  const lessons = (program.lessons || []).sort(
    (a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index
  );

  return (
    <div className="container py-6 max-w-4xl">
      <Link
        href={`/${communitySlug}/admin/content/programs`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Programs
      </Link>

      <div className="space-y-8">
        {/* Program Settings */}
        <ProgramEditor
          program={program}
          communitySlug={communitySlug}
          communityId={community.id}
        />

        {/* Pricing */}
        <ProgramPricing
          program={program}
          communitySlug={communitySlug}
        />

        {/* Lessons */}
        <LessonsList
          programId={programId}
          lessons={lessons}
          communitySlug={communitySlug}
        />
      </div>
    </div>
  );
}
