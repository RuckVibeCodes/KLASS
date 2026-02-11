import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

interface QuizQuestion {
  question_text: string;
  question_type: "multiple_choice" | "true_false" | "multi_select";
  points: number;
  explanation: string;
  options: {
    option_text: string;
    is_correct: boolean;
  }[];
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lessonTitle, lessonContent, questionCount = 5 } = await req.json();

    if (!lessonContent || lessonContent.trim().length < 50) {
      return NextResponse.json(
        { error: "Lesson content is too short to generate a meaningful quiz" },
        { status: 400 }
      );
    }

    const questions = await generateQuizQuestions(
      lessonTitle,
      lessonContent,
      questionCount
    );

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("AI quiz generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate quiz questions" },
      { status: 500 }
    );
  }
}

async function generateQuizQuestions(
  lessonTitle: string,
  lessonContent: string,
  questionCount: number
): Promise<QuizQuestion[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY not configured");
  }

  const systemPrompt = `You are an expert quiz creator for educational courses. Generate quiz questions that test understanding of the lesson content.

CRITICAL RULES FOR TRADING/INVESTING CONTENT:
- If the lesson covers leverage trading, margin trading, or any trading strategy, you MUST include questions about BOTH long AND short positions
- Balance questions between bullish (long) and bearish (short) scenarios
- Include questions about when to go short vs when to go long
- Cover risk management for both directions (stop losses above entry for shorts, below for longs)
- Test understanding of profit/loss calculations for both position types
- Include short-specific concepts: short squeezes, borrowing fees, unlimited loss potential
- Include long-specific concepts: buying dips, dollar-cost averaging, holding through drawdowns

QUESTION VARIETY:
- Mix difficulty levels (easy, medium, hard)
- Include practical scenario-based questions
- Test both conceptual understanding and application
- Use realistic market scenarios with specific numbers when appropriate

FORMAT:
Return a JSON array of question objects with this exact structure:
[
  {
    "question_text": "Clear, specific question",
    "question_type": "multiple_choice" | "true_false" | "multi_select",
    "points": 1-3 based on difficulty,
    "explanation": "Brief explanation of why the correct answer is right",
    "options": [
      { "option_text": "Option A", "is_correct": true/false },
      { "option_text": "Option B", "is_correct": true/false },
      { "option_text": "Option C", "is_correct": true/false },
      { "option_text": "Option D", "is_correct": true/false }
    ]
  }
]

For true_false questions, only include 2 options (True/False).
For multi_select, multiple options can be correct.
For multiple_choice, exactly one option should be correct.

Return ONLY the JSON array, no other text.`;

  const userPrompt = `Generate ${questionCount} quiz questions for this lesson:

LESSON TITLE: ${lessonTitle}

LESSON CONTENT:
${lessonContent}

Remember: If this is trading-related content, ensure balanced coverage of BOTH long AND short positions. Generate exactly ${questionCount} questions as a JSON array.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Anthropic API error:", error);
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const data = await response.json();

  // Extract text content from response
  const textContent = data.content?.find((block: { type: string }) => block.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text content in AI response");
  }

  // Parse JSON from response
  const jsonMatch = textContent.text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Could not parse quiz questions from AI response");
  }

  const questions: QuizQuestion[] = JSON.parse(jsonMatch[0]);

  // Validate and sanitize questions
  return questions.map((q) => ({
    question_text: q.question_text,
    question_type: q.question_type || "multiple_choice",
    points: Math.min(Math.max(q.points || 1, 1), 3),
    explanation: q.explanation || "",
    options: q.options.map((opt) => ({
      option_text: opt.option_text,
      is_correct: Boolean(opt.is_correct),
    })),
  }));
}
