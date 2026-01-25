"use client";

import { createContext, useContext, ReactNode, useState } from "react";
import type { Community, CommunityModule, Profile } from "@/types/database";

export type ViewMode = "admin" | "member";

interface CommunityContextValue {
  community: Community;
  modules: CommunityModule[];
  profile: Profile | null;
  isAdmin: boolean;
  isPaidMember: boolean;
  // View mode for admin preview
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  // Effective permissions based on view mode (use these for UI checks)
  effectiveIsAdmin: boolean;
  effectiveIsPaidMember: boolean;
}

const CommunityContext = createContext<CommunityContextValue | null>(null);

export function CommunityProvider({
  children,
  community,
  modules,
  profile,
}: {
  children: ReactNode;
  community: Community;
  modules: CommunityModule[];
  profile: Profile | null;
}) {
  // For demo purposes, treat all logged-in users as admins
  // This allows demo users to see both admin and member views
  const isAdmin = true; // In production: profile?.role === "ADMIN"
  const isPaidMember = true; // In production: profile?.tier === "PAID" || isAdmin

  // View mode state - only admins can switch views
  const [viewMode, setViewMode] = useState<ViewMode>("admin");

  // Effective permissions based on view mode
  // When viewing as member, admins see the platform as a free member would
  const effectiveIsAdmin = isAdmin && viewMode === "admin";
  const effectiveIsPaidMember = viewMode === "admin" ? isPaidMember : false;

  return (
    <CommunityContext.Provider
      value={{
        community,
        modules,
        profile,
        isAdmin,
        isPaidMember,
        viewMode,
        setViewMode,
        effectiveIsAdmin,
        effectiveIsPaidMember,
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            :root {
              --community-primary: ${community.primary_color};
              --community-accent: ${community.accent_color};
            }
          `,
        }}
      />
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunity() {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error("useCommunity must be used within CommunityProvider");
  }
  return context;
}
