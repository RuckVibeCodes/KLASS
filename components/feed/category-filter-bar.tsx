"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface CategoryFilterBarProps {
  categories: Category[];
  primaryColor?: string;
}

export function CategoryFilterBar({
  categories,
  primaryColor = "#6366f1",
}: CategoryFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");

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
      </div>
    </div>
  );
}
