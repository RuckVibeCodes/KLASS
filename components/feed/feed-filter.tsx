"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Check, SlidersHorizontal, Sparkles, TrendingUp, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type FeedSortOption = "default" | "new" | "top" | "unread";

const sortOptions: { value: FeedSortOption; label: string; icon: typeof SlidersHorizontal }[] = [
  { value: "default", label: "Default", icon: SlidersHorizontal },
  { value: "new", label: "New", icon: Sparkles },
  { value: "top", label: "Top", icon: TrendingUp },
  { value: "unread", label: "Unread", icon: Bell },
];

interface FeedFilterProps {
  currentSort?: FeedSortOption;
}

export function FeedFilter({ currentSort = "default" }: FeedFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSortChange = (sort: FeedSortOption) => {
    const params = new URLSearchParams(searchParams.toString());
    if (sort === "default") {
      params.delete("sort");
    } else {
      params.set("sort", sort);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const currentOption = sortOptions.find((opt) => opt.value === currentSort) || sortOptions[0];
  const CurrentIcon = currentOption.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <CurrentIcon className="h-4 w-4" />
          <span className="sr-only">Sort posts</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {sortOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = currentSort === option.value;
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleSortChange(option.value)}
              className="flex items-center gap-2"
            >
              {isSelected ? (
                <Check className="h-4 w-4" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
              <span>{option.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
