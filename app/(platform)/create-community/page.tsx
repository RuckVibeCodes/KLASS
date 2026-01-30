"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Palette,
  BookOpen,
  Users,
  Sparkles,
  Copy,
  CheckCircle,
  CreditCard,
  ExternalLink,
  Rocket,
  SkipForward,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Step = "basics" | "branding" | "stripe" | "program" | "launch";

const STEPS: { key: Step; label: string; icon: React.ElementType }[] = [
  { key: "basics", label: "Basics", icon: Sparkles },
  { key: "branding", label: "Branding", icon: Palette },
  { key: "stripe", label: "Payments", icon: CreditCard },
  { key: "program", label: "Program", icon: BookOpen },
  { key: "launch", label: "Launch", icon: Rocket },
];

const PRESET_COLORS = [
  { name: "Indigo", primary: "#000000", accent: "#6366f1" },
  { name: "Blue", primary: "#1e3a5f", accent: "#3b82f6" },
  { name: "Purple", primary: "#2d1b69", accent: "#8b5cf6" },
  { name: "Emerald", primary: "#064e3b", accent: "#10b981" },
  { name: "Rose", primary: "#4c1d2e", accent: "#f43f5e" },
  { name: "Orange", primary: "#431407", accent: "#f97316" },
  { name: "Teal", primary: "#042f2e", accent: "#14b8a6" },
  { name: "Amber", primary: "#451a03", accent: "#f59e0b" },
];

const STORAGE_KEY = "klass-onboarding-progress";

interface OnboardingProgress {
  currentStep: Step;
  communityId: string;
  slug: string;
  name: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  logoUrl: string;
  tagline: string;
  stripeConnected: boolean;
  programTitle: string;
  programDescription: string;
  skipProgram: boolean;
}

const defaultProgress: OnboardingProgress = {
  currentStep: "basics",
  communityId: "",
  slug: "",
  name: "",
  description: "",
  primaryColor: "#000000",
  accentColor: "#6366f1",
  logoUrl: "",
  tagline: "",
  stripeConnected: false,
  programTitle: "",
  programDescription: "",
  skipProgram: false,
};

