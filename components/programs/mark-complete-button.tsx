"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { markLessonComplete, unmarkLessonComplete } from "@/actions/lessons";

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

  const handleToggle = () => {
    startTransition(async () => {
      try {
        if (isCompleted) {
          await unmarkLessonComplete(lessonId, programId, communitySlug);
          setIsCompleted(false);
        } else {
          await markLessonComplete(lessonId, programId, communitySlug);
          setIsCompleted(true);
        }
      } catch (error) {
        console.error("Failed to update progress:", error);
      }
    });
  };

  if (isCompleted) {
    return (
      <Button
        variant="outline"
        onClick={handleToggle}
        disabled={isPending}
        className="text-green-600 border-green-600 hover:bg-green-50"
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
