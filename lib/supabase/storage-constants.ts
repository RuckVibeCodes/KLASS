// Storage bucket names - can be imported in both client and server components
export const BUCKETS = {
  AVATARS: "avatars",
  COMMUNITY_ASSETS: "community-assets",
  LESSON_CONTENT: "lesson-content",
} as const;

export type BucketName = (typeof BUCKETS)[keyof typeof BUCKETS];

/**
 * Generate a unique file path for uploads
 */
export function generateFilePath(
  bucket: BucketName,
  communityId: string,
  fileName: string
): string {
  const timestamp = Date.now();
  const ext = fileName.split(".").pop()?.toLowerCase() || "jpg";
  const sanitizedName = fileName
    .split(".")[0]
    .replace(/[^a-zA-Z0-9]/g, "-")
    .substring(0, 30);

  return `${communityId}/${timestamp}-${sanitizedName}.${ext}`;
}
