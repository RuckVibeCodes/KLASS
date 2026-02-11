import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lessonTitle, lessonContent } = await req.json();

    if (!lessonContent || lessonContent.trim().length < 50) {
      return NextResponse.json(
        { error: "Lesson content is too short" },
        { status: 400 }
      );
    }

    const mdx = await generateComponents(lessonTitle, lessonContent);

    return NextResponse.json({ mdx });
  } catch (error) {
    console.error("AI component generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate components" },
      { status: 500 }
    );
  }
}

async function generateComponents(
  lessonTitle: string,
  lessonContent: string
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY not configured");
  }

  const systemPrompt = `You are an expert course designer. Analyze the lesson content and generate interactive MDX components to enhance learning.

AVAILABLE COMPONENTS:

1. <Callout type="info|warning|tip|danger|success" title="Optional Title">
     Content here
   </Callout>

2. <Choice
     question="Question text"
     options={[
       { text: "Option A", correct: true, explanation: "Why this is right" },
       { text: "Option B", correct: false, explanation: "Why this is wrong" }
     ]}
   />

3. <SignalBox
     type="bullish|bearish"
     entry="$67,000"
     stopLoss="$66,500"
     target="$68,500"
     riskReward="1:3"
   />

4. <Steps>
     <Step number={1} title="First Step">Description</Step>
     <Step number={2} title="Second Step">Description</Step>
   </Steps>

RULES:
- Generate 2-4 components that genuinely enhance the lesson
- For trading/finance content, include at least one SignalBox (cover both long AND short if applicable)
- Always include at least one Choice (quiz) question to test understanding
- Use Callouts for important warnings, tips, or key takeaways
- Use Steps for any process or sequence described in the content
- Make quiz questions practical and scenario-based
- For trading content, balance long AND short position scenarios

OUTPUT:
Return ONLY the MDX components, ready to be inserted. No explanations or markdown outside the components.
Start with a blank line, then the components, then end with a blank line.`;

  const userPrompt = `Analyze this lesson and generate interactive MDX components:

LESSON TITLE: ${lessonTitle}

LESSON CONTENT:
${lessonContent}

Generate 2-4 relevant interactive components. If this is trading content, ensure coverage of both long AND short scenarios.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
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

  const textContent = data.content?.find((block: { type: string }) => block.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text content in AI response");
  }

  return textContent.text.trim();
}
