"use server";

import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/server";
import { BUCKETS, generateFilePath, type BucketName } from "@/lib/supabase/storage";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

export async function uploadImage(
  formData: FormData,
  bucket: BucketName,
  communityId: string
): Promise<{ url?: string; error?: string }> {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return { error: "No file provided" };
  }

  // Validate file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { error: "Invalid file type. Please upload an image (JPG, PNG, GIF, WebP, or SVG)." };
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return { error: "File too large. Maximum size is 10MB." };
  }

  const supabase = await createAdminClient();
  const filePath = generateFilePath(bucket, communityId, file.name);

  // Convert File to ArrayBuffer for upload
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    return { error: "Failed to upload file. Please try again." };
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return { url: publicUrl };
}

export async function deleteImage(
  bucket: BucketName,
  fileUrl: string
): Promise<{ success?: boolean; error?: string }> {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  // Extract file path from URL
  const urlParts = fileUrl.split(`/storage/v1/object/public/${bucket}/`);
  if (urlParts.length !== 2) {
    return { error: "Invalid file URL" };
  }

  const filePath = urlParts[1];
  const supabase = await createAdminClient();

  const { error } = await supabase.storage.from(bucket).remove([filePath]);

  if (error) {
    console.error("Delete error:", error);
    return { error: "Failed to delete file." };
  }

  return { success: true };
}
