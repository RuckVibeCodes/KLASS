import { auth } from "@clerk/nextjs/server";

/**
 * Master Admin IDs from environment variable
 * Format: MASTER_ADMIN_IDS=user_abc123,user_def456
 */
function getMasterAdminIds(): string[] {
  const ids = process.env.MASTER_ADMIN_IDS || "";
  return ids
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

/**
 * Check if a Clerk user ID is a master admin
 */
export function isMasterAdminId(clerkUserId: string | null | undefined): boolean {
  if (!clerkUserId) return false;
  const masterAdminIds = getMasterAdminIds();
  return masterAdminIds.includes(clerkUserId);
}

/**
 * Check if the current authenticated user is a master admin
 * Use in server components and server actions
 */
export async function isMasterAdmin(): Promise<boolean> {
  const { userId } = await auth();
  return isMasterAdminId(userId);
}

/**
 * Require master admin access, throw if not authorized
 * Use at the start of master admin server actions
 */
export async function requireMasterAdmin(): Promise<string> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Authentication required");
  }

  if (!isMasterAdminId(userId)) {
    throw new Error("Master admin access required");
  }

  return userId;
}
