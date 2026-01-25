"use client";

import { useCommunity } from "@/components/providers/community-provider";
import { HorizontalNavLayout } from "./horizontal-nav-layout";
import { SidebarLayout } from "./sidebar-layout";

interface CommunityLayoutProps {
  children: React.ReactNode;
}

export function CommunityLayout({ children }: CommunityLayoutProps) {
  const { community } = useCommunity();
  const layoutMode = community.settings_json?.layout_mode ?? "horizontal";

  if (layoutMode === "sidebar") {
    return <SidebarLayout>{children}</SidebarLayout>;
  }

  return <HorizontalNavLayout>{children}</HorizontalNavLayout>;
}
