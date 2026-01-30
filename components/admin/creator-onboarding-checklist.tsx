"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Circle,
  MessageSquare,
  FileText,
  FolderOpen,
  User,
  BookOpen,
  Link as LinkIcon,
  Copy,
  Check,
  X,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { OnboardingStatus } from "@/actions/onboarding";

interface Props {
  communitySlug: string;
  communityId: string;
  status: OnboardingStatus;
  onDismiss: () => Promise<void>;
}

export function CreatorOnboardingChecklist({
  communitySlug,
  communityId,
  status,
  onDismiss,
}: Props) {
  const [isDismissing, setIsDismissing] = useState(false);
  const [copied, setCopied] = useState(false);

  const inviteLink = `${typeof window !== "undefined" ? window.location.origin : ""}/${communitySlug}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDismiss = async () => {
    setIsDismissing(true);
    try {
      await onDismiss();
    } finally {
      setIsDismissing(false);
    }
  };

  const steps = [
    {
      key: "welcome-post",
      title: "Create a welcome post",
      description: "Introduce yourself and set the tone for your community",
      completed: status.hasWelcomePost,
      href: `/${communitySlug}`,
      action: "Create Post",
      icon: MessageSquare,
    },
    {
      key: "about-page",
      title: "Set up your About page",
      description: "Tell members what your community is about",
      completed: status.hasAboutPage,
      href: `/${communitySlug}/admin/settings`,
      action: "Edit About",
      icon: FileText,
    },
    {
      key: "first-resource",
      title: "Add your first resource",
      description: "Share a guide, template, or link to get members started",
      completed: status.hasResource,
      href: `/${communitySlug}/admin/content/resources`,
      action: "Add Resource",
      icon: FolderOpen,
    },
    {
      key: "profile",
      title: "Complete your profile",
      description: "Add a photo and bio so members know who you are",
      completed: status.hasProfileSetup,
      href: `/${communitySlug}/settings`,
      action: "Edit Profile",
      icon: User,
    },
    {
      key: "program",
      title: "Create a program",
      description: "Build a course or learning path for your members",
      completed: status.hasProgram,
      href: `/${communitySlug}/admin/content/programs`,
      action: "Add Program",
      icon: BookOpen,
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const isAllComplete = completedCount === steps.length;

  return (
    <Card className="border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {isAllComplete ? "🎉 You're all set!" : "Get your community ready"}
              </CardTitle>
              <CardDescription>
                {isAllComplete
                  ? "Great job! Your community is ready for members."
                  : "Complete these steps to launch your community"}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={handleDismiss}
            disabled={isDismissing}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress bar */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {completedCount} of {steps.length} complete
            </span>
            <span className="font-medium text-violet-600 dark:text-violet-400">
              {status.percentComplete}%
            </span>
          </div>
          <Progress value={status.percentComplete} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-6">
        {/* Steps list */}
        <div className="space-y-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.key}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-colors",
                  step.completed
                    ? "bg-green-500/5"
                    : "bg-muted/50 hover:bg-muted"
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    step.completed
                      ? "bg-green-500/20 text-green-600 dark:text-green-400"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {step.completed ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      step.completed && "text-green-700 dark:text-green-300"
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {step.description}
                  </p>
                </div>
                {!step.completed && (
                  <Link href={step.href}>
                    <Button size="sm" variant="outline" className="shrink-0 text-xs">
                      {step.action}
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Invite link section */}
        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-2">
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Share your community</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-muted px-3 py-2 rounded-md truncate font-mono">
              {inviteLink}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyLink}
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Dismiss button */}
        {isAllComplete && (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleDismiss}
            disabled={isDismissing}
          >
            Hide this checklist
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
