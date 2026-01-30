import { createAdminClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Crown, Settings2, Users } from "lucide-react";
import Link from "next/link";
import { MemberActions } from "./member-actions";
import { MembersList } from "./members-list";
import { TagManagerWrapper } from "./tag-manager-wrapper";
import type { MemberTag, ProfileTag } from "@/actions/member-tags";

export default async function AdminMembersPage({
  params,
}: {
  params: Promise<{ "community-slug": string }>;
}) {
  const { userId } = await auth();
  const resolvedParams = await params;
  const communitySlug = resolvedParams["community-slug"];
  const supabase = await createAdminClient();

  // Get community
  const { data: community } = await supabase
    .from("communities")
    .select("*")
    .eq("slug", communitySlug)
    .single();

  if (!community) redirect("/");

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("clerk_user_id", userId)
    .eq("community_id", community.id)
    .single();

  if (profile?.role !== "ADMIN") {
    redirect(`/${communitySlug}`);
  }

  // Get all members with their tags and tier info
  const { data: members } = await supabase
    .from("profiles")
    .select(`
      *,
      membership_tier:membership_tiers(id, name, slug, tier_level),
      profile_tags(
        id,
        tag_id,
        assigned_at,
        assigned_by,
        tag:member_tags(*)
      )
    `)
    .eq("community_id", community.id)
    .order("created_at", { ascending: false });

  // Get all tags for the community
  const { data: tags } = await supabase
    .from("member_tags")
    .select("*")
    .eq("community_id", community.id)
    .order("name");

  return (
    <div className="container py-6">
      <Link
        href={`/${communitySlug}/admin`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Members</h1>
          <p className="text-muted-foreground">
            {members?.length || 0} total members
          </p>
        </div>
      </div>

      <Tabs defaultValue="members" className="space-y-6">
        <TabsList>
          <TabsTrigger value="members" className="gap-2">
            <Users className="h-4 w-4" />
            Members
          </TabsTrigger>
          <TabsTrigger value="tags" className="gap-2">
            <Settings2 className="h-4 w-4" />
            Manage Tags
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <MembersList
            members={members || []}
            tags={(tags as MemberTag[]) || []}
            communitySlug={communitySlug}
          />
        </TabsContent>

        <TabsContent value="tags">
          <Card>
            <CardContent className="pt-6">
              <TagManagerWrapper
                tags={(tags as MemberTag[]) || []}
                communitySlug={communitySlug}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