export default function CreateCommunityPage() {
  const router = useRouter();
  const { userId } = useAuth();

  // Load saved progress from localStorage
  const [progress, setProgress] = useState<OnboardingProgress>(defaultProgress);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [hasRestoredProgress, setHasRestoredProgress] = useState(false);

  // Restore progress on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as OnboardingProgress;
        // Only restore if same user and community was created
        if (parsed.communityId || parsed.name) {
          setProgress(parsed);
          setHasRestoredProgress(true);
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Save progress to localStorage whenever it changes
  const saveProgress = useCallback((newProgress: OnboardingProgress) => {
    setProgress(newProgress);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
    } catch {
      // Ignore
    }
  }, []);

  // Clear saved progress
  const clearProgress = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }, []);

  // Update individual fields
  const updateField = useCallback(<K extends keyof OnboardingProgress>(
    key: K,
    value: OnboardingProgress[K]
  ) => {
    saveProgress({ ...progress, [key]: value });
  }, [progress, saveProgress]);

  const currentStep = progress.currentStep;
  const stepIndex = STEPS.findIndex((s) => s.key === currentStep);
  const progressPercent = ((stepIndex + 1) / STEPS.length) * 100;

  const goToStep = (step: Step) => {
    saveProgress({ ...progress, currentStep: step });
    setError("");
  };

  const goNext = () => {
    const nextIdx = stepIndex + 1;
    if (nextIdx < STEPS.length) {
      goToStep(STEPS[nextIdx].key);
    }
  };

  const goBack = () => {
    const prevIdx = stepIndex - 1;
    if (prevIdx >= 0) {
      goToStep(STEPS[prevIdx].key);
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    const newSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    saveProgress({ ...progress, name: value, slug: newSlug });
  };

  // Step 1: Create community
  const handleCreateCommunity = async () => {
    if (!userId || !progress.name.trim() || !progress.slug.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      // Use server action to bypass RLS
      const { createCommunityWithProfile } = await import("@/actions/community");
      const result = await createCommunityWithProfile({
        name: progress.name.trim(),
        slug: progress.slug.trim(),
        description: progress.description.trim() || undefined,
        clerkUserId: userId,
      });

      if (result.error) {
        if (result.error.includes("duplicate") || result.error.includes("unique")) {
          setError("This community URL is already taken. Try a different name.");
        } else {
          setError(result.error);
        }
        return;
      }

      const community = result.community;

      // Server action already created profile, modules, and tiers
      saveProgress({
        ...progress,
        communityId: community.id,
        currentStep: "branding",
      });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Save branding
  const handleSaveBranding = async () => {
    if (!progress.communityId) return;

    setIsLoading(true);
    setError("");

    try {
      const supabase = createClient();

      const updateData: Record<string, unknown> = {
        primary_color: progress.primaryColor,
        accent_color: progress.accentColor,
      };

      if (progress.logoUrl.trim()) {
        updateData.logo_url = progress.logoUrl.trim();
      }

      if (progress.tagline.trim()) {
        updateData.settings_json = {
          banner_description: progress.tagline.trim(),
        };
      }

      const { error: updateError } = await supabase
        .from("communities")
        .update(updateData)
        .eq("id", progress.communityId);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      goNext();
    } catch {
      setError("Failed to save branding.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Connect Stripe (calls API route)
  const handleConnectStripe = async () => {
    if (!progress.communityId) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/stripe/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          communityId: progress.communityId,
          communitySlug: progress.slug,
          returnUrl: `${window.location.origin}/create-community?stripe=connected`,
          refreshUrl: `${window.location.origin}/create-community?stripe=refresh`,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to start Stripe setup. You can do this later from settings.");
        return;
      }

      const data = await response.json();

      if (data.url) {
        // Save progress before redirecting
        saveProgress({ ...progress, stripeConnected: false });
        window.location.href = data.url;
      } else {
        setError("Could not generate Stripe onboarding link. You can set this up later.");
      }
    } catch {
      setError("Failed to connect Stripe. You can set this up later from your admin settings.");
    } finally {
      setIsLoading(false);
    }
  };

  // Check for Stripe return
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("stripe") === "connected") {
      saveProgress({ ...progress, stripeConnected: true, currentStep: "program" });
      // Clean URL
      window.history.replaceState({}, "", "/create-community");
    } else if (params.get("stripe") === "refresh") {
      // They need to retry Stripe onboarding
      saveProgress({ ...progress, currentStep: "stripe" });
      window.history.replaceState({}, "", "/create-community");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Step 4: Create first program
  const handleCreateProgram = async () => {
    if (!progress.communityId || progress.skipProgram) {
      goNext();
      return;
    }

    if (!progress.programTitle.trim()) {
      setError("Enter a program title or skip this step.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Use server action to bypass RLS
      const { createProgram } = await import("@/actions/community");
      const result = await createProgram({
        communityId: progress.communityId,
        title: progress.programTitle.trim(),
        description: progress.programDescription.trim() || undefined,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      goNext();
    } catch {
      setError("Failed to create program.");
    } finally {
      setIsLoading(false);
    }
  };

  // Copy invite link
  const handleCopyLink = async () => {
    try {
      const link = `${window.location.origin}/${progress.slug}`;
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  // Launch
  const handleLaunch = () => {
    clearProgress();
    router.push(`/${progress.slug}`);
  };

  // Reset and start fresh
  const handleStartFresh = () => {
    clearProgress();
    setProgress(defaultProgress);
    setHasRestoredProgress(false);
  };

  const inviteLink = progress.slug
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/${progress.slug}`
    : "";

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="container max-w-3xl flex items-center justify-between py-4">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
          <span className="text-sm font-medium text-muted-foreground">
            Create Your Community
          </span>
          <div className="w-16" />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="container max-w-3xl pt-6">
        <div className="space-y-2 mb-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Step {stepIndex + 1} of {STEPS.length}</span>
            <span>{Math.round(progressPercent)}% complete</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Resumed progress notice */}
        {hasRestoredProgress && progress.communityId && stepIndex > 0 && (
          <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-2 mt-3">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              👋 Welcome back! Resuming where you left off.
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 text-xs"
              onClick={handleStartFresh}
            >
              Start Fresh
            </Button>
          </div>
        )}
      </div>

      {/* Step Navigation Dots */}
      <div className="container max-w-3xl py-4">
        <div className="flex items-center justify-center gap-2">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx === stepIndex;
            const isDone = idx < stepIndex;
            const isClickable = isDone && progress.communityId;

            return (
              <div key={step.key} className="flex items-center gap-2">
                {idx > 0 && (
                  <div
                    className={cn(
                      "w-8 h-0.5 rounded",
                      isDone ? "bg-primary" : "bg-muted-foreground/20"
                    )}
                  />
                )}
                <button
                  onClick={() => isClickable ? goToStep(step.key) : undefined}
                  disabled={!isClickable && !isActive}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                    isActive && "bg-primary text-primary-foreground",
                    isDone && "bg-primary/10 text-primary cursor-pointer hover:bg-primary/20",
                    !isActive && !isDone && "text-muted-foreground cursor-default"
                  )}
                >
                  {isDone ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">{step.label}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="container max-w-3xl pb-12">
        {/* Step 1: Community Basics */}
        {currentStep === "basics" && (
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Community Basics</CardTitle>
              <CardDescription>
                Choose a name, URL, and description for your community.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Community Name</Label>
                <Input
                  id="name"
                  value={progress.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="My Awesome Community"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    klasscommunity.com/
                  </span>
                  <Input
                    id="slug"
                    value={progress.slug}
                    onChange={(e) => updateField("slug", e.target.value)}
                    placeholder="my-community"
                    disabled={isLoading}
                    pattern="[a-z0-9-]+"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Only lowercase letters, numbers, and hyphens
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={progress.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="What's your community about?"
                  rows={3}
                  disabled={isLoading}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button
                className="w-full"
                onClick={handleCreateCommunity}
                disabled={isLoading || !progress.name.trim() || !progress.slug.trim()}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4 mr-2" />
                )}
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Branding */}
        {currentStep === "branding" && (
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Customize Your Brand</CardTitle>
              <CardDescription>
                Set your community&apos;s colors, logo, and tagline.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Color Presets */}
              <div className="space-y-3">
                <Label>Color Theme</Label>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_COLORS.map((preset) => {
                    const isSelected =
                      progress.primaryColor === preset.primary &&
                      progress.accentColor === preset.accent;
                    return (
                      <button
                        key={preset.name}
                        onClick={() => {
                          saveProgress({
                            ...progress,
                            primaryColor: preset.primary,
                            accentColor: preset.accent,
                          });
                        }}
                        className={cn(
                          "relative flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all",
                          isSelected
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-transparent hover:border-muted-foreground/20"
                        )}
                      >
                        <div className="flex gap-1">
                          <div
                            className="w-5 h-5 rounded-full border"
                            style={{ backgroundColor: preset.primary }}
                          />
                          <div
                            className="w-5 h-5 rounded-full border"
                            style={{ backgroundColor: preset.accent }}
                          />
                        </div>
                        <span className="text-xs">{preset.name}</span>
                        {isSelected && (
                          <CheckCircle className="absolute top-1 right-1 h-3 w-3 text-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary">Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="primary"
                      value={progress.primaryColor}
                      onChange={(e) => updateField("primaryColor", e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border"
                    />
                    <Input
                      value={progress.primaryColor}
                      onChange={(e) => updateField("primaryColor", e.target.value)}
                      className="flex-1"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accent">Accent Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="accent"
                      value={progress.accentColor}
                      onChange={(e) => updateField("accentColor", e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border"
                    />
                    <Input
                      value={progress.accentColor}
                      onChange={(e) => updateField("accentColor", e.target.value)}
                      className="flex-1"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Tagline */}
              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline (optional)</Label>
                <Input
                  id="tagline"
                  value={progress.tagline}
                  onChange={(e) => updateField("tagline", e.target.value)}
                  placeholder="A short tagline for your community banner"
                  disabled={isLoading}
                />
              </div>

              {/* Logo URL */}
              <div className="space-y-2">
                <Label htmlFor="logo">Logo URL (optional)</Label>
                <Input
                  id="logo"
                  value={progress.logoUrl}
                  onChange={(e) => updateField("logoUrl", e.target.value)}
                  placeholder="https://example.com/logo.png"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  You can upload a logo later from the admin settings
                </p>
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <Label>Preview</Label>
                <div
                  className="rounded-lg p-4 border"
                  style={{ backgroundColor: `${progress.primaryColor}08` }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: progress.accentColor }}
                    >
                      {progress.name?.charAt(0)?.toUpperCase() || "K"}
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: progress.primaryColor }}>
                        {progress.name || "Your Community"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {progress.tagline || progress.description || "Community description"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div
                      className="px-3 py-1 rounded-full text-xs text-white font-medium"
                      style={{ backgroundColor: progress.accentColor }}
                    >
                      Join Now
                    </div>
                    <div
                      className="px-3 py-1 rounded-full text-xs font-medium border"
                      style={{ borderColor: progress.accentColor, color: progress.accentColor }}
                    >
                      Learn More
                    </div>
                  </div>
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex gap-3">
                <Button variant="outline" onClick={goBack} disabled={isLoading}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSaveBranding}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4 mr-2" />
                  )}
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Connect Stripe */}
        {currentStep === "stripe" && (
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Connect Payments</CardTitle>
              <CardDescription>
                Connect Stripe to accept payments from your members. You can also
                do this later from your admin settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {progress.stripeConnected ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Stripe Connected!</h3>
                  <p className="text-muted-foreground">
                    Your payment account is set up. You can start accepting payments.
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Accept member payments</p>
                        <p className="text-xs text-muted-foreground">
                          Stripe handles payments, subscriptions, and payouts securely
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Paid memberships</p>
                        <p className="text-xs text-muted-foreground">
                          Charge for community access, programs, or events
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Get paid directly</p>
                        <p className="text-xs text-muted-foreground">
                          Payments go straight to your bank account (minus a small platform fee)
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleConnectStripe}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <ExternalLink className="h-4 w-4 mr-2" />
                    )}
                    Connect Stripe Account
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    You&apos;ll be redirected to Stripe to complete setup, then brought back here.
                  </p>
                </>
              )}

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex gap-3">
                <Button variant="outline" onClick={goBack} disabled={isLoading}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  className="flex-1"
                  variant={progress.stripeConnected ? "default" : "outline"}
                  onClick={goNext}
                  disabled={isLoading}
                >
                  {progress.stripeConnected ? (
                    <ArrowRight className="h-4 w-4 mr-2" />
                  ) : (
                    <SkipForward className="h-4 w-4 mr-2" />
                  )}
                  {progress.stripeConnected ? "Continue" : "Skip for Now"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: First Program */}
        {currentStep === "program" && (
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Create Your First Program</CardTitle>
              <CardDescription>
                Programs are structured learning paths with modules and lessons.
                Set up your first one now, or skip and add it later.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!progress.skipProgram ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="program-title">Program Title</Label>
                    <Input
                      id="program-title"
                      value={progress.programTitle}
                      onChange={(e) => updateField("programTitle", e.target.value)}
                      placeholder="e.g., Getting Started Guide"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="program-description">
                      Description (optional)
                    </Label>
                    <Textarea
                      id="program-description"
                      value={progress.programDescription}
                      onChange={(e) => updateField("programDescription", e.target.value)}
                      placeholder="What will members learn?"
                      rows={3}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">💡 Tip</p>
                    <p>
                      You can add modules and lessons after creating the program.
                      Start with a title and build out the content over time.
                    </p>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No worries! You can create programs anytime from your admin dashboard.</p>
                </div>
              )}

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <Button variant="outline" onClick={goBack} disabled={isLoading}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleCreateProgram}
                    disabled={isLoading || (!progress.skipProgram && !progress.programTitle.trim())}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <ArrowRight className="h-4 w-4 mr-2" />
                    )}
                    {progress.skipProgram ? "Skip & Continue" : "Create & Continue"}
                  </Button>
                </div>
                {!progress.skipProgram && (
                  <button
                    onClick={() => updateField("skipProgram", true)}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Skip this step →
                  </button>
                )}
                {progress.skipProgram && (
                  <button
                    onClick={() => updateField("skipProgram", false)}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    ← Actually, I want to create one
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Launch! */}
        {currentStep === "launch" && (
          <Card className="max-w-lg mx-auto">
            <CardHeader className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4">
                <Rocket className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl">You&apos;re Ready to Launch! 🎉</CardTitle>
              <CardDescription>
                Your community is set up and ready for members.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Community</span>
                  <span className="font-medium">{progress.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">URL</span>
                  <span className="font-mono text-xs">{inviteLink}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Payments</span>
                  <span className={cn(
                    "flex items-center gap-1",
                    progress.stripeConnected ? "text-green-600" : "text-muted-foreground"
                  )}>
                    {progress.stripeConnected ? (
                      <>
                        <CheckCircle className="h-3 w-3" />
                        Connected
                      </>
                    ) : (
                      "Not connected (can do later)"
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">First Program</span>
                  <span className="font-medium">
                    {progress.skipProgram ? "—" : progress.programTitle || "—"}
                  </span>
                </div>
              </div>

              {/* Share Link */}
              <div className="space-y-2">
                <Label>Share Your Community Link</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={inviteLink}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
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

              {/* Tips */}
              <div className="space-y-3">
                <p className="text-sm font-medium">What&apos;s next:</p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <span>📝</span>
                    <p>Create your first post to welcome members</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>📚</span>
                    <p>Add course content with modules and lessons</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>📧</span>
                    <p>Share your link with your audience</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>⚙️</span>
                    <p>Customize settings in the admin dashboard</p>
                  </div>
                </div>
              </div>

              <Button className="w-full" size="lg" onClick={handleLaunch}>
                <Rocket className="h-4 w-4 mr-2" />
                Launch My Community
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
