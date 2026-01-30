import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RotateCcw, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { getPlaybook, getTotalSteps, getAllStepIds } from "@/lib/playbooks/templates";
import { PlaybookSteps } from "@/components/playbooks/playbook-steps";
import { getPlaybookProgress } from "@/actions/playbooks";
import { ResetPlaybookButton } from "./reset-button";

export default async function PlaybookDetailPage({
  params,
}: {
  params: Promise<{ "community-slug": string; id: string }>;
}) {
  const { userId } = await auth();
  const resolvedParams = await params;
  const communitySlug = resolvedParams["community-slug"];
  const playbookId = resolvedParams.id;

  if (!userId) {
    redirect("/sign-in");
  }

  // Get the playbook template
  const playbook = getPlaybook(playbookId);
  if (!playbook) {
    notFound();
  }

  const supabase = await createAdminClient();

  // Get community
  const { data: community } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", communitySlug)
    .single();

  if (!community) {
    redirect("/");
  }

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

  // Get progress
  const { data: progress } = await getPlaybookProgress(communitySlug, playbookId);
  const completedStepIds = progress?.completed_step_ids || [];

  const totalSteps = getTotalSteps(playbook);
  const completedCount = completedStepIds.length;
  const progressPercent = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;
  const isComplete = completedCount === totalSteps && totalSteps > 0;

  return (
    <div className="container py-6 max-w-3xl">
      <Link
        href={`/${communitySlug}/admin/playbooks`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Playbooks
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div className="flex items-start gap-4">
          <div className="text-4xl">{playbook.icon}</div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{playbook.title}</h1>
              {isComplete && (
                <Badge variant="default" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Complete
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">{playbook.description}</p>
          </div>
        </div>

        {completedCount > 0 && (
          <ResetPlaybookButton
            communitySlug={communitySlug}
            playbookId={playbookId}
          />
        )}
      </div>

      {/* Progress Card */}
      <Card className="mb-8">
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">
              {completedCount} of {totalSteps} steps complete
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </CardContent>
      </Card>

      {/* Steps */}
      <PlaybookSteps
        playbook={playbook}
        communitySlug={communitySlug}
        completedStepIds={completedStepIds}
      />

      {isComplete && (
        <Card className="mt-8 border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
          <CardContent className="py-6 text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto text-green-600 dark:text-green-400 mb-3" />
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
              Congratulations!
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              You&apos;ve completed all steps in this playbook.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
