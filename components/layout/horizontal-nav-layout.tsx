"use client";

import { useState } from "react";
import { HorizontalNavHeader } from "./horizontal-nav-header";
import {
  CommunityInfoSidebar,
  CommunityStats,
} from "./community-info-sidebar";
import { MobileDrawer } from "./mobile-drawer";
import { InviteModal } from "@/components/invite/invite-modal";

interface HorizontalNavLayoutProps {
  children: React.ReactNode;
  stats?: CommunityStats;
}

export function HorizontalNavLayout({
  children,
  stats,
}: HorizontalNavLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Horizontal Nav Header */}
      <HorizontalNavHeader onMobileMenuClick={() => setMobileMenuOpen(true)} />

      {/* Main Content Area */}
      <div className="flex flex-1">
        {/* Main Content */}
        <main className="flex-1 min-w-0 overflow-auto">{children}</main>

        {/* Right Sidebar - Hidden on mobile, visible on lg+ */}
        <aside className="hidden lg:block w-80 flex-shrink-0 border-l bg-muted/30">
          <div className="sticky top-[107px] p-4">
            <CommunityInfoSidebar
              stats={stats}
              onInviteClick={() => setInviteModalOpen(true)}
            />
          </div>
        </aside>
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        stats={stats}
        onInviteClick={() => {
          setMobileMenuOpen(false);
          setInviteModalOpen(true);
        }}
      />

      {/* Invite Modal */}
      <InviteModal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
      />
    </div>
  );
}
