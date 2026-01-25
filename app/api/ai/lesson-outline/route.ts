import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// AI Stub - Generates a lesson outline
// In production, this would call OpenAI or similar
export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topic, targetAudience, lessonCount } = await req.json();

    // Stub response - would use AI in production
    const outline = generateLessonOutline(
      topic,
      targetAudience,
      lessonCount || 5
    );

    return NextResponse.json({ outline });
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

function generateLessonOutline(
  topic: string,
  targetAudience?: string,
  lessonCount: number = 5
): LessonOutline {
  const audience = targetAudience || "beginners";

  // Generate placeholder lessons
  const lessons = Array.from({ length: lessonCount }, (_, i) => ({
    title: `Lesson ${i + 1}: ${getLessonTitle(topic, i)}`,
    description: `In this lesson, you'll learn the ${
      i === 0 ? "fundamentals" : `${getOrdinal(i + 1)} key concept`
    } of ${topic}. Perfect for ${audience}.`,
    duration: `${10 + Math.floor(Math.random() * 20)} minutes`,
  }));

  return {
    title: `Master ${topic}: A Complete Guide`,
    description: `A comprehensive ${lessonCount}-part program designed for ${audience}. Learn ${topic} from the ground up with practical exercises and real-world examples.`,
    lessons,
  };
}

function getLessonTitle(topic: string, index: number): string {
  const prefixes = [
    "Introduction to",
    "Understanding",
    "Deep Dive into",
    "Practical Applications of",
    "Advanced Techniques in",
    "Mastering",
    "Best Practices for",
    "Common Mistakes in",
  ];

  const prefix = prefixes[index % prefixes.length];
  return `${prefix} ${topic}`;
}

function getOrdinal(n: number): string {
  const suffixes = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}
