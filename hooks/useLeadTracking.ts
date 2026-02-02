"use client";

import { useEffect } from "react";

interface UseLeadTrackingOptions {
  pageName?: string;
  enabled?: boolean;
}

export function useLeadTracking(options: UseLeadTrackingOptions = {}) {
  const { pageName = "unknown", enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const trackPageView = async () => {
      // Check if we have a known lead_id in localStorage
      const leadId = localStorage.getItem("lead_id");

      if (leadId) {
        try {
          await fetch("/api/leads/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lead_id: leadId,
              event_type: "page_view",
              event_data: {
                page: pageName,
                url: typeof window !== "undefined" ? window.location.pathname : "",
                timestamp: new Date().toISOString(),
              },
            }),
          });
        } catch (error) {
          console.error("Failed to track page view:", error);
        }
      }
    };

    // Track immediately on mount
    trackPageView();

    // Also track on route changes (for SPA navigation)
    if (typeof window !== "undefined") {
      window.addEventListener("popstate", trackPageView);
      // For Next.js App Router, we can't easily detect route changes here
      // The page component should call this hook with updated pageName
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("popstate", trackPageView);
      }
    };
  }, [pageName, enabled]);
}

// Helper to set lead_id after capture
export function setLeadId(leadId: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("lead_id", leadId);
  }
}

// Helper to get current lead_id
export function getLeadId(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("lead_id");
  }
  return null;
}
