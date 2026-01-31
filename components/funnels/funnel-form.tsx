"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/image-upload";
import { Plus, Trash2, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createFunnel, updateFunnel } from "@/actions/funnels";
import type { Funnel, FunnelContentType } from "@/types/database";

// Slim types - we only need id and title for selection
interface SelectableItem {
  id: string;
  title: string;
}

interface FunnelFormProps {
  communitySlug: string;
  communityId: string;
  funnel?: Funnel;
  programs: SelectableItem[];
  resources: SelectableItem[];
}

export function FunnelForm({
  communitySlug,
  communityId,
  funnel,
  programs,
  resources,
}: FunnelFormProps) {
  const router = useRouter();
  const isEditing = !!funnel;

  // Form state
  const [title, setTitle] = useState(funnel?.title || "");
  const [slug, setSlug] = useState(funnel?.slug || "");
  const [description, setDescription] = useState(funnel?.description || "");
  const [coverImageUrl, setCoverImageUrl] = useState(funnel?.cover_image_url || "");
  const [videoUrl, setVideoUrl] = useState(funnel?.video_url || "");
  const [contentType, setContentType] = useState<FunnelContentType>(
    funnel?.content_type || "community"
  );
  const [contentId, setContentId] = useState(funnel?.content_id || "");
  const [headline, setHeadline] = useState(funnel?.headline || "");
  const [subheadline, setSubheadline] = useState(funnel?.subheadline || "");
  const [bulletPoints, setBulletPoints] = useState<string[]>(
    funnel?.bullet_points || [""]
  );
  const [ctaText, setCtaText] = useState(funnel?.cta_text || "Get Free Access");
  const [redirectPath, setRedirectPath] = useState(funnel?.redirect_path || "/feed");
  const [welcomeMessage, setWelcomeMessage] = useState(funnel?.welcome_message || "");
  const [published, setPublished] = useState(funnel?.published || false);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    // Auto-generate slug if not editing or slug is empty/matches old auto-generated
    if (!isEditing && (!slug || slug === generateSlug(title))) {
      setSlug(generateSlug(value));
    }
  };

  const addBulletPoint = () => {
    setBulletPoints([...bulletPoints, ""]);
  };

  const updateBulletPoint = (index: number, value: string) => {
    const newPoints = [...bulletPoints];
    newPoints[index] = value;
    setBulletPoints(newPoints);
  };

  const removeBulletPoint = (index: number) => {
    if (bulletPoints.length <= 1) return;
    setBulletPoints(bulletPoints.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    // Filter out empty bullet points
    const filteredBulletPoints = bulletPoints.filter((bp) => bp.trim() !== "");

    const data = {
      title,
      slug,
      description: description || undefined,
      cover_image_url: coverImageUrl || undefined,
      video_url: videoUrl || undefined,
      content_type: contentType,
      content_id: contentType !== "community" ? contentId : undefined,
      headline: headline || undefined,
      subheadline: subheadline || undefined,
      bullet_points: filteredBulletPoints,
      cta_text: ctaText,
      redirect_path: redirectPath,
      welcome_message: welcomeMessage || undefined,
      published,
    };

    let result;
    if (isEditing) {
      result = await updateFunnel(funnel.id, communitySlug, data);
    } else {
      result = await createFunnel(communitySlug, data);
    }

    if (result.error) {
      setError(result.error);
      setIsSaving(false);
      return;
    }

    router.push(`/${communitySlug}/admin/funnels`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="container py-6 max-w-3xl">
        <Link
          href={`/${communitySlug}/admin/funnels`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Funnels
        </Link>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">
            {isEditing ? "Edit Funnel" : "Create Funnel"}
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="published"
                checked={published}
                onCheckedChange={setPublished}
              />
              <Label htmlFor="published">Published</Label>
            </div>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Funnel"}
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Title (internal)</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Free Starter Guide"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      /{communitySlug}/
                    </span>
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => setSlug(generateSlug(e.target.value))}
                      placeholder="free-starter-guide"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description for admin reference"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Content Selection */}
          <Card>
            <CardHeader>
              <CardTitle>What Users Get</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Content Type</Label>
                <Select
                  value={contentType}
                  onValueChange={(value: FunnelContentType) => {
                    setContentType(value);
                    setContentId("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="community">
                      Community Access Only
                    </SelectItem>
                    <SelectItem value="program">Specific Program</SelectItem>
                    <SelectItem value="resource">Specific Resource</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {contentType === "community" &&
                    "Users will get free membership to your community"}
                  {contentType === "program" &&
                    "Users will get access to a specific program"}
                  {contentType === "resource" &&
                    "Users will get access to a specific resource"}
                </p>
              </div>

              {contentType === "program" && programs.length > 0 && (
                <div className="space-y-2">
                  <Label>Select Program</Label>
                  <Select value={contentId} onValueChange={setContentId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a program" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs.map((program) => (
                        <SelectItem key={program.id} value={program.id}>
                          {program.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {contentType === "resource" && resources.length > 0 && (
                <div className="space-y-2">
                  <Label>Select Resource</Label>
                  <Select value={contentId} onValueChange={setContentId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a resource" />
                    </SelectTrigger>
                    <SelectContent>
                      {resources.map((resource) => (
                        <SelectItem key={resource.id} value={resource.id}>
                          {resource.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {contentType !== "community" &&
                ((contentType === "program" && programs.length === 0) ||
                  (contentType === "resource" && resources.length === 0)) && (
                  <p className="text-sm text-muted-foreground">
                    No {contentType === "program" ? "programs" : "resources"}{" "}
                    available. Create one first.
                  </p>
                )}
            </CardContent>
          </Card>

          {/* Landing Page Copy */}
          <Card>
            <CardHeader>
              <CardTitle>Landing Page Copy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="coverImage">Cover Image</Label>
                <ImageUpload
                  value={coverImageUrl}
                  onChange={(url) => setCoverImageUrl(url || "")}
                  communityId={communityId}
                  bucket="community-assets"
                  aspectRatio="video"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video URL (optional)</Label>
                <Input
                  id="videoUrl"
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                />
                <p className="text-sm text-muted-foreground">
                  YouTube, Vimeo, or Loom video to embed on your landing page
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="headline">Headline</Label>
                <Input
                  id="headline"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Get the Ultimate Starter Guide FREE"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subheadline">Subheadline</Label>
                <Input
                  id="subheadline"
                  value={subheadline}
                  onChange={(e) => setSubheadline(e.target.value)}
                  placeholder="Everything you need to get started in just 5 minutes"
                />
              </div>

              <div className="space-y-2">
                <Label>Bullet Points</Label>
                <div className="space-y-2">
                  {bulletPoints.map((point, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={point}
                        onChange={(e) => updateBulletPoint(index, e.target.value)}
                        placeholder="What they'll learn or get..."
                      />
                      {bulletPoints.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeBulletPoint(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addBulletPoint}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Bullet Point
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ctaText">Button Text</Label>
                <Input
                  id="ctaText"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="Get Free Access"
                />
              </div>
            </CardContent>
          </Card>

          {/* After Signup */}
          <Card>
            <CardHeader>
              <CardTitle>After Signup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="redirectPath">Redirect To</Label>
                <Select value={redirectPath} onValueChange={setRedirectPath}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="/feed">Feed</SelectItem>
                    <SelectItem value="/programs">Programs</SelectItem>
                    <SelectItem value="/resources">Resources</SelectItem>
                    <SelectItem value="/events">Events</SelectItem>
                    <SelectItem value="/members">Members</SelectItem>
                    <SelectItem value="/chat">Chat</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Where to send users after they sign up
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="welcomeMessage">Welcome Message (optional)</Label>
                <Textarea
                  id="welcomeMessage"
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  placeholder="Welcome! Here's how to get started..."
                  rows={2}
                />
                <p className="text-sm text-muted-foreground">
                  Shown as a toast notification after signup
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
