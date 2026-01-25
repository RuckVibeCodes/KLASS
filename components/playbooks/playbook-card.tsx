"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import type { Playbook } from "@/lib/playbooks/templates";
import { getTotalSteps } from "@/lib/playbooks/templates";

interface PlaybookCardProps {
  playbook: Playbook;
  communitySlug: string;
  completedStepIds: string[];
}

export function PlaybookCard({
  playbook,
  communitySlug,
  completedStepIds,
}: PlaybookCardProps) {
  const totalSteps = getTotalSteps(playbook);
  const completedSteps = completedStepIds.length;
  const progressPercent = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  const isComplete = completedSteps === totalSteps && totalSteps > 0;

  return (
    <Link href={`/${communitySlug}/admin/playbooks/${playbook.id}`}>
      <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="text-3xl">{playbook.icon}</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{playbook.title}</h3>
                  {isComplete && (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Complete
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {playbook.description}
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <Progress value={progressPercent} className="w-32 h-2" />
                  <span className="text-sm text-muted-foreground">
                    {completedSteps}/{totalSteps} steps
                  </span>
                </div>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground mt-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
