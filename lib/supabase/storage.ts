import { createClient } from "./server";

// Re-export constants for convenience (server-side only imports should use this file)
export { BUCKETS, generateFilePath } from "./storage-constants";
export type { BucketName } from "./storage-constants";

/**
 * Get public URL for a file in storage (server-side only)
 */
export async function getPublicUrl(
  bucket: string,
  filePath: string
): Promise<string> {
  const supabase = await createClient();
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return publicUrl;
}
