"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface TagBadgeProps {
  name: string;
  color: string;
  isSystem?: boolean;
  onRemove?: () => void;
  size?: "sm" | "md";
  className?: string;
}

export function TagBadge({
  name,
  color,
  isSystem = false,
  onRemove,
  size = "sm",
  className,
}: TagBadgeProps) {
  // Convert hex color to rgba for background
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        isSystem && "border border-dashed",
        className
      )}
      style={{
        backgroundColor: hexToRgba(color, 0.15),
        color: color,
        borderColor: isSystem ? hexToRgba(color, 0.4) : undefined,
      }}
    >
      {name}
      {onRemove && !isSystem && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 hover:opacity-70 transition-opacity"
          aria-label={`Remove ${name} tag`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}

interface TagBadgeListProps {
  tags: Array<{
    id: string;
    name: string;
    color: string;
    isSystem?: boolean;
  }>;
  onRemove?: (tagId: string) => void;
  maxVisible?: number;
  size?: "sm" | "md";
  className?: string;
}

export function TagBadgeList({
  tags,
  onRemove,
  maxVisible,
  size = "sm",
  className,
}: TagBadgeListProps) {
  const visibleTags = maxVisible ? tags.slice(0, maxVisible) : tags;
  const hiddenCount = maxVisible ? Math.max(0, tags.length - maxVisible) : 0;

  if (tags.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {visibleTags.map((tag) => (
        <TagBadge
          key={tag.id}
          name={tag.name}
          color={tag.color}
          isSystem={tag.isSystem}
          size={size}
          onRemove={onRemove && !tag.isSystem ? () => onRemove(tag.id) : undefined}
        />
      ))}
      {hiddenCount > 0 && (
        <span
          className={cn(
            "inline-flex items-center rounded-full bg-muted text-muted-foreground",
            size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm"
          )}
        >
          +{hiddenCount} more
        </span>
      )}
    </div>
  );
}
