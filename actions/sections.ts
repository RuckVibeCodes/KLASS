"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";

// ============================================================================
// SECTION CRUD
// ============================================================================

export async function createSection(
  programId: string,
  communitySlug: string,
  data: {
    title: string;
    description?: string;
  }
) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

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
    console.error("Failed to create section:", error);
    return { error: error.message };
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
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const adminSupabase = await createAdminClient();

  const { data: section, error } = await adminSupabase
    .from("program_sections")
    .update(data)
    .eq("id", sectionId)
    .select()
    .single();

  if (error) {
    console.error("Failed to update section:", error);
    return { error: error.message };
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
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const adminSupabase = await createAdminClient();

  // First, unlink lessons from this section (don't delete them)
  const { error: unlinkError } = await adminSupabase
    .from("lessons")
    .update({ section_id: null })
    .eq("section_id", sectionId);

  if (unlinkError) {
    console.error("Failed to unlink lessons:", unlinkError);
    return { error: "Failed to unlink lessons from module" };
  }

  // Delete the section
  const { error } = await adminSupabase
    .from("program_sections")
    .delete()
    .eq("id", sectionId);

  if (error) {
    console.error("Failed to delete section:", error);
    return { error: error.message };
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
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const adminSupabase = await createAdminClient();

  for (let i = 0; i < sectionIds.length; i++) {
    const { error } = await adminSupabase
      .from("program_sections")
      .update({ order_index: i })
      .eq("id", sectionIds[i]);

    if (error) {
      console.error("Failed to reorder section:", error);
      return { error: error.message };
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
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const adminSupabase = await createAdminClient();

  const { error } = await adminSupabase
    .from("lessons")
    .update({ section_id: sectionId })
    .eq("id", lessonId);

  if (error) {
    console.error("Failed to move lesson:", error);
    return { error: error.message };
  }

  revalidatePath(`/${communitySlug}/admin/content/programs/${programId}`);
  revalidatePath(`/${communitySlug}/programs/${programId}`);

  return { success: true };
}
