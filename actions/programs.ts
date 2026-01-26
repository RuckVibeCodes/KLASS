"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { ContentVisibility, QuestionType } from "@/types/database";

// ============================================================================
// PROGRAM CRUD
// ============================================================================

export async function createProgram(
  communitySlug: string,
  data: {
    title: string;
    description?: string;
    thumbnail_url?: string;
    visibility?: ContentVisibility;
  }
) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  const supabase = await createClient();

  // Get community
  const { data: community } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", communitySlug)
    .single();

  if (!community) {
    return { error: "Community not found" };
  }

  // Get max order_index
  const adminSupabase = await createAdminClient();
  const { data: maxOrder } = await adminSupabase
    .from("programs")
    .select("order_index")
    .eq("community_id", community.id)
    .order("order_index", { ascending: false })
    .limit(1)
    .single();

  const newOrderIndex = (maxOrder?.order_index ?? -1) + 1;

  const { data: program, error } = await adminSupabase
    .from("programs")
    .insert({
      community_id: community.id,
      title: data.title,
      description: data.description || null,
      thumbnail_url: data.thumbnail_url || null,
      visibility: data.visibility || "members",
      published: false,
      order_index: newOrderIndex,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create program:", error);
    return { error: error.message };
  }

  revalidatePath(`/${communitySlug}/programs`);
  revalidatePath(`/${communitySlug}/admin/content/programs`);

  return { data: program };
}

export async function updateProgram(
  programId: string,
  communitySlug: string,
  data: {
    title?: string;
    description?: string | null;
    thumbnail_url?: string | null;
    visibility?: ContentVisibility;
    published?: boolean;
    order_index?: number;
  }
) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  const adminSupabase = await createAdminClient();

  const { data: program, error } = await adminSupabase
    .from("programs")
    .update(data)
    .eq("id", programId)
    .select()
    .single();

  if (error) {
    console.error("Failed to update program:", error);
    return { error: error.message };
  }

  revalidatePath(`/${communitySlug}/programs`);
  revalidatePath(`/${communitySlug}/programs/${programId}`);
  revalidatePath(`/${communitySlug}/admin/content/programs`);

  return { data: program };
}

export async function deleteProgram(programId: string, communitySlug: string) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  const adminSupabase = await createAdminClient();

  // Delete program (lessons will cascade delete)
  const { error } = await adminSupabase
    .from("programs")
    .delete()
    .eq("id", programId);

  if (error) {
    console.error("Failed to delete program:", error);
    return { error: error.message };
  }

  revalidatePath(`/${communitySlug}/programs`);
  revalidatePath(`/${communitySlug}/admin/content/programs`);

  return { success: true };
}

export async function reorderPrograms(
  communitySlug: string,
  programIds: string[]
) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  const adminSupabase = await createAdminClient();

  // Update order_index for each program
  for (let i = 0; i < programIds.length; i++) {
    const { error } = await adminSupabase
      .from("programs")
      .update({ order_index: i })
      .eq("id", programIds[i]);

    if (error) {
      console.error("Failed to reorder program:", error);
      return { error: error.message };
    }
  }

  revalidatePath(`/${communitySlug}/programs`);
  revalidatePath(`/${communitySlug}/admin/content/programs`);

  return { success: true };
}

// ============================================================================
// LESSON CRUD
// ============================================================================

