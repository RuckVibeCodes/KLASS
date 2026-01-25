"use server";

import { auth } from "@clerk/nextjs/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getPlaybook, getAllStepIds } from "@/lib/playbooks/templates";

interface PlaybookProgress {
  id: string;
  community_id: string;
  profile_id: string;
  playbook_id: string;
  completed_step_ids: string[];
  updated_at: string;
}

/**
 * Get playbook progress for the current user
 */
export async function getPlaybookProgress(
  communitySlug: string,
  playbookId: string
): Promise<{ data: PlaybookProgress | null; error: string | null }> {
  const { userId } = await auth();
  if (!userId) {
    return { data: null, error: "Unauthorized" };
  }

  const supabase = await createClient();

  // Get community
  const { data: community } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", communitySlug)
    .single();

  if (!community) {
    return { data: null, error: "Community not found" };
  }

  // Get user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("clerk_user_id", userId)
    .eq("community_id", community.id)
    .single();

  if (!profile || profile.role !== "ADMIN") {
    return { data: null, error: "Admin access required" };
  }

  // Get progress
  const { data: progress, error } = await supabase
    .from("playbook_progress")
    .select("*")
    .eq("community_id", community.id)
    .eq("profile_id", profile.id)
    .eq("playbook_id", playbookId)
    .single();

  if (error && error.code !== "PGRST116") {
    return { data: null, error: error.message };
  }

  // Return existing progress or empty progress
  return {
    data: progress || {
      id: "",
      community_id: community.id,
      profile_id: profile.id,
      playbook_id: playbookId,
      completed_step_ids: [],
      updated_at: new Date().toISOString(),
    },
    error: null,
  };
}

/**
 * Get all playbook progress for a community
 */
export async function getAllPlaybookProgress(
  communitySlug: string
): Promise<{ data: PlaybookProgress[]; error: string | null }> {
  const { userId } = await auth();
  if (!userId) {
    return { data: [], error: "Unauthorized" };
  }

  const supabase = await createClient();

  // Get community
  const { data: community } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", communitySlug)
    .single();

  if (!community) {
    return { data: [], error: "Community not found" };
  }

  // Get user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("clerk_user_id", userId)
    .eq("community_id", community.id)
    .single();

  if (!profile || profile.role !== "ADMIN") {
    return { data: [], error: "Admin access required" };
  }

  // Get all progress for this user
  const { data: progress, error } = await supabase
    .from("playbook_progress")
    .select("*")
    .eq("community_id", community.id)
    .eq("profile_id", profile.id);

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: progress || [], error: null };
}

/**
 * Toggle a step as complete/incomplete
 */
export async function togglePlaybookStep(
  communitySlug: string,
  playbookId: string,
  stepId: string
): Promise<{ error: string | null }> {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  // Validate playbook exists
  const playbook = getPlaybook(playbookId);
  if (!playbook) {
    return { error: "Playbook not found" };
  }

  // Validate step exists in playbook
  const allStepIds = getAllStepIds(playbook);
  if (!allStepIds.includes(stepId)) {
    return { error: "Step not found in playbook" };
  }

  const supabase = await createClient();
  const adminSupabase = await createAdminClient();

  // Get community
  const { data: community } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", communitySlug)
    .single();

  if (!community) {
    return { error: "Community not found" };
  }

  // Get user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("clerk_user_id", userId)
    .eq("community_id", community.id)
    .single();

  if (!profile || profile.role !== "ADMIN") {
    return { error: "Admin access required" };
  }

  // Get current progress
  const { data: existingProgress } = await supabase
    .from("playbook_progress")
    .select("*")
    .eq("community_id", community.id)
    .eq("profile_id", profile.id)
    .eq("playbook_id", playbookId)
    .single();

  let completedStepIds: string[] = existingProgress?.completed_step_ids || [];

  // Toggle the step
  if (completedStepIds.includes(stepId)) {
    // Remove from completed
    completedStepIds = completedStepIds.filter((id) => id !== stepId);
  } else {
    // Add to completed
    completedStepIds = [...completedStepIds, stepId];
  }

  // Upsert progress
  const { error } = await adminSupabase.from("playbook_progress").upsert(
    {
      community_id: community.id,
      profile_id: profile.id,
      playbook_id: playbookId,
      completed_step_ids: completedStepIds,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "community_id,profile_id,playbook_id" }
  );

  if (error) {
    console.error("Failed to toggle step:", error);
    return { error: error.message };
  }

  revalidatePath(`/${communitySlug}/admin/playbooks`);
  revalidatePath(`/${communitySlug}/admin/playbooks/${playbookId}`);

  return { error: null };
}

/**
 * Reset all progress for a playbook
 */
export async function resetPlaybookProgress(
  communitySlug: string,
  playbookId: string
): Promise<{ error: string | null }> {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  const supabase = await createClient();
  const adminSupabase = await createAdminClient();

  // Get community
  const { data: community } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", communitySlug)
    .single();

  if (!community) {
    return { error: "Community not found" };
  }

  // Get user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("clerk_user_id", userId)
    .eq("community_id", community.id)
    .single();

  if (!profile || profile.role !== "ADMIN") {
    return { error: "Admin access required" };
  }

  // Delete progress
  const { error } = await adminSupabase
    .from("playbook_progress")
    .delete()
    .eq("community_id", community.id)
    .eq("profile_id", profile.id)
    .eq("playbook_id", playbookId);

  if (error) {
    console.error("Failed to reset progress:", error);
    return { error: error.message };
  }

  revalidatePath(`/${communitySlug}/admin/playbooks`);
  revalidatePath(`/${communitySlug}/admin/playbooks/${playbookId}`);

  return { error: null };
}
