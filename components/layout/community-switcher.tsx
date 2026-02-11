"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCommunity } from "@/components/providers/community-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Building2, Plus, Crown, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserCommunity {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  role: "ADMIN" | "PAID_MEMBER" | "FREE_MEMBER";
}

export function CommunitySwitcher({ className }: { className?: string }) {
  const router = useRouter();
  const { community: currentCommunity, profile } = useCommunity();
  const [communities, setCommunities] = useState<UserCommunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCommunities() {
      try {
        const res = await fetch("/api/user/communities");
        if (res.ok) {
          const data = await res.json();
          setCommunities(data.communities || []);
        }
      } catch (error) {
        console.error("Failed to fetch communities:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCommunities();
  }, []);

  const handleSwitch = (slug: string) => {
    if (slug !== currentCommunity.slug) {
      router.push(`/${slug}`);
    }
  };

  // Don't show switcher if user only has one community
  if (loading || communities.length <= 1) {
    return null;
  }

  const getRoleIcon = (role: string) => {
    if (role === "ADMIN") return <Crown className="h-3 w-3 text-yellow-500" />;
    if (role === "PAID_MEMBER") return <Badge variant="secondary" className="text-xs px-1">Pro</Badge>;
    return <Users className="h-3 w-3 text-muted-foreground" />;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn("flex items-center gap-2 h-auto py-2 px-3", className)}
        >
          <Avatar className="h-6 w-6">
            {currentCommunity.logo_url ? (
              <AvatarImage src={currentCommunity.logo_url} alt={currentCommunity.name} />
            ) : null}
            <AvatarFallback className="text-xs">
              {currentCommunity.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium truncate max-w-[150px]">
            {currentCommunity.name}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[250px]">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Your Communities
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {communities.map((community) => (
          <DropdownMenuItem
            key={community.id}
            onClick={() => handleSwitch(community.slug)}
            className={cn(
              "flex items-center gap-3 cursor-pointer",
              community.slug === currentCommunity.slug && "bg-accent"
            )}
          >
            <Avatar className="h-8 w-8">
              {community.logo_url ? (
                <AvatarImage src={community.logo_url} alt={community.name} />
              ) : null}
              <AvatarFallback className="text-xs">
                {community.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{community.name}</p>
            </div>
            {getRoleIcon(community.role)}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => router.push("/communities")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Browse Communities
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
