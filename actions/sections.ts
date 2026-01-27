"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { isDemoSlug } from "@/lib/demo";

// ============================================================================
// SECTION CRUD
// ============================================================================

async function verifyAdmin(userId: string, communitySlug: string) {
  const supabase = await createClient();
  const { data: community } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", communitySlug)
    .single();

  if (!community) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("clerk_user_id", userId)
    .eq("community_id", community.id)
    .single();

  if (profile?.role !== "ADMIN") return null;
  return community.id;
}

export async function createSection(
  programId: string,
  communitySlug: string,
  data: {
    title: string;
    description?: string;
  }
) {
  if (isDemoSlug(communitySlug)) return { data: { id: "demo-section" } };

  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const communityId = await verifyAdmin(userId, communitySlug);
  if (!communityId) return { error: "Admin access required" };

  const adminSupabase = await createAdminClient();

  // Get max order_index
  const { data: maxOrder } = await adminSupabase
    .from("program_sections")
    .select("order_index")
    .eq("program_id", programId)
    .order("order_index", { ascending: false })
    .limit(1)
    .single();

  const newOrderIndex = (maxOrder?.order_index ?? -1) + 1;

  const { data: section, error } = await adminSupabase
    .from("program_sections")
    .insert({
      program_id: programId,
      title: data.title,
      description: data.description || null,
      order_index: newOrderIndex,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create section:", error.message);
    return { error: "Failed to create section" };
  }

  revalidatePath(`/${communitySlug}/admin/content/programs/${programId}`);
  revalidatePath(`/${communitySlug}/programs/${programId}`);

  return { data: section };
}

export async function updateSection(
  sectionId: string,
  programId: string,
  communitySlug: string,
  data: {
    title?: string;
    description?: string | null;
    order_index?: number;
  }
) {
  if (isDemoSlug(communitySlug)) return { success: true };

  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const communityId = await verifyAdmin(userId, communitySlug);
  if (!communityId) return { error: "Admin access required" };

  const adminSupabase = await createAdminClient();

  const { data: section, error } = await adminSupabase
    .from("program_sections")
    .update(data)
    .eq("id", sectionId)
    .select()
    .single();

  if (error) {
    console.error("Failed to update section:", error.message);
    return { error: "Failed to update section" };
  }

  revalidatePath(`/${communitySlug}/admin/content/programs/${programId}`);
  revalidatePath(`/${communitySlug}/programs/${programId}`);

  return { data: section };
}

export async function deleteSection(
  sectionId: string,
  programId: string,
  communitySlug: string
) {
  if (isDemoSlug(communitySlug)) return { success: true };

  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const communityId = await verifyAdmin(userId, communitySlug);
  if (!communityId) return { error: "Admin access required" };

  const adminSupabase = await createAdminClient();

  // First, unlink lessons from this section (don't delete them)
  await adminSupabase
    .from("lessons")
    .update({ section_id: null })
    .eq("section_id", sectionId);

  // Delete the section
  const { error } = await adminSupabase
    .from("program_sections")
    .delete()
    .eq("id", sectionId);

  if (error) {
    console.error("Failed to delete section:", error.message);
    return { error: "Failed to delete section" };
  }

  revalidatePath(`/${communitySlug}/admin/content/programs/${programId}`);
  revalidatePath(`/${communitySlug}/programs/${programId}`);

  return { success: true };
}

export async function reorderSections(
  programId: string,
  communitySlug: string,
  sectionIds: string[]
) {
  if (isDemoSlug(communitySlug)) return { success: true };

  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const communityId = await verifyAdmin(userId, communitySlug);
  if (!communityId) return { error: "Admin access required" };

  const adminSupabase = await createAdminClient();

  for (let i = 0; i < sectionIds.length; i++) {
    const { error } = await adminSupabase
      .from("program_sections")
      .update({ order_index: i })
      .eq("id", sectionIds[i]);

    if (error) {
      console.error("Failed to reorder section:", error.message);
      return { error: "Failed to reorder sections" };
    }
  }

  revalidatePath(`/${communitySlug}/admin/content/programs/${programId}`);
  revalidatePath(`/${communitySlug}/programs/${programId}`);

  return { success: true };
}

export async function moveLessonToSection(
  lessonId: string,
  sectionId: string | null,
  programId: string,
  communitySlug: string
) {
  if (isDemoSlug(communitySlug)) return { success: true };

  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const communityId = await verifyAdmin(userId, communitySlug);
  if (!communityId) return { error: "Admin access required" };

  const adminSupabase = await createAdminClient();

  const { error } = await adminSupabase
    .from("lessons")
    .update({ section_id: sectionId })
    .eq("id", lessonId);

  if (error) {
    console.error("Failed to move lesson:", error.message);
    return { error: "Failed to move lesson" };
  }

  revalidatePath(`/${communitySlug}/admin/content/programs/${programId}`);
  revalidatePath(`/${communitySlug}/programs/${programId}`);

  return { success: true };
}
