/**
 * Referral code generation and cookie handling utilities
 */

const REFERRAL_COOKIE_NAME = "klass_ref";
const REFERRAL_STORAGE_KEY = "klass_referral";
const REFERRAL_TTL_DAYS = 30;

/**
 * Generate a unique 8-character alphanumeric referral code
 */
export function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclude confusing chars (0,O,1,I)
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Client-side: Store referral code in both cookie and localStorage
 * This provides bulletproof attribution even if cookies are cleared
 */
export function storeReferralCode(code: string, communitySlug: string): void {
  if (typeof window === "undefined") return;

  const data = { code, communitySlug, timestamp: Date.now() };
  const encoded = encodeURIComponent(JSON.stringify(data));

  // Set cookie with 30-day expiry
  const expires = new Date();
  expires.setDate(expires.getDate() + REFERRAL_TTL_DAYS);
  document.cookie = `${REFERRAL_COOKIE_NAME}=${encoded}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;

  // Also store in localStorage as backup
  try {
    localStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage might be unavailable
  }
}

/**
 * Client-side: Get stored referral code (checks both cookie and localStorage)
 */
export function getStoredReferralCode(communitySlug: string): string | null {
  if (typeof window === "undefined") return null;

  // Try cookie first
  const cookieData = getCookieReferral();
  if (cookieData && cookieData.communitySlug === communitySlug && isValidReferral(cookieData)) {
    return cookieData.code;
  }

  // Fall back to localStorage
  try {
    const stored = localStorage.getItem(REFERRAL_STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      if (data.communitySlug === communitySlug && isValidReferral(data)) {
        return data.code;
      }
    }
  } catch {
    // Parsing error or localStorage unavailable
  }

  return null;
}

/**
 * Client-side: Clear stored referral code after successful attribution
 */
export function clearStoredReferralCode(): void {
  if (typeof window === "undefined") return;

  // Clear cookie
  document.cookie = `${REFERRAL_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

  // Clear localStorage
  try {
    localStorage.removeItem(REFERRAL_STORAGE_KEY);
  } catch {
    // localStorage might be unavailable
  }
}

/**
 * Parse referral data from cookie
 */
function getCookieReferral(): { code: string; communitySlug: string; timestamp: number } | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === REFERRAL_COOKIE_NAME && value) {
      try {
        return JSON.parse(decodeURIComponent(value));
      } catch {
        return null;
      }
    }
  }
  return null;
}

/**
 * Check if referral data is still valid (within TTL)
 */
function isValidReferral(data: { timestamp: number }): boolean {
  const ttlMs = REFERRAL_TTL_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() - data.timestamp < ttlMs;
}

/**
 * Build a shareable referral URL
 */
export function buildReferralUrl(
  baseUrl: string,
  communitySlug: string,
  referralCode: string
): string {
  return `${baseUrl}/${communitySlug}?ref=${referralCode}`;
}

/**
 * Extract referral code from URL params
 */
export function extractReferralCodeFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get("ref");
  } catch {
    return null;
  }
}
