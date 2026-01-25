// Hardcoded playbook templates
// These define the structure; progress is tracked in the database

export interface PlaybookStep {
  id: string;
  title: string;
  description?: string;
  link?: string; // Optional link to related page
}

export interface PlaybookSection {
  id: string;
  title: string;
  steps: PlaybookStep[];
}

export interface Playbook {
  id: string;
  title: string;
  description: string;
  icon: string; // Emoji or icon name
  sections: PlaybookSection[];
}

export const PLAYBOOKS: Playbook[] = [
  {
    id: "launch",
    title: "Launch Playbook",
    description: "Everything you need to launch your community successfully",
    icon: "🚀",
    sections: [
      {
        id: "branding",
        title: "Set up your branding",
        steps: [
          {
            id: "upload-logo",
            title: "Upload your logo",
            description: "Add a logo that represents your brand",
            link: "/admin/branding",
          },
          {
            id: "set-colors",
            title: "Set your brand colors",
            description: "Choose primary and accent colors",
            link: "/admin/branding",
          },
          {
            id: "write-description",
            title: "Write community description",
            description: "Describe what your community is about",
            link: "/admin/settings",
          },
        ],
      },
      {
        id: "content",
        title: "Create welcome content",
        steps: [
          {
            id: "first-post",
            title: "Write your first post",
            description: "Welcome members to your community",
          },
          {
            id: "about-page",
            title: "Set up your About page",
            description: "Tell members what to expect",
            link: "/admin/settings",
          },
        ],
      },
      {
        id: "program",
        title: "Build your first program",
        steps: [
          {
            id: "create-program",
            title: "Create a program",
            description: "Set up your first course or program",
            link: "/admin/content/programs",
          },
          {
            id: "add-lessons",
            title: "Add 2-3 lessons",
            description: "Create content for your program",
          },
          {
            id: "set-pricing",
            title: "Set program pricing",
            description: "Decide if the program is free or paid",
          },
        ],
      },
      {
        id: "invite",
        title: "Invite your first members",
        steps: [
          {
            id: "share-link",
            title: "Share your community link",
            description: "Send your community URL to potential members",
          },
          {
            id: "first-members",
            title: "Get your first 5 members",
            description: "Invite friends, colleagues, or beta testers",
          },
        ],
      },
    ],
  },
  {
    id: "onboarding",
    title: "Onboarding Playbook",
    description: "Create a great first impression for new members",
    icon: "👋",
    sections: [
      {
        id: "welcome",
        title: "Welcome experience",
        steps: [
          {
            id: "welcome-post",
            title: "Create a pinned welcome post",
            description: "Pin a post that greets new members",
          },
          {
            id: "intro-video",
            title: "Add an intro video",
            description: "Record a personal welcome message",
          },
          {
            id: "getting-started-guide",
            title: "Create a getting started guide",
            description: "Help members know where to begin",
          },
        ],
      },
      {
        id: "engagement",
        title: "Drive early engagement",
        steps: [
          {
            id: "intro-prompt",
            title: "Ask members to introduce themselves",
            description: "Create a post encouraging introductions",
          },
          {
            id: "first-action",
            title: "Define a clear first action",
            description: "Tell members exactly what to do first",
          },
          {
            id: "quick-win",
            title: "Provide a quick win",
            description: "Help members achieve something in their first visit",
          },
        ],
      },
      {
        id: "resources",
        title: "Essential resources",
        steps: [
          {
            id: "faq",
            title: "Create an FAQ resource",
            description: "Answer common questions upfront",
            link: "/admin/content/resources",
          },
          {
            id: "community-guidelines",
            title: "Publish community guidelines",
            description: "Set expectations for behavior",
          },
        ],
      },
    ],
  },
  {
    id: "reengagement",
    title: "Re-engagement Playbook",
    description: "Bring back inactive members and boost engagement",
    icon: "🔄",
    sections: [
      {
        id: "identify",
        title: "Identify inactive members",
        steps: [
          {
            id: "check-signals",
            title: "Review member signals",
            description: "Check who hasn't been active recently",
            link: "/admin/members",
          },
          {
            id: "segment-inactive",
            title: "Segment by inactivity period",
            description: "Group by 7 days, 14 days, 30+ days",
          },
        ],
      },
      {
        id: "reach-out",
        title: "Reach out personally",
        steps: [
          {
            id: "personal-message",
            title: "Send personal check-in messages",
            description: "Reach out to ask how they're doing",
          },
          {
            id: "offer-help",
            title: "Offer help or support",
            description: "Ask if they're stuck or need guidance",
          },
        ],
      },
      {
        id: "incentivize",
        title: "Create incentives to return",
        steps: [
          {
            id: "new-content",
            title: "Announce new content",
            description: "Share exciting updates they've missed",
          },
          {
            id: "exclusive-event",
            title: "Host an exclusive event",
            description: "Create FOMO with a limited event",
            link: "/admin/content/events",
          },
          {
            id: "challenge",
            title: "Launch a community challenge",
            description: "Create a fun, time-limited activity",
          },
        ],
      },
    ],
  },
];

export function getPlaybook(id: string): Playbook | undefined {
  return PLAYBOOKS.find((p) => p.id === id);
}

export function getTotalSteps(playbook: Playbook): number {
  return playbook.sections.reduce((total, section) => total + section.steps.length, 0);
}

export function getAllStepIds(playbook: Playbook): string[] {
  return playbook.sections.flatMap((section) => section.steps.map((step) => step.id));
}
