/**
 * AI Client — Anthropic Claude integration for KLASS
 * 
 * Used for:
 * - Generating lesson outlines from topics
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