export async function createLesson(
  programId: string,
  communitySlug: string,
  data: {
    title: string;
    content?: string;
    video_url?: string;
    video_duration_seconds?: number;
    attachment_urls?: string[];
    visibility?: ContentVisibility;
    section_id?: string | null;
  }
) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  const adminSupabase = await createAdminClient();

  // Get max order_index for this program (scoped to section if provided)
  let orderQuery = adminSupabase
    .from("lessons")
    .select("order_index")
    .eq("program_id", programId)
    .order("order_index", { ascending: false })
    .limit(1);

  if (data.section_id) {
    orderQuery = orderQuery.eq("section_id", data.section_id);
  }

  const { data: maxOrder } = await orderQuery.single();

  const newOrderIndex = (maxOrder?.order_index ?? -1) + 1;

  const { data: lesson, error } = await adminSupabase
    .from("lessons")
    .insert({
      program_id: programId,
      title: data.title,
      content: data.content || null,
      video_url: data.video_url || null,
      video_duration_seconds: data.video_duration_seconds || null,
      attachment_urls: data.attachment_urls || [],
      visibility: data.visibility || "members",
      published: false,
      order_index: newOrderIndex,
      section_id: data.section_id || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create lesson:", error);
    return { error: error.message };
  }

  revalidatePath(`/${communitySlug}/programs/${programId}`);
  revalidatePath(`/${communitySlug}/admin/content/programs`);

  return { data: lesson };
}

export async function updateLesson(
  lessonId: string,
  programId: string,
  communitySlug: string,
  data: {
    title?: string;
    content?: string | null;
    video_url?: string | null;
    video_duration_seconds?: number | null;
    attachment_urls?: string[];
    visibility?: ContentVisibility;
    published?: boolean;
    order_index?: number;
  }
) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  const adminSupabase = await createAdminClient();

  const { data: lesson, error } = await adminSupabase
    .from("lessons")
    .update(data)
    .eq("id", lessonId)
    .select()
    .single();

  if (error) {
    console.error("Failed to update lesson:", error);
    return { error: error.message };
  }

  revalidatePath(`/${communitySlug}/programs/${programId}`);
  revalidatePath(`/${communitySlug}/programs/${programId}/lessons/${lessonId}`);
  revalidatePath(`/${communitySlug}/admin/content/programs`);

  return { data: lesson };
}

export async function deleteLesson(
  lessonId: string,
  programId: string,
  communitySlug: string
) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  const adminSupabase = await createAdminClient();

  const { error } = await adminSupabase
    .from("lessons")
    .delete()
    .eq("id", lessonId);

  if (error) {
    console.error("Failed to delete lesson:", error);
    return { error: error.message };
  }

  revalidatePath(`/${communitySlug}/programs/${programId}`);
  revalidatePath(`/${communitySlug}/admin/content/programs`);

  return { success: true };
}

export async function reorderLessons(
  programId: string,
  communitySlug: string,
  lessonIds: string[]
) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  const adminSupabase = await createAdminClient();

  // Update order_index for each lesson
  for (let i = 0; i < lessonIds.length; i++) {
    const { error } = await adminSupabase
      .from("lessons")
      .update({ order_index: i })
      .eq("id", lessonIds[i]);

    if (error) {
      console.error("Failed to reorder lesson:", error);
      return { error: error.message };
    }
  }

  revalidatePath(`/${communitySlug}/programs/${programId}`);
  revalidatePath(`/${communitySlug}/admin/content/programs`);

  return { success: true };
}

export async function duplicateLesson(
  lessonId: string,
  programId: string,
  communitySlug: string
) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  const adminSupabase = await createAdminClient();

  // Get original lesson
  const { data: original, error: fetchError } = await adminSupabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .single();

  if (fetchError || !original) {
    return { error: "Lesson not found" };
  }

  // Get max order_index
  const { data: maxOrder } = await adminSupabase
    .from("lessons")
    .select("order_index")
    .eq("program_id", programId)
    .order("order_index", { ascending: false })
    .limit(1)
    .single();

  const newOrderIndex = (maxOrder?.order_index ?? -1) + 1;

  // Create duplicate
  const { data: lesson, error } = await adminSupabase
    .from("lessons")
    .insert({
      program_id: programId,
      title: `${original.title} (Copy)`,
      content: original.content,
      video_url: original.video_url,
      video_duration_seconds: original.video_duration_seconds,
      attachment_urls: original.attachment_urls,
      visibility: original.visibility,
      published: false,
      order_index: newOrderIndex,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to duplicate lesson:", error);
    return { error: error.message };
  }

  revalidatePath(`/${communitySlug}/programs/${programId}`);
  revalidatePath(`/${communitySlug}/admin/content/programs`);

  return { data: lesson };
}

