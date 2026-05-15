import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, BookOpen, CheckCircle2, ListChecks, Sparkles } from "lucide-react";
import Link from "next/link";
import { PLAYBOOKS } from "@/lib/playbooks/templates";
import { PlaybookCard } from "@/components/playbooks/playbook-card";
import { getAllPlaybookProgress } from "@/actions/playbooks";
import { isFeatureEnabled } from "@/lib/feature-flags";

export default async function PlaybooksPage({
  params,
}: {
  params: Promise<{ "community-slug": string }>;
}) {
  const { userId } = await auth();
  const resolvedParams = await params;
  const communitySlug = resolvedParams["community-slug"];

  if (!userId) {
    redirect("/sign-in");
  }

  const supabase = await createClient();

  // Get community
  const { data: community } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", communitySlug)
    .single();

  if (!community) {
    redirect("/");
  }

  // Check if playbooks are enabled
  const playbooksEnabled = await isFeatureEnabled(community.id, "playbooks_enabled");

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("clerk_user_id", userId)
    .eq("community_id", community.id)
    .single();

  if (profile?.role !== "ADMIN") {
    redirect(`/${communitySlug}`);
  }

  // Get all playbook progress
  const { data: progressList } = await getAllPlaybookProgress(communitySlug);

  // Create a map of playbook ID to completed step IDs
  const progressMap = new Map<string, string[]>();
  for (const progress of progressList) {
    progressMap.set(progress.playbook_id, progress.completed_step_ids);
  }

  const totalSections = PLAYBOOKS.reduce(
    (count, playbook) => count + playbook.sections.length,
    0
  );
  const totalSteps = PLAYBOOKS.reduce(
    (count, playbook) =>
      count +
      playbook.sections.reduce(
        (sectionCount, section) => sectionCount + section.steps.length,
        0
      ),
    0
  );
  const completedSteps = PLAYBOOKS.reduce(
    (count, playbook) => count + (progressMap.get(playbook.id)?.length || 0),
    0
  );
  const completionPercent = totalSteps
    ? Math.round((completedSteps / totalSteps) * 100)
    : 0;

  return (
    <div className="container py-6 max-w-4xl">
      <Link
        href={`/${communitySlug}/admin`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          Playbooks
        </h1>
        <p className="text-muted-foreground mt-1">
          Step-by-step guides to help you build and grow your community
        </p>
      </div>

      {!playbooksEnabled && (
        <Card className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
          <CardContent className="py-4">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Playbooks feature is currently disabled. Contact support to enable it.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionPercent}%</div>
            <p className="text-xs text-muted-foreground">
              {completedSteps} of {totalSteps} steps complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Guides</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{PLAYBOOKS.length}</div>
            <p className="text-xs text-muted-foreground">
              Built-in playbooks ready to follow
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sections</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSections}</div>
            <p className="text-xs text-muted-foreground">
              Milestones across launch, onboarding, and growth
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {PLAYBOOKS.map((playbook) => (
          <PlaybookCard
            key={playbook.id}
            playbook={playbook}
            communitySlug={communitySlug}
            completedStepIds={progressMap.get(playbook.id) || []}
          />
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Custom Playbooks
          </CardTitle>
          <CardDescription>
            Create your own playbooks tailored to your community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Custom playbook builder is coming soon. In the meantime, use the progress
            summary above to spot gaps, then adapt the built-in playbooks for your
            launch, onboarding, and re-engagement plans.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
