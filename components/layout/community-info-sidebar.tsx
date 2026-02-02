"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Circle, UserPlus, Settings, UsersRound } from "lucide-react";
import { useCommunity } from "@/components/providers/community-provider";

export interface CommunityStats {
  totalMembers: number;
  onlineCount: number;
  adminCount: number;
}

interface CommunityInfoSidebarProps {
  stats?: CommunityStats;
  onInviteClick?: () => void;
}

export function CommunityInfoSidebar({
  stats,
  onInviteClick,
}: CommunityInfoSidebarProps) {
  const { community, effectiveIsAdmin } = useCommunity();

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Community Banner Image */}
        {community.settings_json?.banner_image_url ? (
          <div className="relative">
            <img
              src={community.settings_json.banner_image_url}
              alt={community.name}
              className="w-full h-32 object-cover"
            />
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
              <Avatar className="h-16 w-16 border-4 border-background shadow-md">
                <AvatarImage src={community.logo_url || undefined} />
                <AvatarFallback
                  className="text-2xl font-bold text-white"
                  style={{ backgroundColor: community.primary_color }}
                >
                  {community.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        ) : (
          <div
            className="h-20 flex items-center justify-center"
            style={{ backgroundColor: `${community.primary_color}15` }}
          >
            <Avatar className="h-16 w-16 border-4 border-background shadow-md">
              <AvatarImage src={community.logo_url || undefined} />
              <AvatarFallback
                className="text-2xl font-bold text-white"
                style={{ backgroundColor: community.primary_color }}
              >
                {community.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
        )}

        <div className={`p-4 space-y-4 ${community.settings_json?.banner_image_url ? "pt-10" : ""}`}>
          {/* Community Name & Description */}
          <div className="text-center">
            <h2 className="font-semibold text-lg">{community.name}</h2>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
              {community.settings_json?.banner_description || community.description || "Welcome to our community!"}
            </p>
          </div>

          <Separator />

          {/* Member Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-xl font-bold">{stats?.totalMembers ?? 0}</div>
              <div className="text-xs text-muted-foreground">Members</div>
            </div>
            <div>
              <div className="text-xl font-bold flex items-center justify-center gap-1">
                <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                {stats?.onlineCount ?? 0}
              </div>
              <div className="text-xs text-muted-foreground">Online</div>
            </div>
            <div>
              <div className="text-xl font-bold">{stats?.adminCount ?? 0}</div>
              <div className="text-xs text-muted-foreground">Admins</div>
            </div>
          </div>

          <Separator />

          {/* Invite Button */}
          <Button
            className="w-full text-white"
            style={{ backgroundColor: community.primary_color }}
            onClick={onInviteClick}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Invite People
          </Button>

          {/* Admin Quick Links - hidden when viewing as member */}
          {effectiveIsAdmin && (
            <>
              <Separator />
              <div className="space-y-1">
                <Link
                  href={`/${community.slug}/admin`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground py-1.5 px-2 rounded-md hover:bg-muted transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Admin Dashboard
                </Link>
                <Link
                  href={`/${community.slug}/admin/members`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground py-1.5 px-2 rounded-md hover:bg-muted transition-colors"
                >
                  <UsersRound className="h-4 w-4" />
                  Manage Members
                </Link>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
