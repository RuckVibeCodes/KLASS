"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  Menu,
  Bell,
  Search,
  MessageSquare,
  MessageCircle,
  BookOpen,
  Calendar,
  Users,
  Info,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useCommunity } from "@/components/providers/community-provider";
import { ViewModeToggle } from "@/components/admin/view-mode-toggle";
import { CommunitySwitcher } from "./community-switcher";

const navItems = [
  { key: "community", label: "Community", icon: MessageSquare, path: "" },
  { key: "programs", label: "Classroom", icon: BookOpen, path: "/programs" },
  { key: "events", label: "Calendar", icon: Calendar, path: "/events" },
  { key: "members", label: "Members", icon: Users, path: "/members" },
  { key: "chat", label: "Chat", icon: MessageCircle, path: "/chat" },
  { key: "about", label: "About", icon: Info, path: "/about" },
];

interface HorizontalNavHeaderProps {
  onMobileMenuClick: () => void;
}

export function HorizontalNavHeader({
  onMobileMenuClick,
}: HorizontalNavHeaderProps) {
  const pathname = usePathname();
  const { community, modules, isAdmin, effectiveIsAdmin } = useCommunity();
  const baseUrl = `/${community.slug}`;

  const isModuleEnabled = (key: string) => {
    if (key === "community") return true;
    if (key === "about") return community.settings_json?.show_about_page ?? true;
    if (key === "chat") return community.settings_json?.chat_settings?.enabled ?? false;
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
      // Community tab is active only on exact match or feed
      return pathname === baseUrl || pathname === `${baseUrl}/`;
    }
    return pathname.startsWith(fullPath);
  };

  return (
    <header className="sticky top-0 z-40 bg-background border-b">
      {/* Top Row: Logo, Search, Actions */}
      <div className="flex items-center gap-4 px-4 h-14">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMobileMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        {/* Community Switcher / Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <CommunitySwitcher />
          {/* Fallback: Show static logo if switcher doesn't render (single community) */}
          <Link href={baseUrl} className="flex items-center gap-2 [.community-switcher+&]:hidden">
            <Avatar className="h-8 w-8">
              <AvatarImage src={community.logo_url || undefined} />
              <AvatarFallback
                className="text-white text-sm font-semibold"
                style={{ backgroundColor: community.primary_color }}
              >
                {community.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="font-semibold hidden sm:inline truncate max-w-[200px]">
              {community.name}
            </span>
          </Link>
        </div>

        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-9 h-9 bg-muted/50" />
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1 md:hidden" />

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* View Mode Toggle - Only visible to admins */}
          <div className="hidden md:block">
            <ViewModeToggle />
          </div>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-8 w-8",
              },
            }}
          />
        </div>
      </div>

      {/* Navigation Tabs Row */}
      <nav className="flex items-center gap-1 px-4 h-11 overflow-x-auto scrollbar-hide">
        {navItems.map((item) => {
          if (!isModuleEnabled(item.key)) return null;

          const href = item.path ? `${baseUrl}${item.path}` : baseUrl;
          const isActive = isActiveTab(item.path);
          const Icon = item.icon;

          return (
            <Link
              key={item.key}
              href={href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap",
                isActive
                  ? "bg-muted"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              style={isActive ? { color: community.primary_color } : undefined}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">
                {getLabel(item.key, item.label)}
              </span>
            </Link>
          );
        })}

        {/* Admin Link - hidden when viewing as member */}
        {effectiveIsAdmin && (
          <Link
            href={`${baseUrl}/admin`}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ml-auto",
              pathname.startsWith(`${baseUrl}/admin`)
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Admin</span>
          </Link>
        )}
      </nav>

      {/* Active Tab Indicator Line */}
      <div
        className="h-0.5"
        style={{ backgroundColor: community.primary_color }}
      />
    </header>
  );
}
