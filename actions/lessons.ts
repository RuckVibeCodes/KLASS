"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function markLessonComplete(
  lessonId: string,
  programId: string,
  communitySlug: string
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const supabase = await createClient();

  // Get community
  const { data: community } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", communitySlug)
    .single();

  if (!community) {
    throw new Error("Community not found");
  }

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_user_id", userId)
    .eq("community_id", community.id)
    .single();

  if (!profile) {
    throw new Error("Profile not found");
  }

  // Use admin client to bypass RLS for insert
  const adminSupabase = await createAdminClient();

  // Check if already completed
  const { data: existingProgress } = await adminSupabase
    .from("lesson_progress")
    .select("id")
    .eq("lesson_id", lessonId)
    .eq("profile_id", profile.id)
    .single();

  if (existingProgress) {
    // Already completed
    return { success: true, alreadyCompleted: true };
  }

  // Create progress record
  const { error } = await adminSupabase.from("lesson_progress").insert({
    lesson_id: lessonId,
    profile_id: profile.id,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/${communitySlug}/programs/${programId}`);
  revalidatePath(`/${communitySlug}/programs/${programId}/lessons/${lessonId}`);

  return { success: true };
}

export async function unmarkLessonComplete(
  lessonId: string,
  programId: string,
  communitySlug: string
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const supabase = await createClient();

  // Get community
  const { data: community } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", communitySlug)
    .single();

  if (!community) {
    throw new Error("Community not found");
  }

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_user_id", userId)
    .eq("community_id", community.id)
    .single();

  if (!profile) {
    throw new Error("Profile not found");
  }

  // Use admin client to bypass RLS
  const adminSupabase = await createAdminClient();

  const { error } = await adminSupabase
    .from("lesson_progress")
    .delete()
    .eq("lesson_id", lessonId)
    .eq("profile_id", profile.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/${communitySlug}/programs/${programId}`);
  revalidatePath(`/${communitySlug}/programs/${programId}/lessons/${lessonId}`);

  return { success: true };
}
