"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, Eye, EyeOff, Video, FileText, Link as LinkIcon, X, Plus, HelpCircle } from "lucide-react";
import { updateLesson } from "@/actions/programs";
import { useToast } from "@/hooks/use-toast";
import type { Lesson, ContentVisibility, Quiz, QuizQuestion, QuizOption } from "@/types/database";
import { QuizEditor } from "./quiz-editor";

type QuizWithQuestions = Quiz & { quiz_questions: (QuizQuestion & { quiz_options: QuizOption[] })[] };

interface LessonEditorProps {
  lesson: Lesson;
  programId: string;
  communitySlug: string;
  communityId: string;
  quiz?: QuizWithQuestions | null;
}

export function LessonEditor({ lesson, programId, communitySlug, communityId, quiz }: LessonEditorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    title: lesson.title,
    content: lesson.content || "",
    video_url: lesson.video_url || "",
    video_duration_seconds: lesson.video_duration_seconds || 0,
    attachment_urls: lesson.attachment_urls || [],
    visibility: lesson.visibility as ContentVisibility,
    published: lesson.published,
  });

  const [newAttachment, setNewAttachment] = useState("");

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateLesson(lesson.id, programId, communitySlug, {
        title: formData.title,
        content: formData.content || null,
        video_url: formData.video_url || null,
        video_duration_seconds: formData.video_duration_seconds || null,
        attachment_urls: formData.attachment_urls,
        visibility: formData.visibility,
        published: formData.published,
      });

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save lesson. Please try again.",
        });
        return;
      }

      toast({
        variant: "success",
        title: "Lesson saved",
        description: "Your changes have been saved.",
      });

      router.refresh();
    });
  };

  const addAttachment = () => {
    if (!newAttachment.trim()) return;
    setFormData({
      ...formData,
      attachment_urls: [...formData.attachment_urls, newAttachment.trim()],
    });
    setNewAttachment("");
  };

  const removeAttachment = (index: number) => {
    setFormData({
      ...formData,
      attachment_urls: formData.attachment_urls.filter((_, i) => i !== index),
    });
  };

  // Extract video ID for preview
  const getVideoEmbed = (url: string): { type: "iframe" | "video" | "loom"; src: string } | null => {
    if (!url) return null;

    // YouTube
    const ytMatch = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (ytMatch) {
      return { type: "iframe", src: `https://www.youtube.com/embed/${ytMatch[1]}` };
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return { type: "iframe", src: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
    }

    // Loom
    const loomMatch = url.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/);
    if (loomMatch) {
      return { type: "loom", src: `https://www.loom.com/embed/${loomMatch[1]}` };
    }

    // Wistia
    const wistiaMatch = url.match(/(?:wistia\.com\/medias\/|fast\.wistia\.(?:net|com)\/embed\/(?:iframe|medias)\/)([a-zA-Z0-9]+)/);
    if (wistiaMatch) {
      return { type: "iframe", src: `https://fast.wistia.net/embed/iframe/${wistiaMatch[1]}` };
    }

    // Vidyard
    const vidyardMatch = url.match(/(?:vidyard\.com\/watch\/|play\.vidyard\.com\/)([a-zA-Z0-9]+)/);
    if (vidyardMatch) {
      return { type: "iframe", src: `https://play.vidyard.com/${vidyardMatch[1]}` };
    }

    // Bunny Stream
    const bunnyMatch = url.match(/iframe\.mediadelivery\.net\/embed\/(\d+)\/([a-zA-Z0-9-]+)/);
    if (bunnyMatch) {
      return { type: "iframe", src: `https://iframe.mediadelivery.net/embed/${bunnyMatch[1]}/${bunnyMatch[2]}` };
    }

    // Cloudflare Stream
    const cfStreamMatch = url.match(/(?:cloudflarestream\.com|videodelivery\.net)\/([a-zA-Z0-9]+)/);
    if (cfStreamMatch) {
      return { type: "iframe", src: `https://iframe.videodelivery.net/${cfStreamMatch[1]}` };
    }

    // Direct video URL
    if (url.match(/\.(mp4|webm|ogg)$/i)) {
      return { type: "video", src: url };
    }

    return null;
  };

  const embedUrl = getVideoEmbed(formData.video_url);

  return (
    <div className="space-y-6">
      {/* Header with save and publish */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{formData.title || "Untitled Lesson"}</h1>
          <p className="text-muted-foreground">Edit lesson content and settings</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              id="published"
              checked={formData.published}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, published: checked })
              }
            />
            <Label htmlFor="published" className="flex items-center gap-1">
              {formData.published ? (
                <>
                  <Eye className="h-4 w-4" />
                  Published
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4" />
                  Draft
                </>
              )}
            </Label>
          </div>
          <Button onClick={handleSave} disabled={isPending || !formData.title.trim()}>
            {isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save
          </Button>
        </div>
      </div>

      <Tabs defaultValue="content" className="space-y-4">
        <TabsList>
          <TabsTrigger value="content" className="gap-2">
            <FileText className="h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="video" className="gap-2">
            <Video className="h-4 w-4" />
            Video
          </TabsTrigger>
          <TabsTrigger value="attachments" className="gap-2">
            <LinkIcon className="h-4 w-4" />
            Attachments
          </TabsTrigger>
          <TabsTrigger value="quiz" className="gap-2">
            <HelpCircle className="h-4 w-4" />
            Quiz
          </TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Lesson Content</CardTitle>
              <CardDescription>
                Write your lesson content using Markdown for formatting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Lesson title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content (Markdown)</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your lesson content here...

You can use Markdown formatting:
- **bold** and *italic*
- # Headings
- [links](https://example.com)
- Lists and more..."
                  rows={15}
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility</Label>
                <Select
                  value={formData.visibility}
                  onValueChange={(value: ContentVisibility) =>
                    setFormData({ ...formData, visibility: value })
                  }
                >
                  <SelectTrigger id="visibility">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public - Anyone can view</SelectItem>
                    <SelectItem value="members">Members Only</SelectItem>
                    <SelectItem value="paid">Paid Only - Pro members</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Video Tab */}
        <TabsContent value="video">
          <Card>
            <CardHeader>
              <CardTitle>Video</CardTitle>
              <CardDescription>
                Add a video from YouTube, Vimeo, Loom, Wistia, or a direct URL
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="video_url">Video URL</Label>
                <Input
                  id="video_url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <p className="text-xs text-muted-foreground">
                  Supports YouTube, Vimeo, Loom, Wistia, Vidyard, Bunny Stream, Cloudflare Stream, and direct video URLs (.mp4, .webm)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (seconds)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.video_duration_seconds || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      video_duration_seconds: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="e.g., 600 for 10 minutes"
                />
              </div>

              {embedUrl && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    {embedUrl.type === "video" ? (
                      <video src={embedUrl.src} controls className="w-full h-full" />
                    ) : (
                      <iframe
                        src={embedUrl.src}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                        allowFullScreen
                      />
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attachments Tab */}
        <TabsContent value="attachments">
          <Card>
            <CardHeader>
              <CardTitle>Attachments</CardTitle>
              <CardDescription>
                Add downloadable files or resources for this lesson
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newAttachment}
                  onChange={(e) => setNewAttachment(e.target.value)}
                  placeholder="https://example.com/file.pdf"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addAttachment();
                    }
                  }}
                />
                <Button onClick={addAttachment} disabled={!newAttachment.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>

              {formData.attachment_urls.length > 0 ? (
                <div className="space-y-2">
                  {formData.attachment_urls.map((url, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 rounded border bg-muted/50"
                    >
                      <LinkIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="flex-1 truncate text-sm">{url}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No attachments added yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quiz Tab */}
        <TabsContent value="quiz">
          <QuizEditor
            lessonId={lesson.id}
            programId={programId}
            communitySlug={communitySlug}
            communityId={communityId}
            quiz={quiz || null}
            lessonTitle={formData.title}
            lessonContent={formData.content}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
