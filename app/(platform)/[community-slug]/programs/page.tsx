import { createAdminClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Lock, Play, CheckCircle } from "lucide-react";
import Link from "next/link";

export default async function ProgramsPage({
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

  // Get programs with lesson count
  const { data: programs } = await supabase
    .from("programs")
    .select(`
      *,
      lessons(id)
    `)
    .eq("community_id", community.id)
    .eq("published", true)
    .order("order_index");

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Programs</h1>
          <p className="text-muted-foreground">
            Level up your skills with our structured learning paths
          </p>
        </div>
      </div>

      {programs && programs.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              communitySlug={resolvedParams["community-slug"]}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No programs yet</h3>
            <p className="text-muted-foreground">
              Check back soon for new learning content!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ProgramCard({
  program,
  communitySlug,
}: {
  program: any;
  communitySlug: string;
}) {
  const lessonCount = program.lessons?.length || 0;
  const isPaid = program.visibility === "paid";

  return (
    <Card className="group overflow-hidden">
      {/* Thumbnail */}
      <div className="aspect-video bg-muted relative">
        {program.thumbnail_url ? (
          <img
            src={program.thumbnail_url}
            alt={program.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        {isPaid && (
          <Badge className="absolute top-3 right-3" variant="secondary">
            <Lock className="h-3 w-3 mr-1" />
            Pro
          </Badge>
        )}
      </div>

      <CardHeader>
        <CardTitle className="line-clamp-2">{program.title}</CardTitle>
        {program.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {program.description}
          </p>
        )}
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <span>{lessonCount} lessons</span>
        </div>

        <Link href={`/${communitySlug}/programs/${program.id}`}>
          <Button className="w-full">
            <Play className="h-4 w-4 mr-2" />
            Start Program
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
