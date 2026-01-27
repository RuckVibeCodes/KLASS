"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  MessageCircle,
  BookOpen,
  FolderOpen,
  Calendar,
  Users,
  Settings,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCommunity } from "@/components/providers/community-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeToggle } from "@/components/theme-toggle";

const defaultModules = [
  { key: "programs", label: "Programs", icon: BookOpen },
  { key: "resources", label: "Resources", icon: FolderOpen },
  { key: "events", label: "Events", icon: Calendar },
  { key: "members", label: "Members", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
  const { community, modules, profile, isAdmin, effectiveIsAdmin } = useCommunity();

  // Get module labels from database or use defaults
  const getModuleLabel = (key: string, defaultLabel: string) => {
    const module = modules.find((m) => m.key === key);
    return module?.label || defaultLabel;
  };

  // Check if module is enabled
  const isModuleEnabled = (key: string) => {
    const module = modules.find((m) => m.key === key);
    return module?.enabled ?? true;
  };

  const baseUrl = `/${community.slug}`;

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      {/* Community Header */}
      <div className="flex items-center gap-3 border-b p-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={community.logo_url || undefined} alt={community.name} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {community.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold truncate">{community.name}</h2>
          {profile && (
            <div className="flex items-center gap-1">
              {isAdmin ? (
                <Badge variant="default" className="text-xs">
                  <Crown className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              ) : profile.tier === "PAID" ? (
                <Badge variant="secondary" className="text-xs">
                  Pro
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  Free
                </Badge>
              )}
            </div>
          )}
        </div>
        <ThemeToggle />
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 p-2">
        <nav className="space-y-1">
          {/* Community Feed (Home) */}
          <NavItem
            href={baseUrl}
            icon={MessageSquare}
            label="Community"
            active={pathname === baseUrl}
          />

          {/* Dynamic Modules */}
          {defaultModules.map((module) => {
            if (!isModuleEnabled(module.key)) return null;

            const href = `${baseUrl}/${module.key}`;
            const isActive =
              pathname === href || pathname.startsWith(`${href}/`);

            return (
              <NavItem
                key={module.key}
                href={href}
                icon={module.icon}
                label={getModuleLabel(module.key, module.label)}
                active={isActive}
              />
            );
          })}

          {/* Chat Module - conditionally shown based on settings */}
          {community.settings_json?.chat_settings?.enabled && (
            <NavItem
              href={`${baseUrl}/chat`}
              icon={MessageCircle}
              label="Chat"
              active={pathname === `${baseUrl}/chat`}
            />
          )}
        </nav>

        {/* Admin Section - hidden when viewing as member */}
        {effectiveIsAdmin && (
          <>
            <div className="my-4 border-t" />
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase">
              Admin
            </div>
            <nav className="space-y-1">
              <NavItem
                href={`${baseUrl}/admin`}
                icon={Settings}
                label="Dashboard"
                active={pathname.startsWith(`${baseUrl}/admin`)}
              />
            </nav>
          </>
        )}
      </ScrollArea>

      {/* User Profile */}
      {profile && (
        <div className="border-t p-4">
          <Link
            href={`${baseUrl}/settings`}
            className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent transition-colors"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback>
                {profile.display_name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {profile.display_name || "User"}
              </p>
              <p className="text-xs text-muted-foreground">Settings</p>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        active
          ? "bg-accent text-accent-foreground font-medium"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
