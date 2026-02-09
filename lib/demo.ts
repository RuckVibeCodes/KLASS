/**
 * Demo mode utilities
 * 
 * When communitySlug === "demo", server actions return fake success
 * without writing to the database. This creates a sandbox where
 * visitors can explore all features without affecting real data.
 */

export const DEMO_SLUG = "demo";

export function isDemoSlug(slug: string): boolean {
  return slug === DEMO_SLUG;
}

/**
 * Wrap a server action to short-circuit in demo mode.
 * Returns the provided fake response instead of executing the real logic.
 */
export function demoGuard<T>(slug: string, fakeResponse: T): T | null {
  if (isDemoSlug(slug)) {
    return fakeResponse;
  }
  return null;
}
