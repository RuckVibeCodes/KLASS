"use client";

import { useRouter } from "next/navigation";
import { TagManager } from "@/components/members/tag-manager";
import type { MemberTag } from "@/actions/member-tags";

interface TagManagerWrapperProps {
  tags: MemberTag[];
  communitySlug: string;
}

export function TagManagerWrapper({ tags, communitySlug }: TagManagerWrapperProps) {
  const router = useRouter();

  const handleTagsChange = () => {
    router.refresh();
  };

  return (
    <TagManager
      tags={tags}
      communitySlug={communitySlug}
      onTagsChange={handleTagsChange}
    />
  );
}
