"use server";

import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface OnboardingStatus {
  hasWelcomePost: boolean;
  hasAboutPage: boolean;
  hasResource: boolean;
  hasProfileSetup: boolean;
  hasProgram: boolean;
  completedSteps: number;
  totalSteps: number;
  percentComplete: number;
  onboardingDismissed: boolean;
}

export async function getCreatorOnboardingStatus(
  communityId: string
): Promise<{ data: OnboardingStatus | null; error: string | null }> {
  const { userId } = await auth();
  if (!userId) {
    return { data: null, error: "Not authenticated" };
  }

  const supabase = await createAdminClient();

  // Get admin profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, display_name, avatar_url, bio")
    .eq("clerk_user_id", userId)
    .eq("community_id", communityId)
    .single();

  if (profile?.role !== "ADMIN") {
    return { data: null, error: "Not authorized" };
  }

  // Check for welcome post (any post by admin)
  const { data: posts } = await supabase
    .from("posts")
    .select("id")
    .eq("community_id", communityId)
    .eq("author_profile_id", profile.id)
    .limit(1);

  // Check for about page content (in community settings)
  const { data: community } = await supabase
    .from("communities")
    .select("settings_json, description")
    .eq("id", communityId)
    .single();

  // Check for resources
  const { data: resources } = await supabase
    .from("resources")
    .select("id")
    .eq("community_id", communityId)
    .limit(1);

  // Check for programs
  const { data: programs } = await supabase
    .from("programs")
    .select("id")
    .eq("community_id", communityId)
    .limit(1);

  const hasProfileSetup = !!(profile.display_name && profile.avatar_url);
  const hasAboutPage = !!(community?.description || (community?.settings_json as { about_content?: string })?.about_content);
  const onboardingDismissed = !!(community?.settings_json as { onboarding_dismissed?: boolean })?.onboarding_dismissed;

  const status: OnboardingStatus = {
    hasWelcomePost: (posts?.length || 0) > 0,
    hasAboutPage,
    hasResource: (resources?.length || 0) > 0,
    hasProfileSetup,
    hasProgram: (programs?.length || 0) > 0,
    completedSteps: 0,
    totalSteps: 5,
    percentComplete: 0,
    onboardingDismissed,
  };

  // Calculate completed steps
  status.completedSteps = [
    status.hasWelcomePost,
    status.hasAboutPage,
    status.hasResource,
    status.hasProfileSetup,
    status.hasProgram,
  ].filter(Boolean).length;

  status.percentComplete = Math.round((status.completedSteps / status.totalSteps) * 100);

  return { data: status, error: null };
}

export async function dismissOnboarding(
  communityId: string,
  communitySlug: string
): Promise<{ error: string | null }> {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Not authenticated" };
  }

  const supabase = await createAdminClient();

  // Verify admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("clerk_user_id", userId)
    .eq("community_id", communityId)
    .single();

  if (profile?.role !== "ADMIN") {
    return { error: "Not authorized" };
  }

  // Get current settings
  const { data: community } = await supabase
    .from("communities")
    .select("settings_json")
    .eq("id", communityId)
    .single();

  // Update settings to dismiss onboarding
  const currentSettings = (community?.settings_json || {}) as Record<string, unknown>;
  const { error } = await supabase
    .from("communities")
    .update({
      settings_json: {
        ...currentSettings,
        onboarding_dismissed: true,
      },
    })
    .eq("id", communityId);

  if (error) {
    return { error: "Failed to update settings" };
  }

  revalidatePath(`/${communitySlug}/admin`);
  return { error: null };
}
