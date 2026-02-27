import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Download,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { MarkCompleteButton } from "@/components/programs/mark-complete-button";
import { serializeMDX } from "@/lib/mdx";
import { LessonContent } from "@/components/mdx/LessonContent";

export default async function LessonPage({
  params,
}: {
  params: Promise<{
    "community-slug": string;
    "program-id": string;
    "lesson-id": string;
  }>;
}) {
  const { userId } = await auth();
  const resolvedParams = await params;
  const communitySlug = resolvedParams["community-slug"];
  const programId = resolvedParams["program-id"];
  const lessonId = resolvedParams["lesson-id"];
  const supabase = await createClient();

  // Get community
  const { data: community } = await supabase
    .from("communities")
    .select("*")
    .eq("slug", communitySlug)
    .single();

  if (!community) return notFound();

  // Get lesson
  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .single();

  if (!lesson) return notFound();

  // Get program
  const { data: program } = await supabase
    .from("programs")
    .select("*, lessons(*)")
    .eq("id", programId)
    .single();

  if (!program) return notFound();

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("clerk_user_id", userId)
    .eq("community_id", community.id)
    .single();

  // Check if lesson is completed
  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("lesson_id", lesson.id)
    .eq("profile_id", profile?.id || "")
    .single();

  const isCompleted = !!progress;

  // Serialize MDX content if present
  let mdxSource = null;
  if (lesson.content) {
    const { source } = await serializeMDX(lesson.content);
    mdxSource = source;
  }

  // Get navigation
  const lessons = (program.lessons || []).sort(
    (a: any, b: any) => a.order_index - b.order_index
  );
  const currentIndex = lessons.findIndex((l: any) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  return (
    <div className="container py-6 max-w-4xl">
      {/* Back link */}
      <Link
        href={`/${communitySlug}/programs/${programId}`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to {program.title}
      </Link>

      {/* Video Player */}
      {lesson.video_url && (() => {
        const embed = getVideoEmbed(lesson.video_url);
        if (!embed) return null;
        return (
          <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6">
            {embed.type === "video" ? (
              <video src={embed.src} controls className="w-full h-full" />
            ) : (
              <iframe
                src={embed.src}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
              />
            )}
          </div>
        );
      })()}

      {/* Lesson Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary">
              Lesson {currentIndex + 1} of {lessons.length}
            </Badge>
            {isCompleted && (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold">{lesson.title}</h1>
        </div>

        {profile && (
          <MarkCompleteButton
            lessonId={lessonId}
            programId={programId}
            communitySlug={communitySlug}
            isCompleted={isCompleted}
          />
        )}
      </div>

      {/* Lesson Content - Supports MDX with interactive components */}
      {lesson.content && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <LessonContent content={lesson.content} mdxSource={mdxSource} />
          </CardContent>
        </Card>
      )}

      {/* Attachments */}
      {lesson.attachment_urls && lesson.attachment_urls.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Attachments</h2>
          <div className="space-y-2">
            {lesson.attachment_urls.map((url: string, index: number) => (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span className="flex-1 truncate">
                  {(() => {
                    try {
                      const pathname = new URL(url).pathname;
                      return decodeURIComponent(pathname.split("/").pop() || `Attachment ${index + 1}`);
                    } catch {
                      return url.split("/").pop()?.split("?")[0] || `Attachment ${index + 1}`;
                    }
                  })()}
                </span>
                <Download className="h-4 w-4 text-muted-foreground" />
              </a>
            ))}
          </div>
        </div>
      )}

      <Separator className="my-6" />

      {/* Navigation */}
      <div className="flex items-center justify-between">
        {prevLesson ? (
          <Link
            href={`/${communitySlug}/programs/${programId}/lessons/${prevLesson.id}`}
          >
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous Lesson
            </Button>
          </Link>
        ) : (
          <div />
        )}

        {nextLesson ? (
          <Link
            href={`/${communitySlug}/programs/${programId}/lessons/${nextLesson.id}`}
          >
            <Button>
              Next Lesson
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        ) : (
          <Link href={`/${communitySlug}/programs/${programId}`}>
            <Button>
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Program
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

// Helper function for video embeds - supports YouTube, Vimeo, Loom, Wistia, Vidyard, Bunny, Cloudflare
function getVideoEmbed(url: string): { type: "iframe" | "video"; src: string } | null {
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
    return { type: "iframe", src: `https://www.loom.com/embed/${loomMatch[1]}` };
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
}
