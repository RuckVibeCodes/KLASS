// AI Prompt Templates for Klass

export interface OnboardingInputs {
  communityType: "course" | "membership" | "coaching" | "other";
  communityDescription: string;
  tone: "professional" | "casual" | "friendly" | "inspiring";
  primaryCTA: string;
  communityName: string;
}

export interface OnboardingOutputs {
  welcomePost: string;
  firstDm: string;
  emailSubject: string;
  emailBody: string;
}

// For demo purposes, we generate content locally
// In production, this would call Claude or another AI model
export function generateOnboardingContent(inputs: OnboardingInputs): OnboardingOutputs {
  const { communityType, communityDescription, tone, primaryCTA, communityName } = inputs;

  const toneStyles: Record<string, { greeting: string; style: string }> = {
    professional: {
      greeting: "Welcome",
      style: "Thank you for joining. We look forward to supporting your journey.",
    },
    casual: {
      greeting: "Hey there",
      style: "So glad you're here! Let's make this journey awesome together.",
    },
    friendly: {
      greeting: "Hi friend",
      style: "We're so excited to have you in our community! Can't wait to connect.",
    },
    inspiring: {
      greeting: "Welcome to the journey",
      style: "You've taken the first step toward transformation. Let's go!",
    },
  };

  const toneConfig = toneStyles[tone] || toneStyles.friendly;

  // Generate Welcome Post
  const welcomePost = generateWelcomePost(inputs, toneConfig);

  // Generate First DM
  const firstDm = generateFirstDm(inputs, toneConfig);

  // Generate Email
  const { subject: emailSubject, body: emailBody } = generateEmail(inputs, toneConfig);

  return {
    welcomePost,
    firstDm,
    emailSubject,
    emailBody,
  };
}

function generateWelcomePost(
  inputs: OnboardingInputs,
  toneConfig: { greeting: string; style: string }
): string {
  const { communityName, communityDescription, primaryCTA, communityType } = inputs;

  const ctaLines: Record<string, string> = {
    course: "dive into our first module",
    membership: "explore what the community has to offer",
    coaching: "schedule your first coaching session",
    other: "take that first step",
  };

  const ctaLine = ctaLines[communityType] || ctaLines.other;

  return `${toneConfig.greeting} to ${communityName}! 🎉

${communityDescription}

${toneConfig.style}

Here's how to get the most out of your membership:

1. **Complete your profile** – Add a photo and bio so others can get to know you
2. **Introduce yourself** – Drop a comment below and tell us what brought you here
3. **${primaryCTA || `Start exploring and ${ctaLine}`}**

We're building something special here, and you're now part of it.

Questions? Drop them below or reach out anytime. We're here to help!

Let's go! 🚀`;
}

function generateFirstDm(
  inputs: OnboardingInputs,
  toneConfig: { greeting: string; style: string }
): string {
  const { communityName, primaryCTA } = inputs;

  return `${toneConfig.greeting}! 👋

I wanted to personally welcome you to ${communityName}. I'm so glad you're here!

If you have any questions as you're getting started, don't hesitate to reach out. ${primaryCTA ? `My suggestion? ${primaryCTA}` : "Take your time exploring – there's no rush."}

Looking forward to seeing you in the community!`;
}

function generateEmail(
  inputs: OnboardingInputs,
  toneConfig: { greeting: string; style: string }
): { subject: string; body: string } {
  const { communityName, communityDescription, primaryCTA, communityType } = inputs;

  const subject = `Welcome to ${communityName}! Here's how to get started`;

  const ctaButton = primaryCTA || "Get Started";

  const body = `${toneConfig.greeting} and welcome to ${communityName}!

${communityDescription}

${toneConfig.style}

**Your next step:**

${primaryCTA || "Log in to your account and introduce yourself in the community."}

[${ctaButton}]

If you have any questions, just reply to this email – I read every message.

See you inside!`;

  return { subject, body };
}

// Lesson outline generation (for program creation)
export interface LessonOutlineInputs {
  programTitle: string;
  programDescription: string;
  targetAudience: string;
  numberOfLessons: number;
}

export interface LessonOutline {
  title: string;
  description: string;
  keyPoints: string[];
}

export function generateLessonOutline(inputs: LessonOutlineInputs): LessonOutline[] {
  const { programTitle, programDescription, numberOfLessons } = inputs;

  // For demo, generate generic lesson structure
  const lessons: LessonOutline[] = [];

  const lessonTypes = [
    { prefix: "Introduction to", suffix: "the fundamentals" },
    { prefix: "Understanding", suffix: "core concepts" },
    { prefix: "Deep Dive:", suffix: "advanced techniques" },
    { prefix: "Practical", suffix: "hands-on application" },
    { prefix: "Mastering", suffix: "advanced strategies" },
    { prefix: "Review:", suffix: "putting it all together" },
  ];

  for (let i = 0; i < numberOfLessons; i++) {
    const typeIndex = i % lessonTypes.length;
    const type = lessonTypes[typeIndex];

    lessons.push({
      title: `Lesson ${i + 1}: ${type.prefix} ${programTitle.split(" ")[0] || "Topic"}`,
      description: `${type.suffix.charAt(0).toUpperCase() + type.suffix.slice(1)} of ${programDescription || programTitle}`,
      keyPoints: [
        `Key concept ${i + 1}.1`,
        `Key concept ${i + 1}.2`,
        `Key concept ${i + 1}.3`,
      ],
    });
  }

  return lessons;
}
