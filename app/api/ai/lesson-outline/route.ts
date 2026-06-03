import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { generateLessonOutlineAI, isAIAvailable } from "@/lib/ai/client";

const MIN_TOPIC_LENGTH = 3;
const MAX_TOPIC_LENGTH = 120;
const MIN_LESSONS = 1;
const MAX_LESSONS = 12;

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const topic = normalizeText(body.topic);
    const targetAudience = normalizeText(body.targetAudience);
    const lessonCount = clampLessonCount(body.lessonCount);

    if (!topic || topic.length < MIN_TOPIC_LENGTH) {
      return NextResponse.json(
        { error: "Topic must be at least 3 characters" },
        { status: 400 }
      );
    }

    if (topic.length > MAX_TOPIC_LENGTH) {
      return NextResponse.json(
        { error: `Topic must be ${MAX_TOPIC_LENGTH} characters or fewer` },
        { status: 400 }
      );
    }

    if (isAIAvailable()) {
      const outline = await generateLessonOutlineAI(
        topic,
        targetAudience,
        lessonCount
      );
      return NextResponse.json({
        outline: sanitizeOutline(outline, lessonCount),
      });
    }

    return NextResponse.json({
      outline: generateFallbackLessonOutline(topic, targetAudience, lessonCount),
      source: "fallback",
    });
  } catch (error) {
    console.error("AI lesson outline error:", error);
    return NextResponse.json(
      { error: "Failed to generate outline" },
      { status: 500 }
    );
  }
}

interface LessonOutline {
  title: string;
  description: string;
  lessons: {
    title: string;
    description: string;
    duration: string;
  }[];
}

function normalizeText(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim().replace(/\s+/g, " ");
  return trimmed || undefined;
}

function clampLessonCount(value: unknown): number {
  const numericValue = Number(value ?? 5);
  if (!Number.isFinite(numericValue)) return 5;
  return Math.min(
    Math.max(Math.round(numericValue), MIN_LESSONS),
    MAX_LESSONS
  );
}

function sanitizeOutline(
  outline: LessonOutline,
  lessonCount: number
): LessonOutline {
  const lessons = Array.isArray(outline.lessons) ? outline.lessons : [];

  return {
    title: normalizeText(outline.title) || "Generated Program Outline",
    description:
      normalizeText(outline.description) ||
      "A structured program outline with progressive, actionable lessons.",
    lessons: lessons.slice(0, lessonCount).map((lesson, index) => ({
      title: normalizeText(lesson.title) || `Lesson ${index + 1}`,
      description:
        normalizeText(lesson.description) ||
        "A focused lesson with clear learning outcomes and practical examples.",
      duration: normalizeText(lesson.duration) || estimateDuration(index),
    })),
  };
}

function generateFallbackLessonOutline(
  topic: string,
  targetAudience?: string,
  lessonCount: number = 5
): LessonOutline {
  const audience = targetAudience || "beginners";

  const lessons = Array.from({ length: lessonCount }, (_, i) => ({
    title: getLessonTitle(topic, i),
    description: `In this lesson, students learn the ${
      i === 0 ? "fundamentals" : `${getOrdinal(i + 1)} key concept`
    } of ${topic}, with examples tailored for ${audience}.`,
    duration: estimateDuration(i),
  }));

  return {
    title: `Master ${topic}: A Complete Guide`,
    description: `A practical ${lessonCount}-part program designed for ${audience}. Learn ${topic} from the ground up with exercises, examples, and implementation checkpoints.`,
    lessons,
  };
}

function getLessonTitle(topic: string, index: number): string {
  const prefixes = [
    "Introduction to",
    "Understanding",
    "Deep Dive into",
    "Applying",
    "Optimizing",
    "Mastering",
    "Best Practices for",
    "Troubleshooting",
  ];

  const prefix = prefixes[index % prefixes.length];
  return `${prefix} ${topic}`;
}

function estimateDuration(index: number): string {
  const durations = [
    "12 minutes",
    "15 minutes",
    "18 minutes",
    "20 minutes",
    "25 minutes",
  ];
  return durations[index % durations.length];
}

function getOrdinal(n: number): string {
  const suffixes = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}
