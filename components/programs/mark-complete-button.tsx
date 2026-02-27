"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { markLessonComplete, unmarkLessonComplete } from "@/actions/lessons";
import { useToast } from "@/hooks/use-toast";

interface MarkCompleteButtonProps {
  lessonId: string;
  programId: string;
  communitySlug: string;
  isCompleted: boolean;
}

export function MarkCompleteButton({
  lessonId,
  programId,
  communitySlug,
  isCompleted: initialCompleted,
}: MarkCompleteButtonProps) {
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleToggle = () => {
    startTransition(async () => {
      if (isCompleted) {
        const result = await unmarkLessonComplete(lessonId, programId, communitySlug);
        if (result.error) {
          toast({ variant: "destructive", title: "Error", description: "Failed to update progress." });
          return;
        }
        setIsCompleted(false);
      } else {
        const result = await markLessonComplete(lessonId, programId, communitySlug);
        if (result.error) {
          toast({ variant: "destructive", title: "Error", description: "Failed to update progress." });
          return;
        }
        setIsCompleted(true);
      }
    });
  };

  if (isCompleted) {
    return (
      <Button
        variant="outline"
        onClick={handleToggle}
        disabled={isPending}
        className="text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-950"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <CheckCircle className="h-4 w-4 mr-2" />
        )}
        Completed
      </Button>
    );
  }

  return (
    <Button onClick={handleToggle} disabled={isPending}>
      {isPending ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <CheckCircle className="h-4 w-4 mr-2" />
      )}
      Mark Complete
    </Button>
  );
}
