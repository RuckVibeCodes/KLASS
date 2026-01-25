"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TagBadge } from "./tag-badge";
import { Filter, X } from "lucide-react";
import { SYSTEM_TAGS, SystemTag } from "@/lib/system-tags";
import type { MemberTag } from "@/actions/member-tags";

interface TagFilterProps {
  tags: MemberTag[];
  selectedTagIds: string[];
  onSelectionChange: (tagIds: string[]) => void;
  includeSystemTags?: boolean;
}

export function TagFilter({
  tags,
  selectedTagIds,
  onSelectionChange,
  includeSystemTags = true,
}: TagFilterProps) {
  const [open, setOpen] = useState(false);

  const systemTagList = includeSystemTags ? Object.values(SYSTEM_TAGS) : [];
  const allTags = [
    ...tags.map((t) => ({ ...t, isSystem: false })),
    ...systemTagList.map((t) => ({ ...t, isSystem: true })),
  ];

  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onSelectionChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onSelectionChange([...selectedTagIds, tagId]);
    }
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  const hasSelection = selectedTagIds.length > 0;

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter by Tags
            {hasSelection && (
              <span className="ml-1 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                {selectedTagIds.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {tags.length > 0 && (
            <>
              <DropdownMenuLabel>Custom Tags</DropdownMenuLabel>
              {tags.map((tag) => (
                <DropdownMenuCheckboxItem
                  key={tag.id}
                  checked={selectedTagIds.includes(tag.id)}
                  onCheckedChange={() => toggleTag(tag.id)}
                >
                  <span
                    className="mr-2 h-2 w-2 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name}
                </DropdownMenuCheckboxItem>
              ))}
            </>
          )}

          {includeSystemTags && systemTagList.length > 0 && (
            <>
              {tags.length > 0 && <DropdownMenuSeparator />}
              <DropdownMenuLabel>System Tags</DropdownMenuLabel>
              {systemTagList.map((tag) => (
                <DropdownMenuCheckboxItem
                  key={tag.id}
                  checked={selectedTagIds.includes(tag.id)}
                  onCheckedChange={() => toggleTag(tag.id)}
                >
                  <span
                    className="mr-2 h-2 w-2 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name}
                </DropdownMenuCheckboxItem>
              ))}
            </>
          )}

          {hasSelection && (
            <>
              <DropdownMenuSeparator />
              <div className="p-2">
                <Button variant="ghost" size="sm" onClick={clearAll} className="w-full">
                  Clear all filters
                </Button>
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Show selected tags as badges */}
      {hasSelection && (
        <div className="flex flex-wrap gap-1">
          {selectedTagIds.map((tagId) => {
            const tag = allTags.find((t) => t.id === tagId);
            if (!tag) return null;
            return (
              <TagBadge
                key={tagId}
                name={tag.name}
                color={tag.color}
                isSystem={tag.isSystem}
                onRemove={() => toggleTag(tagId)}
                size="sm"
              />
            );
          })}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="h-6 px-2 text-xs text-muted-foreground"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </div>
      )}
    </div>
  );
}
