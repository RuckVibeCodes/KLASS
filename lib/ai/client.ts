/**
 * AI Client — Anthropic Claude integration for KLASS
 * 
 * Used for:
 * - Generating lesson outlines from topics
 * - Generating quiz questions from lesson content
 * - Generating onboarding content (welcome posts, DMs, emails)
 * 
 * Requires ANTHROPIC_API_KEY environment variable.
 */

import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY is not set. Add it to your environment variables."
      );
    }
    _client = new Anthropic({ apiKey });
  }
  return _client;
}

/**
 * Check if AI features are available (API key is configured)
 */
export function isAIAvailable(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

// ============================================================================
// Lesson Outline Generation
// ============================================================================

export interface GeneratedLesson {
  title: string;
  description: string;
  duration: string;
}

export interface GeneratedLessonOutline {
  title: string;
  description: string;
  lessons: GeneratedLesson[];
}

export async function generateLessonOutlineAI(
  topic: string,
  targetAudience?: string,
  lessonCount: number = 5
): Promise<GeneratedLessonOutline> {
  const client = getClient();
  const audience = targetAudience || "beginners";

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `Create a structured lesson outline for a program about "${topic}" aimed at ${audience}.

Generate exactly ${lessonCount} lessons.

Return ONLY valid JSON with this exact structure (no markdown, no code blocks):
{
  "title": "Program title",
  "description": "2-3 sentence program description",
  "lessons": [
    {
      "title": "Lesson title (without 'Lesson N:' prefix)",
      "description": "2-3 sentence description of what students will learn",
      "duration": "estimated duration like '15 minutes' or '30 minutes'"
    }
  ]
}

Guidelines:
- Make lessons progressively build on each other
- Start with fundamentals, end with advanced/practical application
- Keep titles concise but descriptive
- Descriptions should be specific and actionable
- Durations should be realistic (10-45 minutes each)`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from AI");
  }

  try {
    // Strip any markdown code blocks if present
    let jsonText = textBlock.text.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    return JSON.parse(jsonText) as GeneratedLessonOutline;
  } catch {
    throw new Error("Failed to parse AI response as JSON");
  }
}

// ============================================================================
// Quiz Generation
// ============================================================================

export type QuizQuestionType = "multiple_choice" | "true_false" | "multi_select";

export interface GeneratedQuizOption {
  option_text: string;
  is_correct: boolean;
}

export interface GeneratedQuizQuestion {
  question_text: string;
  question_type: QuizQuestionType;
  points: number;
  explanation: string;
  options: GeneratedQuizOption[];
}

export async function generateQuizQuestionsAI(
  lessonTitle: string,
  lessonContent: string,
  questionCount: number = 5
): Promise<GeneratedQuizQuestion[]> {
  const client = getClient();

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: `You are an expert quiz creator for educational courses. Generate quiz questions that test understanding of the lesson content.

CRITICAL RULES FOR TRADING/INVESTING CONTENT:
- If the lesson covers leverage trading, margin trading, or any trading strategy, include questions about BOTH long AND short positions
- Balance questions between bullish (long) and bearish (short) scenarios
- Cover risk management for both directions
- Include short-specific concepts when relevant: short squeezes, borrowing fees, unlimited loss potential

QUESTION VARIETY:
- Mix difficulty levels
- Include practical scenario-based questions
- Test both conceptual understanding and application

Return ONLY a valid JSON array. No markdown, no code blocks.`,
    messages: [
      {
        role: "user",
        content: `Generate exactly ${questionCount} quiz questions for this lesson.

LESSON TITLE: ${lessonTitle || "Untitled lesson"}

LESSON CONTENT:
${lessonContent}

Use this exact structure:
[
  {
    "question_text": "Clear, specific question",
    "question_type": "multiple_choice",
    "points": 1,
    "explanation": "Brief explanation of why the correct answer is right",
    "options": [
      { "option_text": "Option A", "is_correct": true },
      { "option_text": "Option B", "is_correct": false },
      { "option_text": "Option C", "is_correct": false },
      { "option_text": "Option D", "is_correct": false }
    ]
  }
]

Allowed question_type values: multiple_choice, true_false, multi_select.
For true_false questions, include exactly True and False options.
For multiple_choice questions, exactly one option must be correct.`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from AI");
  }

  try {
    let jsonText = textBlock.text.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
    return JSON.parse(jsonMatch?.[0] || jsonText) as GeneratedQuizQuestion[];
  } catch {
    throw new Error("Failed to parse AI response as JSON");
  }
}

// ============================================================================
// Onboarding Content Generation
// ============================================================================

export interface OnboardingInput {
  communityName: string;
  communityType: "course" | "membership" | "coaching" | "other";
  communityDescription: string;
  tone: "professional" | "casual" | "friendly" | "inspiring";
  primaryCTA: string;
}

export interface OnboardingOutput {
  welcomePost: string;
  firstDm: string;
  emailSubject: string;
  emailBody: string;
}

export async function generateOnboardingContentAI(
  input: OnboardingInput
): Promise<OnboardingOutput> {
  const client = getClient();

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `Generate onboarding content for a community called "${input.communityName}".

Community type: ${input.communityType}
Description: ${input.communityDescription || "Not provided"}
Tone: ${input.tone}
Primary CTA for new members: ${input.primaryCTA || "Not specified"}

Return ONLY valid JSON with this exact structure (no markdown, no code blocks):
{
  "welcomePost": "A welcome post for the community feed (use emoji, formatting with **bold**, bullet points with •). Should be 150-250 words.",
  "firstDm": "A personal direct message template to send new members. Warm and personal. 50-100 words.",
  "emailSubject": "Email subject line for welcome email",
  "emailBody": "Email body for welcome email. Include a CTA button text in [brackets]. 100-150 words."
}

Guidelines:
- Match the requested tone exactly
- Make content feel authentic, not generic
- Include specific references to the community's purpose
- Welcome post should have clear next steps (numbered or bulleted)
- DM should feel personal, like it's from the founder
- Email should be clean and scannable with a clear call-to-action`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from AI");
  }

  try {
    let jsonText = textBlock.text.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    return JSON.parse(jsonText) as OnboardingOutput;
  } catch {
    throw new Error("Failed to parse AI response as JSON");
  }
}
