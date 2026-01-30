import { createAdminClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Crown, Users, Search } from "lucide-react";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ "community-slug": string }>;
}) {
  const resolvedParams = await params;
  const supabase = await createAdminClient();

  // Get community
  const { data: community } = await supabase
    .from("communities")
    .select("*")
    .eq("slug", resolvedParams["community-slug"])
    .single();

  if (!community) return null;

  // Get members
  const { data: members } = await supabase
    .from("profiles")
    .select("*")
    .eq("community_id", community.id)
    .order("created_at", { ascending: true });

  // Count by role
  const adminCount = members?.filter((m) => m.role === "ADMIN").length || 0;
  const paidCount = members?.filter((m) => m.tier === "PAID").length || 0;
  const totalCount = members?.length || 0;

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Members</h1>
          <p className="text-muted-foreground">
            {totalCount} member{totalCount !== 1 ? "s" : ""} in this community
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalCount}</p>
              <p className="text-sm text-muted-foreground">Total Members</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <Crown className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{adminCount}</p>
              <p className="text-sm text-muted-foreground">Admins</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <Badge className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{paidCount}</p>
              <p className="text-sm text-muted-foreground">Pro Members</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search members..." className="pl-9" />
      </div>

      {/* Members Grid */}
      {members && members.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No members yet</h3>
            <p className="text-muted-foreground">
              Be the first to join!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MemberCard({ member }: { member: any }) {
  const isAdmin = member.role === "ADMIN";
  const isPaid = member.tier === "PAID";

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={member.avatar_url || undefined} />
            <AvatarFallback>
              {member.display_name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium truncate">
                {member.display_name || "User"}
              </p>
              {isAdmin && (
                <Crown className="h-4 w-4 text-yellow-500 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {isAdmin ? (
                <Badge variant="default" className="text-xs">
                  Admin
                </Badge>
              ) : isPaid ? (
                <Badge variant="secondary" className="text-xs">
                  Pro
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  Free
                </Badge>
              )}
            </div>
          </div>
        </div>
        {member.bio && (
          <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
            {member.bio}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
