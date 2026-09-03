import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Playbook } from "@/lib/playbooks/templates";
import { getAllStepIds, getTotalSteps } from "@/lib/playbooks/templates";

interface PlaybookResumeCardProps {
  playbook: Playbook;
  communitySlug: string;
  completedStepIds: string[];
}

export function PlaybookResumeCard({
  playbook,
  communitySlug,
  completedStepIds,
}: PlaybookResumeCardProps) {
  const totalSteps = getTotalSteps(playbook);
  const validStepIds = new Set(getAllStepIds(playbook));
  const completedSteps = completedStepIds.filter((id) => validStepIds.has(id)).length;
  const remainingSteps = Math.max(totalSteps - completedSteps, 0);
  const progressPercent = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  const isStarted = completedSteps > 0;

  return (
    <Card className="mb-6 overflow-hidden border-primary/30 bg-gradient-to-r from-primary/10 via-background to-background">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3 w-3" />
                Recommended next
              </Badge>
              <span className="text-sm text-muted-foreground">
                {isStarted ? "Keep momentum going" : "Best place to begin"}
              </span>
            </div>

            <div>
              <h2 className="text-xl font-semibold">
                {playbook.icon} {playbook.title}
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                {playbook.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Progress value={progressPercent} className="h-2 w-40" />
              <span className="text-sm text-muted-foreground">
                {completedSteps}/{totalSteps} steps complete
              </span>
              {remainingSteps === 0 ? (
                <Badge className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Complete
                </Badge>
              ) : (
                <Badge variant="outline">
                  {remainingSteps} step{remainingSteps === 1 ? "" : "s"} left
                </Badge>
              )}
            </div>
          </div>

          <Button asChild>
            <Link href={`/${communitySlug}/admin/playbooks/${playbook.id}`}>
              {isStarted ? "Resume playbook" : "Start playbook"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
