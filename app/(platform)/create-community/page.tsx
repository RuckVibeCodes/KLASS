"use client";

import { useState } from "react";
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
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Step = "name" | "branding" | "program" | "invite" | "complete";

const STEPS: { key: Step; label: string; icon: React.ElementType }[] = [
  { key: "name", label: "Community", icon: Sparkles },
  { key: "branding", label: "Branding", icon: Palette },
  { key: "program", label: "First Program", icon: BookOpen },
  { key: "invite", label: "Invite", icon: Users },
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

export default function CreateCommunityPage() {
  const router = useRouter();
  const { userId } = useAuth();

  // Step state
  const [currentStep, setCurrentStep] = useState<Step>("name");

  // Form state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Name
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  // Step 2: Branding
  const [primaryColor, setPrimaryColor] = useState("#000000");
  const [accentColor, setAccentColor] = useState("#6366f1");
  const [logoUrl, setLogoUrl] = useState("");

  // Step 3: First Program
  const [programTitle, setProgramTitle] = useState("");
  const [programDescription, setProgramDescription] = useState("");
  const [skipProgram, setSkipProgram] = useState(false);

  // Step 4: Invite
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);

  // Created community data
  const [communityId, setCommunityId] = useState("");

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setName(value);
    setSlug(
      value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    );
  };

  const stepIndex = STEPS.findIndex((s) => s.key === currentStep);

  const goNext = () => {
    const nextIdx = stepIndex + 1;
    if (nextIdx < STEPS.length) {
      setCurrentStep(STEPS[nextIdx].key);
    }
  };

  const goBack = () => {
    const prevIdx = stepIndex - 1;
    if (prevIdx >= 0) {
      setCurrentStep(STEPS[prevIdx].key);
    }
  };

  // Step 1: Create community
  const handleCreateCommunity = async () => {
    if (!userId || !name.trim() || !slug.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const supabase = createClient();

      // Create community with branding defaults
      const { data: community, error: communityError } = await supabase
        .from("communities")
        .insert({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || null,
          primary_color: "#000000",
          accent_color: "#6366f1",
          settings_json: {},
        })
        .select()
        .single();

      if (communityError) {
        if (communityError.code === "23505") {
          setError("This community URL is already taken. Try a different name.");
        } else {
          setError(communityError.message);
        }
        return;
      }

      // Create profile as admin
      const { error: profileError } = await supabase.from("profiles").insert({
        clerk_user_id: userId,
        community_id: community.id,
        role: "ADMIN",
        tier: "PAID",
      });

      if (profileError) {
        setError(profileError.message);
        return;
      }

      // Create default modules
      const defaultModules = [
        { key: "feed", label: "Community", enabled: true, order_index: 0 },
        { key: "programs", label: "Programs", enabled: true, order_index: 1 },
        { key: "resources", label: "Resources", enabled: true, order_index: 2 },
        { key: "events", label: "Events", enabled: true, order_index: 3 },
        { key: "members", label: "Members", enabled: true, order_index: 4 },
      ];

      await supabase.from("community_modules").insert(
        defaultModules.map((module) => ({
          ...module,
          community_id: community.id,
        }))
      );

      setCommunityId(community.id);
      setInviteLink(`${window.location.origin}/${community.slug}`);
      goNext(); // Move to branding step
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Save branding
  const handleSaveBranding = async () => {
    if (!communityId) return;

    setIsLoading(true);
    setError("");

    try {
      const supabase = createClient();

      const updateData: Record<string, unknown> = {
        primary_color: primaryColor,
        accent_color: accentColor,
      };

      if (logoUrl.trim()) {
        updateData.logo_url = logoUrl.trim();
      }

      const { error: updateError } = await supabase
        .from("communities")
        .update(updateData)
        .eq("id", communityId);

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

  // Step 3: Create first program
  const handleCreateProgram = async () => {
    if (!communityId || skipProgram) {
      goNext();
      return;
    }

    if (!programTitle.trim()) {
      setError("Enter a program title or skip this step.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const supabase = createClient();

      const { error: programError } = await supabase.from("programs").insert({
        community_id: communityId,
        title: programTitle.trim(),
        description: programDescription.trim() || null,
        visibility: "members",
        published: false,
        order_index: 0,
      });

      if (programError) {
        setError(programError.message);
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
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  // Finish onboarding
  const handleFinish = () => {
    router.push(`/${slug}`);
  };

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
          <div className="w-16" /> {/* spacer */}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="container max-w-3xl py-6">
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx === stepIndex;
            const isDone = idx < stepIndex;

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
                <div
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                    isActive && "bg-primary text-primary-foreground",
                    isDone && "bg-primary/10 text-primary",
                    !isActive && !isDone && "text-muted-foreground"
                  )}
                >
                  {isDone ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">{step.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        {currentStep === "name" && (
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Name Your Community</CardTitle>
              <CardDescription>
                Choose a name and URL for your community. You can change these later.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Community Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="My Awesome Community"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    klass.app/
                  </span>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
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
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's your community about?"
                  rows={3}
                  disabled={isLoading}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button
                className="w-full"
                onClick={handleCreateCommunity}
                disabled={isLoading || !name.trim() || !slug.trim()}
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

        {currentStep === "branding" && (
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Customize Your Branding</CardTitle>
              <CardDescription>
                Set your community&apos;s colors and logo. These define the look of your community pages.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Color Presets */}
              <div className="space-y-3">
                <Label>Color Theme</Label>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_COLORS.map((preset) => {
                    const isSelected =
                      primaryColor === preset.primary &&
                      accentColor === preset.accent;
                    return (
                      <button
                        key={preset.name}
                        onClick={() => {
                          setPrimaryColor(preset.primary);
                          setAccentColor(preset.accent);
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
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
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
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border"
                    />
                    <Input
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="flex-1"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <Label>Preview</Label>
                <div
                  className="rounded-lg p-4 border"
                  style={{ backgroundColor: `${primaryColor}08` }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: accentColor }}
                    >
                      {name?.charAt(0)?.toUpperCase() || "K"}
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: primaryColor }}>
                        {name || "Your Community"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {description || "Community description"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div
                      className="px-3 py-1 rounded-full text-xs text-white font-medium"
                      style={{ backgroundColor: accentColor }}
                    >
                      Join Now
                    </div>
                    <div
                      className="px-3 py-1 rounded-full text-xs font-medium border"
                      style={{ borderColor: accentColor, color: accentColor }}
                    >
                      Learn More
                    </div>
                  </div>
                </div>
              </div>

              {/* Logo URL */}
              <div className="space-y-2">
                <Label htmlFor="logo">Logo URL (optional)</Label>
                <Input
                  id="logo"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  You can upload a logo later from the admin settings
                </p>
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
              {!skipProgram ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="program-title">Program Title</Label>
                    <Input
                      id="program-title"
                      value={programTitle}
                      onChange={(e) => setProgramTitle(e.target.value)}
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
                      value={programDescription}
                      onChange={(e) => setProgramDescription(e.target.value)}
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
                    disabled={isLoading || (!skipProgram && !programTitle.trim())}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <ArrowRight className="h-4 w-4 mr-2" />
                    )}
                    {skipProgram ? "Skip & Continue" : "Create & Continue"}
                  </Button>
                </div>
                {!skipProgram && (
                  <button
                    onClick={() => setSkipProgram(true)}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Skip this step →
                  </button>
                )}
                {skipProgram && (
                  <button
                    onClick={() => setSkipProgram(false)}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    ← Actually, I want to create one
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === "invite" && (
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Invite Members</CardTitle>
              <CardDescription>
                Share your community link to invite your first members.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Invite link */}
              <div className="space-y-2">
                <Label>Your Community Link</Label>
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
                <p className="text-xs text-muted-foreground">
                  Anyone with this link can join your community
                </p>
              </div>

              {/* Tips */}
              <div className="space-y-3">
                <p className="text-sm font-medium">Invite ideas:</p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">📧</span>
                    <p>Email your existing audience with the link</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-lg">🐦</span>
                    <p>Share on social media (Twitter, LinkedIn)</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-lg">💬</span>
                    <p>Post in your Discord, Slack, or WhatsApp groups</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-lg">🎥</span>
                    <p>Add the link to your YouTube or TikTok bio</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={goBack} disabled={isLoading}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button className="flex-1" onClick={handleFinish}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Launch My Community
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
