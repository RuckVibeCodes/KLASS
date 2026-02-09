"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ReportModal } from "./report-modal";

interface ReportButtonProps {
  contentType: "post" | "comment" | "profile" | "message" | "event" | "resource";
  contentId: string;
  reportedProfileId?: string;
  communityId: string;
  variant?: "button" | "dropdown" | "icon";
}

export function ReportButton({
  contentType,
  contentId,
  reportedProfileId,
  communityId,
  variant = "dropdown",
}: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (variant === "dropdown") {
    return (
      <>
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault();
            setIsOpen(true);
          }}
          className="text-destructive focus:text-destructive"
        >
          <Flag className="h-4 w-4 mr-2" />
          Report
        </DropdownMenuItem>
        <ReportModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          contentType={contentType}
          contentId={contentId}
          reportedProfileId={reportedProfileId}
          communityId={communityId}
        />
      </>
    );
  }

  if (variant === "icon") {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <Flag className="h-4 w-4" />
        </Button>
        <ReportModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          contentType={contentType}
          contentId={contentId}
          reportedProfileId={reportedProfileId}
          communityId={communityId}
        />
      </>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="text-destructive hover:text-destructive"
      >
        <Flag className="h-4 w-4 mr-2" />
        Report
      </Button>
      <ReportModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        contentType={contentType}
        contentId={contentId}
        reportedProfileId={reportedProfileId}
        communityId={communityId}
      />
    </>
  );
}
