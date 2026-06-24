import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  generateQuizQuestionsAI,
  isAIAvailable,
  type GeneratedQuizQuestion,
  type QuizQuestionType,
} from "@/lib/ai/client";

const MIN_CONTENT_LENGTH = 50;
const MAX_CONTENT_LENGTH = 20_000;
const MIN_QUESTIONS = 1;
const MAX_QUESTIONS = 12;
const VALID_QUESTION_TYPES: QuizQuestionType[] = [
  "multiple_choice",
  "true_false",
  "multi_select",
];

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const lessonTitle = normalizeText(body.lessonTitle) || "Untitled lesson";
    const lessonContent = normalizeText(body.lessonContent);
    const questionCount = clampQuestionCount(body.questionCount);

    if (!lessonContent || lessonContent.length < MIN_CONTENT_LENGTH) {
      return NextResponse.json(
        { error: "Lesson content is too short to generate a meaningful quiz" },
        { status: 400 }
      );
    }

    if (lessonContent.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json(
        { error: `Lesson content must be ${MAX_CONTENT_LENGTH} characters or fewer` },
        { status: 400 }
      );
    }

    if (isAIAvailable()) {
      const questions = await generateQuizQuestionsAI(
        lessonTitle,
        lessonContent,
        questionCount
      );

      return NextResponse.json({
        questions: sanitizeQuestions(questions, questionCount, lessonTitle),
      });
    }

    return NextResponse.json({
      questions: generateFallbackQuizQuestions(
        lessonTitle,
        lessonContent,
        questionCount
      ),
      source: "fallback",
    });
  } catch (error) {
    console.error("AI quiz generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate quiz questions" },
      { status: 500 }
    );
  }
}

function normalizeText(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim().replace(/\s+/g, " ");
  return trimmed || undefined;
}

function clampQuestionCount(value: unknown): number {
  const numericValue = Number(value ?? 5);
  if (!Number.isFinite(numericValue)) return 5;
  return Math.min(
    Math.max(Math.round(numericValue), MIN_QUESTIONS),
    MAX_QUESTIONS
  );
}

function sanitizeQuestions(
  questions: GeneratedQuizQuestion[],
  questionCount: number,
  lessonTitle: string
): GeneratedQuizQuestion[] {
  const validQuestions = Array.isArray(questions) ? questions : [];

  const sanitized = validQuestions
    .slice(0, questionCount)
    .map((question, index) => sanitizeQuestion(question, index, lessonTitle));

  while (sanitized.length < questionCount) {
    sanitized.push(createFallbackQuestion(lessonTitle, sanitized.length));
  }

  return sanitized;
}

function sanitizeQuestion(
  question: GeneratedQuizQuestion,
  index: number,
  lessonTitle: string
): GeneratedQuizQuestion {
  const questionType = VALID_QUESTION_TYPES.includes(question.question_type)
    ? question.question_type
    : "multiple_choice";
  const options = sanitizeOptions(question.options, questionType);

  return {
    question_text:
      normalizeText(question.question_text) ||
      `Which concept is most important in ${lessonTitle}?`,
    question_type: questionType,
    points: Math.min(Math.max(Number(question.points) || 1, 1), 3),
    explanation:
      normalizeText(question.explanation) ||
      `Review lesson section ${index + 1} for the supporting details.`,
    options,
  };
}

function sanitizeOptions(
  options: GeneratedQuizQuestion["options"],
  questionType: QuizQuestionType
): GeneratedQuizQuestion["options"] {
  const normalized = (Array.isArray(options) ? options : [])
    .map((option) => ({
      option_text: normalizeText(option.option_text) || "Review the lesson",
      is_correct: Boolean(option.is_correct),
    }))
    .slice(0, questionType === "true_false" ? 2 : 6);

  const fallbackOptions =
    questionType === "true_false"
      ? [
          { option_text: "True", is_correct: true },
          { option_text: "False", is_correct: false },
        ]
      : [
          { option_text: "Apply the lesson's core framework", is_correct: true },
          { option_text: "Skip the fundamentals", is_correct: false },
          { option_text: "Ignore the example scenarios", is_correct: false },
          { option_text: "Avoid practicing the skill", is_correct: false },
        ];

  const filled = normalized.length ? normalized : fallbackOptions;

  if (questionType === "multiple_choice") {
    return enforceSingleCorrect(filled);
  }

  if (questionType === "true_false") {
    const trueFalse = filled.length === 2 ? filled : fallbackOptions;
    return enforceSingleCorrect(trueFalse);
  }

  return filled.some((option) => option.is_correct)
    ? filled
    : filled.map((option, index) => ({ ...option, is_correct: index === 0 }));
}

function enforceSingleCorrect(
  options: GeneratedQuizQuestion["options"]
): GeneratedQuizQuestion["options"] {
  let hasCorrect = false;

  return options.map((option, index) => {
    const isCorrect = option.is_correct && !hasCorrect;
    if (isCorrect) hasCorrect = true;

    return {
      ...option,
      is_correct: isCorrect || (!hasCorrect && index === options.length - 1),
    };
  });
}

function generateFallbackQuizQuestions(
  lessonTitle: string,
  lessonContent: string,
  questionCount: number
): GeneratedQuizQuestion[] {
  const keyPhrases = extractKeyPhrases(lessonContent, questionCount);

  return Array.from({ length: questionCount }, (_, index) =>
    createFallbackQuestion(lessonTitle, index, keyPhrases[index])
  );
}

function createFallbackQuestion(
  lessonTitle: string,
  index: number,
  keyPhrase?: string
): GeneratedQuizQuestion {
  const topic = keyPhrase || lessonTitle;

  return {
    question_text: `What is the best way to apply ${topic} from ${lessonTitle}?`,
    question_type: "multiple_choice",
    points: index % 3 === 2 ? 2 : 1,
    explanation: `The strongest answer applies ${topic} directly and checks understanding before moving on.`,
    options: [
      {
        option_text: `Practice ${topic} using the lesson examples`,
        is_correct: true,
      },
      { option_text: "Memorize terms without applying them", is_correct: false },
      { option_text: "Skip the examples and move ahead", is_correct: false },
      { option_text: "Use the framework only once", is_correct: false },
    ],
  };
}

function extractKeyPhrases(content: string, count: number): string[] {
  const words = content
    .split(/[^A-Za-z0-9'-]+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 4);
  const uniqueWords = Array.from(new Set(words));

  return uniqueWords.slice(0, count).map((word) => word.toLowerCase());
}
