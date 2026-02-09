"use client";

import { useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";

const REPORT_REASONS = [
  { value: "spam", label: "Spam or misleading", description: "Repetitive, misleading, or promotional content" },
  { value: "harassment", label: "Harassment or bullying", description: "Targeting someone with harmful behavior" },
  { value: "hate_speech", label: "Hate speech", description: "Discrimination based on protected characteristics" },
  { value: "violence", label: "Violence or threats", description: "Content promoting violence or making threats" },
  { value: "adult_content", label: "Adult or sexual content", description: "Nudity, sexual acts, or adult services" },
  { value: "copyright", label: "Copyright infringement", description: "Unauthorized use of copyrighted material" },
  { value: "misinformation", label: "Misinformation", description: "False or misleading information" },
  { value: "illegal_activity", label: "Illegal activity", description: "Promoting or facilitating illegal acts" },
  { value: "other", label: "Other", description: "Something else not listed above" },
] as const;

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: "post" | "comment" | "profile" | "message" | "event" | "resource";
  contentId: string;
  reportedProfileId?: string;
  communityId: string;
}

export function ReportModal({
  isOpen,
  onClose,
  contentType,
  contentId,
  reportedProfileId,
  communityId,
}: ReportModalProps) {
  const [reason, setReason] = useState<string>("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!reason) {
      toast({
        title: "Please select a reason",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          communityId,
          contentType,
          contentId,
          reportedProfileId,
          reason,
          description: description.trim() || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit report");
      }

      setIsSubmitted(true);
      toast({
        title: "Report submitted",
        description: "Thank you for helping keep our community safe.",
      });

      // Close after a delay
      setTimeout(() => {
        onClose();
        setIsSubmitted(false);
        setReason("");
        setDescription("");
      }, 2000);
    } catch (error) {
      toast({
        title: "Failed to submit report",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contentTypeLabel = {
    post: "post",
    comment: "comment",
    profile: "user",
    message: "message",
    event: "event",
    resource: "resource",
  }[contentType];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Report {contentTypeLabel}
          </DialogTitle>
          <DialogDescription>
            Help us understand what&apos;s wrong with this {contentTypeLabel}. Reports are reviewed within 24 hours.
          </DialogDescription>
        </DialogHeader>

        {isSubmitted ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Report Submitted</h3>
            <p className="text-muted-foreground text-sm">
              Our team will review this report and take appropriate action.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              <Label>Why are you reporting this?</Label>
              <RadioGroup value={reason} onValueChange={setReason}>
                {REPORT_REASONS.map((item) => (
                  <div key={item.value} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value={item.value} id={item.value} className="mt-0.5" />
                    <label htmlFor={item.value} className="flex-1 cursor-pointer">
                      <div className="font-medium text-sm">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Additional details (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide any additional context that might help us review this report..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting || !reason}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Submit Report
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
