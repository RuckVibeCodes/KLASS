"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  BookOpen,
  DollarSign,
  BarChart3,
  Sparkles,
  MessageCircle,
  Rss,
  Mail,
  GraduationCap,
  FileText,
  Brain,
  CreditCard,
  Tag,
  CalendarDays,
  UserPlus,
  LayoutDashboard,
  TrendingUp,
  UserCheck,
  Lightbulb,
  Wand2,
  Bot,
} from "lucide-react";

interface Feature {
  icon: React.ReactNode;
  name: string;
  description: string;
}

const featureCategories: {
  value: string;
  label: string;
  icon: React.ReactNode;
  features: Feature[];
}[] = [
  {
    value: "community",
    label: "Community",
    icon: <Users className="h-4 w-4" />,
    features: [
      {
        icon: <Rss className="h-5 w-5" />,
        name: "Activity Feed",
        description: "Rich posts with images, polls, and threaded discussions your members love.",
      },
      {
        icon: <MessageCircle className="h-5 w-5" />,
        name: "Real-Time Chat",
        description: "Topic-based chat channels with reactions, threads, and file sharing.",
      },
      {
        icon: <Mail className="h-5 w-5" />,
        name: "Direct Messages",
        description: "Private member-to-member messaging for deeper connections.",
      },
      {
        icon: <Users className="h-5 w-5" />,
        name: "Member Profiles",
        description: "Custom profiles with bios, avatars, and activity history.",
      },
      {
        icon: <Tag className="h-5 w-5" />,
        name: "Member Tags & Roles",
        description: "Organize members with tags, roles, and permission levels.",
      },
      {
        icon: <UserPlus className="h-5 w-5" />,
        name: "Invite System",
        description: "Referral links and invite codes to grow your community organically.",
      },
    ],
  },
  {
    value: "learning",
    label: "Learning",
    icon: <BookOpen className="h-4 w-4" />,
    features: [
      {
        icon: <GraduationCap className="h-5 w-5" />,
        name: "Programs & Courses",
        description: "Multi-module programs with structured lessons and progress tracking.",
      },
      {
        icon: <FileText className="h-5 w-5" />,
        name: "Rich Lessons",
        description: "Video, text, and mixed-media lessons with completion tracking.",
      },
      {
        icon: <BookOpen className="h-5 w-5" />,
        name: "Playbooks",
        description: "Step-by-step action guides your members can follow and check off.",
      },
      {
        icon: <Brain className="h-5 w-5" />,
        name: "AI Lesson Outlines",
        description: "Generate course outlines instantly with AI-powered content scaffolding.",
      },
      {
        icon: <FileText className="h-5 w-5" />,
        name: "Resource Vault",
        description: "Organized library of templates, downloads, and reference materials.",
      },
      {
        icon: <BarChart3 className="h-5 w-5" />,
        name: "Progress Tracking",
        description: "Members see their progress; you see completion rates and engagement.",
      },
    ],
  },
  {
    value: "monetization",
    label: "Monetization",
    icon: <DollarSign className="h-4 w-4" />,
    features: [
      {
        icon: <CreditCard className="h-5 w-5" />,
        name: "Stripe Connect",
        description: "Accept payments directly to your Stripe account. You keep the revenue.",
      },
      {
        icon: <Tag className="h-5 w-5" />,
        name: "Membership Tiers",
        description: "Free and paid tiers with granular access control per section.",
      },
      {
        icon: <CalendarDays className="h-5 w-5" />,
        name: "Paid Events",
        description: "Sell access to live workshops, masterclasses, and group calls.",
      },
      {
        icon: <UserPlus className="h-5 w-5" />,
        name: "Affiliate Program",
        description: "Built-in affiliate system so members can refer and earn commissions.",
      },
      {
        icon: <DollarSign className="h-5 w-5" />,
        name: "Revenue Dashboard",
        description: "Track MRR, subscribers, churn, and revenue trends at a glance.",
      },
      {
        icon: <FileText className="h-5 w-5" />,
        name: "Gated Content",
        description: "Lock any content behind paid tiers — courses, resources, events, chat.",
      },
    ],
  },
  {
    value: "admin",
    label: "Admin",
    icon: <BarChart3 className="h-4 w-4" />,
    features: [
      {
        icon: <LayoutDashboard className="h-5 w-5" />,
        name: "Admin Dashboard",
        description: "Complete overview of your community — members, revenue, engagement.",
      },
      {
        icon: <TrendingUp className="h-5 w-5" />,
        name: "Analytics",
        description: "Track member activity, content performance, and growth metrics.",
      },
      {
        icon: <UserCheck className="h-5 w-5" />,
        name: "Member Management",
        description: "Search, filter, tag, and manage your members with powerful tools.",
      },
      {
        icon: <Wand2 className="h-5 w-5" />,
        name: "White-Label Branding",
        description: "Your logo, colors, custom domain — Klass stays completely invisible.",
      },
      {
        icon: <CalendarDays className="h-5 w-5" />,
        name: "Event Management",
        description: "Schedule and manage live events with Zoom/YouTube integration.",
      },
      {
        icon: <FileText className="h-5 w-5" />,
        name: "Feature Flags",
        description: "Toggle features on/off to customize your platform experience.",
      },
    ],
  },
  {
    value: "ai",
    label: "AI-Powered",
    icon: <Sparkles className="h-4 w-4" />,
    features: [
      {
        icon: <Brain className="h-5 w-5" />,
        name: "AI Lesson Builder",
        description: "Generate complete lesson outlines from a topic in seconds.",
      },
      {
        icon: <Lightbulb className="h-5 w-5" />,
        name: "Content Suggestions",
        description: "AI-powered suggestions for what content to create next.",
      },
      {
        icon: <Bot className="h-5 w-5" />,
        name: "Smart Onboarding",
        description: "Automated welcome flows that adapt to each new member.",
      },
      {
        icon: <Wand2 className="h-5 w-5" />,
        name: "AI Playbook Generator",
        description: "Turn any topic into a structured, actionable playbook automatically.",
      },
      {
        icon: <Sparkles className="h-5 w-5" />,
        name: "Community Insights",
        description: "AI-driven analytics on member engagement patterns and sentiment.",
      },
      {
        icon: <FileText className="h-5 w-5" />,
        name: "Smart Templates",
        description: "Pre-built templates for courses, programs, and community structures.",
      },
    ],
  },
];

export function FeatureTabs() {
  return (
    <Tabs defaultValue="community" className="w-full">
      <TabsList className="mx-auto mb-8 flex h-auto w-full max-w-2xl flex-wrap gap-1 bg-muted/50 p-1.5">
        {featureCategories.map((cat) => (
          <TabsTrigger
            key={cat.value}
            value={cat.value}
            className="flex-1 gap-2 px-4 py-2.5 text-sm data-[state=active]:bg-background data-[state=active]:shadow-md"
          >
            {cat.icon}
            <span className="hidden sm:inline">{cat.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      {featureCategories.map((cat) => (
        <TabsContent key={cat.value} value={cat.value} className="mt-0">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cat.features.map((feature, idx) => (
              <div
                key={idx}
                className="feature-card group rounded-xl border bg-card p-6 transition-all"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  {feature.icon}
                </div>
                <h4 className="mb-2 font-semibold">{feature.name}</h4>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
