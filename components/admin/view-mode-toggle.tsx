"use client";

import { useCommunity, ViewMode } from "@/components/providers/community-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function ViewModeToggle() {
  const { isAdmin, viewMode, setViewMode, community } = useCommunity();

  // Only show toggle for actual admins
  if (!isAdmin) return null;

  const isMemberView = viewMode === "member";

  return (
    <div className="flex items-center gap-2">
      {isMemberView && (
        <Badge
          variant="outline"
          className="text-xs border-amber-500 text-amber-600 bg-amber-50"
        >
          Viewing as Member
        </Badge>
      )}
      <Button
        variant={isMemberView ? "default" : "outline"}
        size="sm"
        onClick={() => setViewMode(isMemberView ? "admin" : "member")}
        className={cn(
          "gap-2",
          isMemberView && "bg-amber-500 hover:bg-amber-600"
        )}
        style={
          !isMemberView
            ? { borderColor: community.primary_color, color: community.primary_color }
            : undefined
        }
      >
        {isMemberView ? (
          <>
            <EyeOff className="h-4 w-4" />
            Exit Member View
          </>
        ) : (
          <>
            <Eye className="h-4 w-4" />
            View as Member
          </>
        )}
      </Button>
    </div>
  );
}
