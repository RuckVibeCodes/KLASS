"use client";

import { useState } from "react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2 } from "lucide-react";
import { togglePlaybookStep } from "@/actions/playbooks";
import type { Playbook } from "@/lib/playbooks/templates";

interface PlaybookStepsProps {
  playbook: Playbook;
  communitySlug: string;
  completedStepIds: string[];
}

export function PlaybookSteps({
  playbook,
  communitySlug,
  completedStepIds: initialCompletedStepIds,
}: PlaybookStepsProps) {
  const [completedStepIds, setCompletedStepIds] = useState<string[]>(
    initialCompletedStepIds
  );
  const [loadingStepId, setLoadingStepId] = useState<string | null>(null);

  const handleToggle = async (stepId: string) => {
    setLoadingStepId(stepId);

    // Optimistic update
    const wasCompleted = completedStepIds.includes(stepId);
    const prevCompletedStepIds = completedStepIds;
    if (wasCompleted) {
      setCompletedStepIds(completedStepIds.filter((id) => id !== stepId));
    } else {
      setCompletedStepIds([...completedStepIds, stepId]);
    }

    try {
      const result = await togglePlaybookStep(communitySlug, playbook.id, stepId);

      if (result.error) {
        // Revert on error
        setCompletedStepIds(prevCompletedStepIds);
        console.error("Failed to toggle step:", result.error);
      }
    } catch (error) {
      // Revert on network error
      setCompletedStepIds(prevCompletedStepIds);
      console.error("Failed to toggle step:", error);
    } finally {
      setLoadingStepId(null);
    }
  };

  return (
    <div className="space-y-8">
      {playbook.sections.map((section, sectionIndex) => (
        <div key={section.id}>
          <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm">
              {sectionIndex + 1}
            </span>
            {section.title}
          </h3>

          <div className="space-y-3 pl-8">
            {section.steps.map((step) => {
              const isCompleted = completedStepIds.includes(step.id);
              const isLoading = loadingStepId === step.id;

              return (
                <div
                  key={step.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                    isCompleted
                      ? "bg-primary/5 border-primary/20"
                      : "bg-card border-border hover:bg-accent/50"
                  }`}
                >
                  <div className="pt-0.5">
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    ) : (
                      <Checkbox
                        checked={isCompleted}
                        onCheckedChange={() => handleToggle(step.id)}
                        className="h-5 w-5"
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-medium ${
                        isCompleted ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      {step.title}
                    </p>
                    {step.description && (
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {step.description}
                      </p>
                    )}
                  </div>

                  {step.link && (
                    <Link href={`/${communitySlug}${step.link}`}>
                      <Button variant="ghost" size="sm" className="shrink-0">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