// ============================================================================
// QUIZ CRUD
// ============================================================================

export async function createQuiz(
  lessonId: string,
  programId: string,
  communitySlug: string,
  data: {
    title: string;
    description?: string;
    passing_score?: number;
    max_attempts?: number | null;
    randomize_questions?: boolean;
    show_correct_answers?: boolean;
  }
) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  const adminSupabase = await createAdminClient();

  const { data: quiz, error } = await adminSupabase
    .from("quizzes")
    .insert({
      lesson_id: lessonId,
      title: data.title,
      description: data.description || null,
      passing_score: data.passing_score ?? 70,
      max_attempts: data.max_attempts ?? null,
      randomize_questions: data.randomize_questions ?? false,
      show_correct_answers: data.show_correct_answers ?? true,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create quiz:", error);
    return { error: error.message };
  }

  revalidatePath(`/${communitySlug}/admin/content/programs/${programId}/lessons/${lessonId}`);

  return { data: quiz };
}

export async function updateQuiz(
  quizId: string,
  lessonId: string,
  programId: string,
  communitySlug: string,
  data: {
    title?: string;
    description?: string | null;
    passing_score?: number;
    max_attempts?: number | null;
    randomize_questions?: boolean;
    show_correct_answers?: boolean;
  }
) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  const adminSupabase = await createAdminClient();

  const { data: quiz, error } = await adminSupabase
    .from("quizzes")
    .update(data)
    .eq("id", quizId)
    .select()
    .single();

  if (error) {
    console.error("Failed to update quiz:", error);
    return { error: error.message };
  }

  revalidatePath(`/${communitySlug}/admin/content/programs/${programId}/lessons/${lessonId}`);

  return { data: quiz };
}

export async function deleteQuiz(
  quizId: string,
  lessonId: string,
  programId: string,
  communitySlug: string
) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  const adminSupabase = await createAdminClient();

  const { error } = await adminSupabase
    .from("quizzes")
    .delete()
    .eq("id", quizId);

  if (error) {
    console.error("Failed to delete quiz:", error);
    return { error: error.message };
  }

  revalidatePath(`/${communitySlug}/admin/content/programs/${programId}/lessons/${lessonId}`);

  return { success: true };
}

// ============================================================================
// QUIZ QUESTIONS CRUD
// ============================================================================

export async function createQuizQuestion(
  quizId: string,
  lessonId: string,
  programId: string,
  communitySlug: string,
  data: {
    question_text: string;
    question_type?: QuestionType;
    points?: number;
    explanation?: string;
    image_url?: string | null;
    options: Array<{
      option_text: string;
      is_correct: boolean;
      image_url?: string | null;
    }>;
  }
) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  const adminSupabase = await createAdminClient();

  // Get max order_index
  const { data: maxOrder } = await adminSupabase
    .from("quiz_questions")
    .select("order_index")
    .eq("quiz_id", quizId)
    .order("order_index", { ascending: false })
    .limit(1)
    .single();

  const newOrderIndex = (maxOrder?.order_index ?? -1) + 1;

  // Create question
  const { data: question, error: questionError } = await adminSupabase
    .from("quiz_questions")
    .insert({
      quiz_id: quizId,
      question_text: data.question_text,
      question_type: data.question_type || "multiple_choice",
      order_index: newOrderIndex,
      points: data.points ?? 1,
      explanation: data.explanation || null,
      image_url: data.image_url || null,
    })
    .select()
    .single();

  if (questionError) {
    console.error("Failed to create question:", questionError);
    return { error: questionError.message };
  }

  // Create options
  const optionsToInsert = data.options.map((opt, index) => ({
    question_id: question.id,
    option_text: opt.option_text,
    is_correct: opt.is_correct,
    order_index: index,
    image_url: opt.image_url || null,
  }));

  const { error: optionsError } = await adminSupabase
    .from("quiz_options")
    .insert(optionsToInsert);

  if (optionsError) {
    console.error("Failed to create options:", optionsError);
    // Clean up the question if options failed
    await adminSupabase.from("quiz_questions").delete().eq("id", question.id);
    return { error: optionsError.message };
  }

  revalidatePath(`/${communitySlug}/admin/content/programs/${programId}/lessons/${lessonId}`);

  return { data: question };
}

