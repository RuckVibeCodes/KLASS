"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Settings2,
  Plus,
  Loader2,
  Hash,
} from "lucide-react";
import Link from "next/link";
import { createCategory } from "@/actions/categories";

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface CategoryFilterBarProps {
  categories: Category[];
  primaryColor?: string;
  isAdmin?: boolean;
  communitySlug?: string;
}

const QUICK_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f97316",
  "#22c55e", "#14b8a6", "#3b82f6",
];

export function CategoryFilterBar({
  categories,
  primaryColor = "#6366f1",
  isAdmin = false,
  communitySlug,
}: CategoryFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");

  const [isPending, startTransition] = useTransition();
  const [showAddPopover, setShowAddPopover] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicColor, setNewTopicColor] = useState("#6366f1");

  const handleCategoryClick = (slug: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("category", slug);
    } else {
      params.delete("category");
    }
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  const handleQuickAdd = () => {
    if (!newTopicName.trim() || !communitySlug) return;

    startTransition(async () => {
      const result = await createCategory(communitySlug, {
        name: newTopicName.trim(),
        color: newTopicColor,
      });

      if (result.error) {
        // Could add toast here
        console.error(result.error);
        return;
      }

      setNewTopicName("");
      setNewTopicColor("#6366f1");
      setShowAddPopover(false);
      router.refresh();
    });
  };

  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      <div className="flex items-center gap-2 pb-2">
        {/* All Button */}
        <button
          onClick={() => handleCategoryClick(null)}
          className={cn(
            "inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
            !activeCategory
              ? "text-white shadow-sm"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
          style={!activeCategory ? { backgroundColor: primaryColor } : undefined}
        >
          All
        </button>

        {/* Category Pills */}
        {categories.map((category) => {
          const isActive = activeCategory === category.slug;
          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.slug)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                isActive ? "text-white shadow-sm" : "hover:opacity-80"
              )}
              style={{
                backgroundColor: isActive ? category.color : `${category.color}20`,
                color: isActive ? "white" : category.color,
              }}
            >
              <span
                className={cn(
                  "w-2 h-2 rounded-full",
                  isActive && "bg-white/30"
                )}
                style={{
                  backgroundColor: isActive ? "rgba(255,255,255,0.3)" : category.color,
                }}
              />
              {category.name}
            </button>
          );
        })}

        {/* Admin: Quick Add Topic */}
        {isAdmin && communitySlug && (
          <Popover open={showAddPopover} onOpenChange={setShowAddPopover}>
            <PopoverTrigger asChild>
              <button
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap border border-dashed border-muted-foreground/30 text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Add Topic</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72" align="start">
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="topic-name" className="text-sm">Topic Name</Label>
                  <Input
                    id="topic-name"
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                    placeholder="e.g., Introductions"
                    className="h-8"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleQuickAdd();
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">Color</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewTopicColor(color)}
                        className={cn(
                          "h-6 w-6 rounded-full transition-transform hover:scale-110",
                          newTopicColor === color && "ring-2 ring-offset-1 ring-primary"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                {/* Preview */}
                {newTopicName && (
                  <div className="pt-1">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${newTopicColor}20`,
                        color: newTopicColor,
                      }}
                    >
                      <Hash className="h-3 w-3" />
                      {newTopicName}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1">
                  <Link
                    href={`/${communitySlug}/admin/settings?tab=feed`}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Settings2 className="h-3 w-3 inline mr-1" />
                    All settings
                  </Link>
                  <Button
                    size="sm"
                    onClick={handleQuickAdd}
                    disabled={isPending || !newTopicName.trim()}
                    className="h-7 text-xs"
                  >
                    {isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      "Create"
                    )}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Admin: Settings Link (only show if no add popover visible and topics exist) */}
        {isAdmin && communitySlug && categories.length > 0 && (
          <Link
            href={`/${communitySlug}/admin/settings?tab=feed`}
            className="inline-flex items-center justify-center h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Manage Topics"
          >
            <Settings2 className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
