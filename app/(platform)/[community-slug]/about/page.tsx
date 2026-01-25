import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Users, Crown, Calendar, Info } from "lucide-react";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ "community-slug": string }>;
}) {
  const resolvedParams = await params;
  const communitySlug = resolvedParams["community-slug"];
  const supabase = await createClient();

  // Get community
  const { data: community } = await supabase
    .from("communities")
    .select("*")
    .eq("slug", communitySlug)
    .single();

  if (!community) return null;

  // Get community stats
  const { data: members } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, role, created_at")
    .eq("community_id", community.id)
    .order("created_at", { ascending: true });

  const admins = members?.filter((m) => m.role === "ADMIN") || [];
  const totalMembers = members?.length || 0;

  // Format creation date
  const createdDate = new Date(community.created_at).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <div className="container max-w-3xl py-6 space-y-6">
      {/* Community Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={community.logo_url || undefined} />
              <AvatarFallback
                className="text-3xl font-bold text-white"
                style={{ backgroundColor: community.primary_color }}
              >
                {community.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-2xl font-bold">{community.name}</h1>
            {community.description && (
              <p className="text-muted-foreground mt-2 max-w-lg">
                {community.description}
              </p>
            )}

            {/* Stats Row */}
            <div className="flex items-center gap-6 mt-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="font-semibold">{totalMembers}</span>
                <span className="text-muted-foreground">members</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Created {createdDate}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admins */}
      {admins.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Community Admins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {admins.map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={admin.avatar_url || undefined} />
                    <AvatarFallback>
                      {admin.display_name?.charAt(0) || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {admin.display_name || "Admin"}
                    </p>
                    <Badge variant="secondary" className="mt-1">
                      <Crown className="h-3 w-3 mr-1" />
                      Admin
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Community Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            About This Community
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {community.description ||
              `Welcome to ${community.name}! This is a place to connect, learn, and grow together.`}
          </p>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2 text-sm">
            <div>
              <p className="text-muted-foreground">Community Slug</p>
              <p className="font-medium">{community.slug}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Created</p>
              <p className="font-medium">{createdDate}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
