"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, MessageSquare, BookOpen, Calendar, Users, Info, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useCommunity } from "@/components/providers/community-provider";
import {
  CommunityInfoSidebar,
  CommunityStats,
} from "./community-info-sidebar";

const navItems = [
  { key: "community", label: "Community", icon: MessageSquare, path: "" },
  { key: "programs", label: "Classroom", icon: BookOpen, path: "/programs" },
  { key: "events", label: "Calendar", icon: Calendar, path: "/events" },
  { key: "members", label: "Members", icon: Users, path: "/members" },
  { key: "about", label: "About", icon: Info, path: "/about" },
];

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  stats?: CommunityStats;
  onInviteClick?: () => void;
}

export function MobileDrawer({
  open,
  onClose,
  stats,
  onInviteClick,
}: MobileDrawerProps) {
  const pathname = usePathname();
  const { community, modules, isAdmin } = useCommunity();
  const baseUrl = `/${community.slug}`;

  const isModuleEnabled = (key: string) => {
    if (key === "community") return true;
    if (key === "about") return community.settings_json?.show_about_page ?? true;
    const module = modules.find((m) => m.key === key);
    return module?.enabled ?? false;
  };

  const getLabel = (key: string, defaultLabel: string) => {
    const module = modules.find((m) => m.key === key);
    return module?.label || defaultLabel;
  };

  const isActiveTab = (itemPath: string) => {
    const fullPath = itemPath ? `${baseUrl}${itemPath}` : baseUrl;
    if (itemPath === "") {
      return pathname === baseUrl || pathname === `${baseUrl}/`;
    }
    return pathname.startsWith(fullPath);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] bg-background shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <Link
            href={baseUrl}
            className="flex items-center gap-2"
            onClick={onClose}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={community.logo_url || undefined} />
              <AvatarFallback
                className="text-white text-sm font-semibold"
                style={{ backgroundColor: community.primary_color }}
              >
                {community.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="font-semibold truncate">{community.name}</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close menu</span>
          </Button>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            if (!isModuleEnabled(item.key)) return null;

            const href = item.path ? `${baseUrl}${item.path}` : baseUrl;
            const isActive = isActiveTab(item.path);
            const Icon = item.icon;

            return (
              <Link
                key={item.key}
                href={href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-muted"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                style={isActive ? { color: community.primary_color } : undefined}
              >
                <Icon className="h-5 w-5" />
                {getLabel(item.key, item.label)}
              </Link>
            );
          })}

          {/* Admin Link */}
          {isAdmin && (
            <>
              <Separator className="my-2" />
              <Link
                href={`${baseUrl}/admin`}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                  pathname.startsWith(`${baseUrl}/admin`)
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Settings className="h-5 w-5" />
                Admin Dashboard
              </Link>
            </>
          )}
        </nav>

        {/* Community Info at Bottom */}
        <div className="mt-auto p-4 border-t">
          <CommunityInfoSidebar stats={stats} onInviteClick={onInviteClick} />
        </div>
      </div>
    </div>
  );
}
