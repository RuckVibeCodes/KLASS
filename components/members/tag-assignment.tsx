"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Loader2, Plus, Tag } from "lucide-react";
import { TagBadge, TagBadgeList } from "./tag-badge";
import { assignTag, removeTag, type MemberTag, type ProfileTag } from "@/actions/member-tags";
import type { SystemTag } from "@/lib/system-tags";

interface TagAssignmentProps {
  profileId: string;
  communitySlug: string;
  availableTags: MemberTag[];
  assignedTags: ProfileTag[];
  systemTags?: SystemTag[];
  onTagsChange?: () => void;
  compact?: boolean;
}

export function TagAssignment({
  profileId,
  communitySlug,
  availableTags,
  assignedTags,
  systemTags = [],
  onTagsChange,
  compact = false,
}: TagAssignmentProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const assignedTagIds = new Set(assignedTags.map((pt) => pt.tag_id));
  const unassignedTags = availableTags.filter((t) => !assignedTagIds.has(t.id));

  const handleAssign = async (tagId: string) => {
    setLoading(tagId);
    const result = await assignTag(profileId, tagId, communitySlug);
    setLoading(null);

    if (result.error) {
      alert(result.error);
      return;
    }

    onTagsChange?.();
  };

  const handleRemove = async (tagId: string) => {
    setLoading(tagId);
    const result = await removeTag(profileId, tagId, communitySlug);
    setLoading(null);

    if (result.error) {
      alert(result.error);
      return;
    }

    onTagsChange?.();
  };

  // Combine assigned and system tags for display
  const displayTags = [
    ...assignedTags.map((pt) => ({
      id: pt.tag_id,
      name: pt.tag?.name || "Unknown",
      color: pt.tag?.color || "#6366f1",
      isSystem: false,
    })),
    ...systemTags.map((st) => ({
      id: st.id,
      name: st.name,
      color: st.color,
      isSystem: true,
    })),
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <TagBadgeList
          tags={displayTags}
          maxVisible={2}
          onRemove={(tagId) => {
            const tag = displayTags.find((t) => t.id === tagId);
            if (tag && !tag.isSystem) {
              handleRemove(tagId);
            }
          }}
        />
        {unassignedTags.length > 0 && (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Plus className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-48 p-2">
              <div className="space-y-1">
                {unassignedTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleAssign(tag.id)}
                    disabled={loading === tag.id}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent transition-colors text-left"
                  >
                    {loading === tag.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                    )}
                    <span className="text-sm">{tag.name}</span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Display assigned tags */}
      {displayTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {displayTags.map((tag) => (
            <TagBadge
              key={tag.id}
              name={tag.name}
              color={tag.color}
              isSystem={tag.isSystem}
              onRemove={
                !tag.isSystem
                  ? () => handleRemove(tag.id)
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {/* Add tag popover */}
      {unassignedTags.length > 0 && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <Tag className="h-3 w-3" />
              Add Tag
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-56 p-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground px-2 pb-1">
                Available tags
              </p>
              {unassignedTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleAssign(tag.id)}
                  disabled={loading === tag.id}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent transition-colors text-left"
                >
                  {loading === tag.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <TagBadge name={tag.name} color={tag.color} size="sm" />
                  )}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {displayTags.length === 0 && unassignedTags.length === 0 && (
        <p className="text-sm text-muted-foreground">No tags available</p>
      )}
    </div>
  );
}