export async function updateQuizQuestion(
  questionId: string,
  lessonId: string,
  programId: string,
  communitySlug: string,
  data: {
    question_text?: string;
    question_type?: QuestionType;
    points?: number;
    explanation?: string | null;
    image_url?: string | null;
    options?: Array<{
      id?: string;
      option_text: string;
      is_correct: boolean;
      image_url?: string | null;
    }>;
  }
) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  const adminSupabase = await createAdminClient();

  // Update question
  const questionUpdate: Record<string, unknown> = {};
  if (data.question_text !== undefined) questionUpdate.question_text = data.question_text;
  if (data.question_type !== undefined) questionUpdate.question_type = data.question_type;
  if (data.points !== undefined) questionUpdate.points = data.points;
  if (data.explanation !== undefined) questionUpdate.explanation = data.explanation;
  if (data.image_url !== undefined) questionUpdate.image_url = data.image_url;

  if (Object.keys(questionUpdate).length > 0) {
    const { error } = await adminSupabase
      .from("quiz_questions")
      .update(questionUpdate)
      .eq("id", questionId);

    if (error) {
      console.error("Failed to update question:", error);
      return { error: error.message };
    }
  }

  // Update options if provided
  if (data.options) {
    // Delete existing options
    await adminSupabase.from("quiz_options").delete().eq("question_id", questionId);

    // Insert new options
    const optionsToInsert = data.options.map((opt, index) => ({
      question_id: questionId,
      option_text: opt.option_text,
      is_correct: opt.is_correct,
      order_index: index,
      image_url: opt.image_url || null,
    }));

    const { error: optionsError } = await adminSupabase
      .from("quiz_options")
      .insert(optionsToInsert);

    if (optionsError) {
      console.error("Failed to update options:", optionsError);
      return { error: optionsError.message };
    }
  }

  revalidatePath(`/${communitySlug}/admin/content/programs/${programId}/lessons/${lessonId}`);

  return { success: true };
}

export async function deleteQuizQuestion(
  questionId: string,
  lessonId: string,
  programId: string,
  communitySlug: string
) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  const adminSupabase = await createAdminClient();

  const { error } = await adminSupabase
    .from("quiz_questions")
    .delete()
    .eq("id", questionId);

  if (error) {
    console.error("Failed to delete question:", error);
    return { error: error.message };
  }

  revalidatePath(`/${communitySlug}/admin/content/programs/${programId}/lessons/${lessonId}`);

  return { success: true };
}

export async function reorderQuizQuestions(
  quizId: string,
  lessonId: string,
  programId: string,
  communitySlug: string,
  questionIds: string[]
) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  const adminSupabase = await createAdminClient();

  for (let i = 0; i < questionIds.length; i++) {
    const { error } = await adminSupabase
      .from("quiz_questions")
      .update({ order_index: i })
      .eq("id", questionIds[i]);

    if (error) {
      console.error("Failed to reorder question:", error);
      return { error: error.message };
    }
  }

  revalidatePath(`/${communitySlug}/admin/content/programs/${programId}/lessons/${lessonId}`);

  return { success: true };
}

// ============================================================================
// GET QUIZ WITH QUESTIONS AND OPTIONS
// ============================================================================

export async function getQuizForLesson(lessonId: string) {
  const supabase = await createClient();

  const { data: quiz, error } = await supabase
    .from("quizzes")
    .select(`
      *,
      quiz_questions (
        *,
        quiz_options (*)
      )
    `)
    .eq("lesson_id", lessonId)
    .order("order_index", { referencedTable: "quiz_questions", ascending: true })
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Failed to get quiz:", error);
    return { error: error.message };
  }

  return { data: quiz };
}