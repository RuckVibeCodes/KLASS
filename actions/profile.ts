"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

interface UpdateProfileInput {
  profileId: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  communitySlug: string;
}

export async function updateProfile(input: UpdateProfileInput) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const supabase = createAdminClient();

  // Verify this profile belongs to the current user
  const { data: profile } = await supabase
    .from("profiles")
    .select("clerk_user_id")
    .eq("id", input.profileId)
    .single();

  if (!profile || profile.clerk_user_id !== userId) {
    throw new Error("Unauthorized - cannot update another user's profile");
  }

  // Update profile using admin client
  const adminSupabase = await createAdminClient();

  const { error } = await adminSupabase
    .from("profiles")
    .update({
      display_name: input.displayName || null,
      avatar_url: input.avatarUrl || null,
      bio: input.bio || null,
    })
    .eq("id", input.profileId);

  if (error) {
    console.error("Failed to update profile:", error.message);
    throw new Error("Failed to update profile");
  }

  revalidatePath(`/${input.communitySlug}`);
  revalidatePath(`/${input.communitySlug}/settings`);

  return { success: true };
}
