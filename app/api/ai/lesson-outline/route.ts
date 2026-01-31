import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  isAIAvailable,
  generateLessonOutlineAI,
  AILimitExceededError,
} from "@/lib/ai/client";
import { generateLessonOutline as generateLessonOutlineStub } from "@/lib/ai/prompts";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topic, targetAudience, lessonCount, communityId } = await req.json();

    if (!topic) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    const count = lessonCount || 5;

    // If communityId provided, verify user is admin
    if (communityId) {
      const supabase = await createAdminClient();
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("clerk_user_id", userId)
        .eq("community_id", communityId)
        .single();

      if (!profile || profile.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Only admins can use AI features" },
          { status: 403 }
        );
      }
    }

    // Use real AI if available, otherwise fall back to template-based generation
    if (isAIAvailable()) {
      try {
        const outline = await generateLessonOutlineAI({
          communityId,
          userId,
          topic,
          targetAudience,
          lessonCount: count,
        });
        return NextResponse.json({ outline, source: "ai" });
      } catch (aiError) {
        // Handle limit exceeded error
        if (aiError instanceof AILimitExceededError) {
          return NextResponse.json(
            { error: aiError.message, code: "LIMIT_EXCEEDED" },
            { status: 429 }
          );
        }
        console.error(
          "AI generation failed, falling back to templates:",
          aiError instanceof Error ? aiError.message : "Unknown error"
        );
        // Fall through to stub
      }
    }

    // Fallback: template-based generation
    const stubOutline = generateLessonOutlineStub({
      programTitle: topic,
      programDescription: topic,
      targetAudience: targetAudience || "beginners",
      numberOfLessons: count,
    });

    return NextResponse.json({
      outline: {
        title: `Master ${topic}: A Complete Guide`,
        description: `A comprehensive ${count}-part program designed for ${targetAudience || "beginners"}. Learn ${topic} from the ground up.`,
        lessons: stubOutline.map((lesson) => ({
          title: lesson.title,
          description: lesson.description,
          duration: `${10 + Math.floor(Math.random() * 20)} minutes`,
        })),
      },
      source: "template",
    });
  } catch (error) {
    console.error(
      "AI lesson outline error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Failed to generate outline" },
      { status: 500 }
    );
  }
}
