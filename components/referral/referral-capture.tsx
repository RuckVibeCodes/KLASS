"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { storeReferralCode, getStoredReferralCode } from "@/lib/referral";

interface ReferralCaptureProps {
  communitySlug: string;
}

/**
 * Client component that captures referral codes from URL and stores them.
 * Must be rendered within the community layout to capture ?ref= params.
 *
 * Uses first-touch attribution - only stores if no existing referral for this community.
 */
export function ReferralCapture({ communitySlug }: ReferralCaptureProps) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const refCode = searchParams.get("ref");

    if (refCode) {
      // Check if already has a referral stored for this community
      const existingCode = getStoredReferralCode(communitySlug);

      if (!existingCode) {
        // First-touch: store the referral code
        storeReferralCode(refCode, communitySlug);
      }

      // Optionally clean up the URL to remove ?ref= (optional UX improvement)
      // For now, we leave it as-is so the user can share the same link
    }
  }, [searchParams, communitySlug]);

  // This component renders nothing - it just captures the referral
  return null;
}
