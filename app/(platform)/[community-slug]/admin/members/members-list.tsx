"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Crown, Search, Users } from "lucide-react";
import { MemberActions } from "./member-actions";
import { TagFilter } from "@/components/members/tag-filter";
import { TagAssignment } from "@/components/members/tag-assignment";
import { SYSTEM_TAGS, type SystemTag } from "@/lib/system-tags";
import type { MemberTag, ProfileTag } from "@/actions/member-tags";

interface MemberWithTags {
  id: string;
  clerk_user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string;
  tier: string;
  created_at: string;
  membership_tier?: {
    id: string;
    name: string;
    slug: string;
    tier_level: number;
  } | null;
  profile_tags: Array<{
    id: string;
    tag_id: string;
    assigned_at: string;
    assigned_by: string | null;
    tag: MemberTag | null;
  }>;
}

interface MembersListProps {
  members: MemberWithTags[];
  tags: MemberTag[];
  communitySlug: string;
}

export function MembersList({ members, tags, communitySlug }: MembersListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  // Compute system tags for each member
  const membersWithSystemTags = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    return members.map((member) => {
      const systemTags: SystemTag[] = [];
      const createdAt = new Date(member.created_at);
      const daysSinceJoined = Math.floor(
        (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      // New member (joined in last 7 days)
      if (daysSinceJoined <= 7) {
        systemTags.push(SYSTEM_TAGS["new-member"]);
      }

      return {
        ...member,
        systemTags,
      };
    });
  }, [members]);

  // Filter members by search and tags
  const filteredMembers = useMemo(() => {
    return membersWithSystemTags.filter((member) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = member.display_name?.toLowerCase().includes(query);
        if (!matchesName) return false;
      }

      // Tag filter
      if (selectedTagIds.length > 0) {
        const memberTagIds = new Set([
          ...member.profile_tags.map((pt) => pt.tag_id),
          ...member.systemTags.map((st) => st.id),
        ]);
        const hasMatchingTag = selectedTagIds.some((tagId) => memberTagIds.has(tagId));
        if (!hasMatchingTag) return false;
      }

      return true;
    });
  }, [membersWithSystemTags, searchQuery, selectedTagIds]);

  const handleTagsChange = () => {
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <TagFilter
          tags={tags}
          selectedTagIds={selectedTagIds}
          onSelectionChange={setSelectedTagIds}
          includeSystemTags={true}
        />
      </div>

      {/* Results count */}
      {(searchQuery || selectedTagIds.length > 0) && (
        <p className="text-sm text-muted-foreground">
          Showing {filteredMembers.length} of {members.length} members
        </p>
      )}

      {/* Members list */}
      {filteredMembers.length > 0 ? (
        <div className="space-y-2">
          {filteredMembers.map((member) => (
            <Card key={member.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={member.avatar_url || undefined} />
                      <AvatarFallback>
                        {member.display_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">
                          {member.display_name || "User"}
                        </p>
                        {member.role === "ADMIN" && (
                          <Crown className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                        )}
                      </div>

                      {/* Tags */}
                      <div className="mt-1.5">
                        <TagAssignment
                          profileId={member.id}
                          communitySlug={communitySlug}
                          availableTags={tags}
                          assignedTags={member.profile_tags.map((pt) => ({
                            id: pt.id,
                            profile_id: member.id,
                            tag_id: pt.tag_id,
                            assigned_at: pt.assigned_at,
                            assigned_by: pt.assigned_by,
                            tag: pt.tag as MemberTag | undefined,
                          }))}
                          systemTags={member.systemTags}
                          onTagsChange={handleTagsChange}
                          compact
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge
                      variant={member.membership_tier?.tier_level && member.membership_tier.tier_level > 0 ? "default" : "outline"}
                    >
                      {member.membership_tier?.name || (member.tier === "PAID" ? "Pro" : "Free")}
                    </Badge>
                    <MemberActions
                      memberId={member.id}
                      currentRole={member.role}
                      currentTier={member.tier}
                      communitySlug={communitySlug}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            {searchQuery || selectedTagIds.length > 0 ? (
              <>
                <h3 className="text-lg font-semibold mb-2">No matching members</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-2">No members yet</h3>
                <p className="text-muted-foreground">
                  Members will appear here when they join
                </p>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
