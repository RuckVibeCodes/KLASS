import { createClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Lock, Eye, EyeOff, DollarSign } from "lucide-react";
import Link from "next/link";
import { ProgramActions } from "./program-actions";
import { CreateProgramButton } from "./create-program-button";
import { formatPrice } from "@/lib/access";

export default async function AdminProgramsPage({
  params,
}: {
  params: Promise<{ "community-slug": string }>;
}) {
  const { userId } = await auth();
  const resolvedParams = await params;
  const communitySlug = resolvedParams["community-slug"];
  const supabase = await createClient();

  // Get community
  const { data: community } = await supabase
    .from("communities")
    .select("*")
    .eq("slug", communitySlug)
    .single();

  if (!community) redirect("/");

  // For demo purposes, allow all logged-in users to access admin pages
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("clerk_user_id", userId)
    .eq("community_id", community.id)
    .single();

  // Get programs with lesson count
  const { data: programs } = await supabase
    .from("programs")
    .select(`
      *,
      lessons(id)
    `)
    .eq("community_id", community.id)
    .order("order_index");

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
          <h1 className="text-2xl font-bold">Programs</h1>
          <p className="text-muted-foreground">
            {programs?.length || 0} programs
          </p>
        </div>
        <CreateProgramButton communitySlug={communitySlug} />
      </div>

      {programs && programs.length > 0 ? (
        <div className="space-y-2">
          {programs.map((program) => (
            <Card key={program.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-24 rounded bg-muted flex items-center justify-center flex-shrink-0">
                      {program.thumbnail_url ? (
                        <img
                          src={program.thumbnail_url}
                          alt={program.title}
                          className="h-full w-full object-cover rounded"
                        />
                      ) : (
                        <BookOpen className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{program.title}</p>
                        {program.visibility === "paid" && (
                          <Badge variant="secondary">
                            <Lock className="h-3 w-3 mr-1" />
                            Pro
                          </Badge>
                        )}
                        {(program.price_cents || 0) > 0 && (
                          <Badge variant="outline">
                            <DollarSign className="h-3 w-3 mr-1" />
                            {formatPrice(program.price_cents)}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {program.lessons?.length || 0} lessons
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={program.published ? "default" : "outline"}>
                      {program.published ? (
                        <>
                          <Eye className="h-3 w-3 mr-1" />
                          Published
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3 mr-1" />
                          Draft
                        </>
                      )}
                    </Badge>
                    <ProgramActions
                      program={program}
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
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No programs yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first program to start sharing content
            </p>
            <CreateProgramButton communitySlug={communitySlug} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
