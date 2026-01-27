/**
 * Demo Community Seed Script
 *
 * Seeds a "Vibe Code Crew" demo community with realistic data
 * for the /demo page. Idempotent — checks for existing demo before creating.
 *
 * Usage: npx tsx scripts/seed-demo.ts
 *
 * Requires environment variables:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Missing environment variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const DEMO_SLUG = "demo";
const DEMO_COMMUNITY_NAME = "Creator Academy";

// ============================================================================
// Seed Data
// ============================================================================

const MEMBER_PROFILES = [
  {
    display_name: "Alex Rivera",
    email: "alex.demo@vibecodecrew.com",
    avatar_url: null,
    bio: "Full-stack dev obsessed with Next.js and building cool things. 🚀",
    role: "ADMIN",
    tier: "PAID",
  },
  {
    display_name: "Jordan Chen",
    email: "jordan.demo@vibecodecrew.com",
    avatar_url: null,
    bio: "UI/UX designer turned developer. Making the web beautiful one component at a time.",
    role: "ADMIN",
    tier: "PAID",
  },
  {
    display_name: "Sam Patel",
    email: "sam.demo@vibecodecrew.com",
    avatar_url: null,
    bio: "Backend wizard. If it involves databases or APIs, I'm in.",
    role: "MEMBER",
    tier: "PAID",
  },
  {
    display_name: "Taylor Kim",
    email: "taylor.demo@vibecodecrew.com",
    avatar_url: null,
    bio: "Indie hacker building micro-SaaS products. Currently at 3 launched 🎉",
    role: "MEMBER",
    tier: "PAID",
  },
  {
    display_name: "Morgan Lee",
    email: "morgan.demo@vibecodecrew.com",
    avatar_url: null,
    bio: "Learning to code! Just finished my first React project 💪",
    role: "MEMBER",
    tier: "FREE",
  },
  {
    display_name: "Casey Brooks",
    email: "casey.demo@vibecodecrew.com",
    avatar_url: null,
    bio: "DevOps & cloud infrastructure. Making deployments boring (in a good way).",
    role: "MEMBER",
    tier: "PAID",
  },
  {
    display_name: "Riley Martinez",
    email: "riley.demo@vibecodecrew.com",
    avatar_url: null,
    bio: "Mobile dev with a passion for React Native. Building the next big app.",
    role: "MEMBER",
    tier: "FREE",
  },
  {
    display_name: "Avery Johnson",
    email: "avery.demo@vibecodecrew.com",
    avatar_url: null,
    bio: "Data science meets web dev. Love building dashboards and visualizations.",
    role: "MEMBER",
    tier: "PAID",
  },
  {
    display_name: "Quinn Davis",
    email: "quinn.demo@vibecodecrew.com",
    avatar_url: null,
    bio: "Open source contributor. TypeScript enthusiast. Coffee addict ☕",
    role: "MEMBER",
    tier: "FREE",
  },
  {
    display_name: "Drew Wilson",
    email: "drew.demo@vibecodecrew.com",
    avatar_url: null,
    bio: "Freelance web developer helping small businesses get online.",
    role: "MEMBER",
    tier: "PAID",
  },
];

const POSTS = [
  {
    content: `🚀 Welcome to the Vibe Code Crew!\n\nThis is your space to learn, build, and grow as a developer. Here's what you'll find:\n\n• **Programs** — Structured courses on modern web dev\n• **Resources** — Curated tools, templates, and guides\n• **Events** — Live coding sessions and AMAs\n• **Community** — Connect with fellow builders\n\nDrop a comment below and introduce yourself! What are you working on? 👇`,
    visibility: "public",
    pinned: true,
    authorIndex: 0,
  },
  {
    content: `Just shipped a new feature using server actions in Next.js 15 and it's 🔥\n\nThe DX improvement over API routes for simple mutations is massive. No more writing fetch calls, managing loading states manually, or dealing with serialization.\n\nAnyone else making the switch? What patterns are you finding useful?`,
    visibility: "members",
    pinned: false,
    authorIndex: 3,
  },
  {
    content: `Pro tip: If you're using Supabase with Next.js, set up Row Level Security (RLS) from day one.\n\nI learned this the hard way — retrofitting RLS policies on an existing app is painful. But starting with it means your data is secure by default, even if your server code has a bug.\n\nHere's my go-to starter policy pattern:\n\n\`\`\`sql\nCREATE POLICY "Users can read own data"\nON profiles FOR SELECT\nUSING (auth.uid() = clerk_user_id);\n\`\`\`\n\nSaved my bacon more than once! 🥓`,
    visibility: "members",
    pinned: false,
    authorIndex: 2,
  },
  {
    content: `Weekly wins thread! 🏆\n\nShare what you accomplished this week, no matter how small:\n\n• Landed a new client? 🎉\n• Fixed that nasty bug? 🐛\n• Learned something new? 📚\n• Pushed code to prod? 🚀\n\nEvery step forward counts. Let's celebrate together!`,
    visibility: "members",
    pinned: false,
    authorIndex: 1,
  },
];

const COMMENTS = [
  {
    postIndex: 0,
    authorIndex: 4,
    content:
      "So excited to be here! I'm Morgan, just learning to code. Working on my first portfolio site with Next.js!",
  },
  {
    postIndex: 0,
    authorIndex: 5,
    content:
      "Hey everyone! Casey here — DevOps engineer by day, indie hacker by night. Looking forward to connecting!",
  },
  {
    postIndex: 0,
    authorIndex: 7,
    content:
      "Data scientist joining the crew! Can't wait to learn more about frontend development 📊",
  },
  {
    postIndex: 1,
    authorIndex: 2,
    content:
      "Server actions + useTransition is chef's kiss. The pending state handling is so clean compared to managing it manually.",
  },
  {
    postIndex: 1,
    authorIndex: 7,
    content:
      "Just started using them for form submissions. Game changer for data mutations!",
  },
  {
    postIndex: 2,
    authorIndex: 3,
    content:
      "This! I spent a whole weekend adding RLS after launch. Never again 😅",
  },
  {
    postIndex: 2,
    authorIndex: 8,
    content:
      "Great tip! Would love to see a full guide on Supabase + Next.js security best practices.",
  },
  {
    postIndex: 3,
    authorIndex: 3,
    content: "Launched my third micro-SaaS this week — a simple invoice generator for freelancers! 🎉",
  },
  {
    postIndex: 3,
    authorIndex: 9,
    content:
      "Finally got my first paying client through my portfolio site. Small win but it feels huge! 💪",
  },
  {
    postIndex: 3,
    authorIndex: 4,
    content:
      "Completed the Vibe Code Fundamentals program! The React section was amazing 🚀",
  },
];

const PROGRAMS = [
  {
    title: "Vibe Code Fundamentals",
    description:
      "Master modern web development from the ground up. Learn React, Next.js, TypeScript, and Tailwind CSS through hands-on projects.",
    visibility: "members",
    published: true,
    thumbnail_url: null,
    sections: [
      {
        title: "Getting Started",
        lessons: [
          {
            title: "Welcome & Setup",
            content:
              "Welcome to Vibe Code Fundamentals! In this lesson, we'll set up your development environment and get familiar with the tools we'll use throughout the course.\n\n## What You'll Need\n\n- **Node.js 18+** — Our JavaScript runtime\n- **VS Code** — Recommended code editor\n- **Git** — Version control\n- **GitHub account** — For collaboration\n\n## Setup Steps\n\n1. Install Node.js from [nodejs.org](https://nodejs.org)\n2. Install VS Code and recommended extensions\n3. Create your first project with `npx create-next-app@latest`\n\nLet's get started! 🚀",
            published: true,
          },
          {
            title: "HTML & CSS Refresher",
            content:
              "A quick refresher on the building blocks of the web. We'll cover semantic HTML, modern CSS features, and responsive design patterns.\n\n## Key Concepts\n\n- Semantic HTML elements\n- CSS Grid and Flexbox\n- CSS Custom Properties\n- Responsive design with media queries\n\nEven if you're familiar with these, the exercises will help solidify your foundation.",
            published: true,
          },
          {
            title: "JavaScript Essentials",
            content:
              "Modern JavaScript features you need to know for React development. ES6+, async/await, destructuring, and more.\n\n## Topics Covered\n\n- Arrow functions & template literals\n- Destructuring & spread operator\n- Promises & async/await\n- Array methods (map, filter, reduce)\n- Modules (import/export)",
            published: true,
          },
        ],
      },
      {
        title: "React Deep Dive",
        lessons: [
          {
            title: "Components & Props",
            content:
              "Understanding React's component model. Learn how to build reusable, composable UI components.\n\n## What You'll Learn\n\n- Function components\n- Props and prop types\n- Children pattern\n- Composition vs inheritance",
            published: true,
          },
          {
            title: "State & Effects",
            content:
              "Managing component state and side effects with hooks. useState, useEffect, and custom hooks.\n\n## Hooks Covered\n\n- `useState` for local state\n- `useEffect` for side effects\n- `useRef` for DOM references\n- Building custom hooks",
            published: true,
          },
          {
            title: "Forms & Data Fetching",
            content:
              "Handling user input and fetching data from APIs. Server actions, form validation, and loading states.",
            published: false,
          },
        ],
      },
    ],
  },
  {
    title: "Ship Your SaaS",
    description:
      "Go from idea to launched product in 8 weeks. Learn to build, deploy, and monetize a real SaaS application using Next.js, Supabase, and Stripe.",
    visibility: "members",
    published: true,
    thumbnail_url: null,
    sections: [
      {
        title: "Planning & Architecture",
        lessons: [
          {
            title: "Validating Your Idea",
            content:
              "Before writing a single line of code, make sure you're building something people want.\n\n## The Validation Framework\n\n1. **Problem Interview** — Talk to 10 potential users\n2. **Solution Sketch** — Low-fidelity mockup\n3. **Landing Page Test** — Measure interest\n4. **Pre-sell** — Get commitments before building\n\nMost failed products skip this step. Don't be one of them.",
            published: true,
          },
          {
            title: "Tech Stack Setup",
            content:
              "Setting up the production-ready tech stack: Next.js 15, Supabase, Stripe, Vercel.\n\n## Architecture Overview\n\n- **Frontend:** Next.js with App Router\n- **Database:** Supabase (Postgres + Auth + Storage)\n- **Payments:** Stripe\n- **Hosting:** Vercel\n- **Email:** Resend",
            published: true,
          },
          {
            title: "Database Design Patterns",
            content:
              "Design a scalable database schema for your SaaS. Multi-tenancy, RLS policies, and migration strategies.",
            published: true,
          },
        ],
      },
      {
        title: "Build & Launch",
        lessons: [
          {
            title: "Authentication & User Management",
            content:
              "Implement secure authentication with Clerk or Supabase Auth. User profiles, roles, and permissions.",
            published: true,
          },
          {
            title: "Subscription Billing with Stripe",
            content:
              "Integrate Stripe for recurring payments. Checkout sessions, webhooks, customer portal, and pricing tiers.",
            published: true,
          },
          {
            title: "Launch Checklist",
            content:
              "Everything you need to do before and after launch. SEO, analytics, monitoring, and your first 100 users.",
            published: false,
          },
        ],
      },
    ],
  },
];

const MEMBERSHIP_TIERS = [
  {
    name: "Free",
    slug: "free",
    description: "Get started with community access and free content.",
    price_cents_monthly: 0,
    price_cents_yearly: 0,
    tier_level: 0,
    is_default: true,
    features: {
      community_feed: true,
      free_programs: true,
      events_view: true,
      premium_programs: false,
      resources: false,
      direct_support: false,
    },
  },
  {
    name: "Pro",
    slug: "pro",
    description:
      "Full access to all programs, resources, and premium content.",
    price_cents_monthly: 2900,
    price_cents_yearly: 24900,
    tier_level: 1,
    is_default: false,
    features: {
      community_feed: true,
      free_programs: true,
      premium_programs: true,
      resources: true,
      events_view: true,
      events_attend: true,
      direct_support: false,
    },
  },
  {
    name: "VIP",
    slug: "vip",
    description:
      "Everything in Pro plus 1-on-1 support, code reviews, and early access.",
    price_cents_monthly: 9900,
    price_cents_yearly: 89900,
    tier_level: 2,
    is_default: false,
    features: {
      community_feed: true,
      free_programs: true,
      premium_programs: true,
      resources: true,
      events_view: true,
      events_attend: true,
      direct_support: true,
      code_reviews: true,
      early_access: true,
    },
  },
];

const EVENTS = [
  {
    title: "Live Coding: Build a Dashboard with Next.js",
    description:
      "Watch Alex build a real-time analytics dashboard from scratch using Next.js, Supabase, and Recharts. Ask questions live!",
    visibility: "members",
    location: "Zoom (link shared in community)",
    starts_at: getFutureDate(7),
    ends_at: getFutureDate(7, 2),
    external_url: "https://zoom.us/demo",
  },
  {
    title: "AMA: From Side Project to Full-Time Indie Hacker",
    description:
      "Taylor shares their journey from corporate dev to running 3 profitable micro-SaaS products. Bring your questions!",
    visibility: "members",
    location: "Discord Voice Channel",
    starts_at: getFutureDate(14),
    ends_at: getFutureDate(14, 1.5),
    external_url: null,
  },
  {
    title: "Workshop: Mastering TypeScript Generics",
    description:
      "A deep-dive hands-on workshop on TypeScript generics. We'll build type-safe utility functions and understand conditional types.",
    visibility: "members",
    location: "Zoom (link shared 1hr before)",
    starts_at: getFutureDate(21),
    ends_at: getFutureDate(21, 3),
    external_url: null,
  },
];

const RESOURCES = [
  {
    title: "Next.js Project Starter Template",
    description:
      "A production-ready Next.js 15 template with Auth, Supabase, Tailwind, and shadcn/ui pre-configured.",
    type: "link" as const,
    url: "https://github.com/example/nextjs-starter",
    folder: "Templates",
    visibility: "members" as const,
  },
  {
    title: "The Indie Hacker's Launch Checklist",
    description:
      "A comprehensive 50-point checklist for launching your SaaS. From domain setup to ProductHunt strategy.",
    type: "link" as const,
    url: "https://example.com/launch-checklist",
    folder: "Guides",
    visibility: "public" as const,
  },
  {
    title: "Tailwind CSS Cheat Sheet",
    description:
      "Quick reference for Tailwind utility classes. Spacing, typography, flexbox, grid, and more.",
    type: "link" as const,
    url: "https://tailwindcomponents.com/cheatsheet",
    folder: "Cheat Sheets",
    visibility: "public" as const,
  },
  {
    title: "Supabase RLS Policy Templates",
    description:
      "Copy-paste Row Level Security policies for common patterns: user data, team access, admin overrides.",
    type: "link" as const,
    url: "https://example.com/rls-templates",
    folder: "Templates",
    visibility: "members" as const,
  },
  {
    title: "Design System Figma File",
    description:
      "Our community's design system in Figma. Components, colors, typography, and layout patterns.",
    type: "link" as const,
    url: "https://figma.com/example/design-system",
    folder: "Design",
    visibility: "members" as const,
  },
];

// ============================================================================
// Helpers
// ============================================================================

function getFutureDate(daysAhead: number, hoursOffset = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  date.setHours(18 + hoursOffset, 0, 0, 0); // Default 6 PM
  return date.toISOString();
}

// ============================================================================
// Seed Functions
// ============================================================================

async function checkExisting(): Promise<string | null> {
  const { data } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", DEMO_SLUG)
    .single();

  return data?.id || null;
}

async function seedCommunity(): Promise<string> {
  console.log("🏗️  Creating demo community...");

  const { data, error } = await supabase
    .from("communities")
    .insert({
      name: DEMO_COMMUNITY_NAME,
      slug: DEMO_SLUG,
      description:
        "Master the art of building and monetizing online communities. Join 5,000+ creators learning to build sustainable businesses around their expertise.",
      primary_color: "#6366f1",
      accent_color: "#8b5cf6",
      logo_url: null,
      status: "active",
      billing_status: "active",
      settings_json: {
        welcome_message: "Welcome to the Vibe Code Crew! 🚀",
        allow_member_posts: true,
        require_approval: false,
        show_member_count: true,
        default_post_visibility: "members",
      },
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to create community:", error.message);
    process.exit(1);
  }

  console.log(`   ✅ Community created: ${data.id}`);
  return data.id;
}

async function seedModules(communityId: string) {
  console.log("📦 Creating community modules...");

  const modules = [
    { key: "feed", label: "Community Feed", enabled: true, order_index: 0 },
    { key: "programs", label: "Programs", enabled: true, order_index: 1 },
    { key: "events", label: "Events", enabled: true, order_index: 2 },
    { key: "resources", label: "Resources", enabled: true, order_index: 3 },
    { key: "members", label: "Members", enabled: true, order_index: 4 },
  ];

  const { error } = await supabase.from("community_modules").insert(
    modules.map((m) => ({ ...m, community_id: communityId }))
  );

  if (error) {
    console.warn("   ⚠️  Modules may already exist:", error.message);
  } else {
    console.log("   ✅ Modules created");
  }
}

async function seedProfiles(communityId: string): Promise<string[]> {
  console.log("👥 Creating member profiles...");

  const profiles = MEMBER_PROFILES.map((p) => ({
    ...p,
    community_id: communityId,
    clerk_user_id: `demo_${p.email.split("@")[0]}_${Date.now()}`,
  }));

  const { data, error } = await supabase
    .from("profiles")
    .insert(profiles)
    .select("id");

  if (error) {
    console.error("Failed to create profiles:", error.message);
    process.exit(1);
  }

  const profileIds = data.map((p) => p.id);
  console.log(`   ✅ ${profileIds.length} profiles created`);
  return profileIds;
}

async function seedPosts(
  communityId: string,
  profileIds: string[]
): Promise<string[]> {
  console.log("📝 Creating posts...");

  const postRecords = POSTS.map((p) => ({
    community_id: communityId,
    author_profile_id: profileIds[p.authorIndex],
    content: p.content,
    visibility: p.visibility,
    pinned: p.pinned,
    media_urls: [],
  }));

  const { data, error } = await supabase
    .from("posts")
    .insert(postRecords)
    .select("id");

  if (error) {
    console.error("Failed to create posts:", error.message);
    process.exit(1);
  }

  const postIds = data.map((p) => p.id);
  console.log(`   ✅ ${postIds.length} posts created`);
  return postIds;
}

async function seedComments(postIds: string[], profileIds: string[]) {
  console.log("💬 Creating comments...");

  const commentRecords = COMMENTS.map((c) => ({
    post_id: postIds[c.postIndex],
    author_profile_id: profileIds[c.authorIndex],
    content: c.content,
  }));

  const { error } = await supabase.from("comments").insert(commentRecords);

  if (error) {
    console.error("Failed to create comments:", error.message);
  } else {
    console.log(`   ✅ ${commentRecords.length} comments created`);
  }

  // Update comment counts
  for (let i = 0; i < postIds.length; i++) {
    const count = COMMENTS.filter((c) => c.postIndex === i).length;
    if (count > 0) {
      await supabase
        .from("posts")
        .update({ comments_count: count })
        .eq("id", postIds[i]);
    }
  }
}

async function seedLikes(postIds: string[], profileIds: string[]) {
  console.log("❤️  Creating post likes...");

  // Give each post some random likes
  const likes: { post_id: string; profile_id: string }[] = [];

  postIds.forEach((postId, postIndex) => {
    // Each post gets likes from 3-7 members
    const likeCount = 3 + Math.floor(Math.random() * 5);
    const shuffled = [...profileIds].sort(() => Math.random() - 0.5);

    for (let i = 0; i < Math.min(likeCount, shuffled.length); i++) {
      likes.push({ post_id: postId, profile_id: shuffled[i] });
    }
  });

  const { error } = await supabase.from("post_likes").insert(likes);

  if (error) {
    console.warn("   ⚠️  Some likes may have failed:", error.message);
  } else {
    console.log(`   ✅ ${likes.length} likes created`);
  }

  // Update like counts
  for (const postId of postIds) {
    const count = likes.filter((l) => l.post_id === postId).length;
    await supabase
      .from("posts")
      .update({ likes_count: count })
      .eq("id", postId);
  }
}

async function seedPrograms(communityId: string) {
  console.log("📚 Creating programs...");

  for (let pi = 0; pi < PROGRAMS.length; pi++) {
    const prog = PROGRAMS[pi];

    const { data: program, error: progError } = await supabase
      .from("programs")
      .insert({
        community_id: communityId,
        title: prog.title,
        description: prog.description,
        visibility: prog.visibility,
        published: prog.published,
        thumbnail_url: prog.thumbnail_url,
        order_index: pi,
      })
      .select("id")
      .single();

    if (progError) {
      console.error(`   ❌ Failed to create program "${prog.title}":`, progError.message);
      continue;
    }

    console.log(`   ✅ Program: ${prog.title}`);

    // Create sections and lessons
    for (let si = 0; si < prog.sections.length; si++) {
      const section = prog.sections[si];

      const { data: sectionData, error: sectionError } = await supabase
        .from("program_sections")
        .insert({
          program_id: program.id,
          title: section.title,
          order_index: si,
        })
        .select("id")
        .single();

      if (sectionError) {
        console.warn(`      ⚠️  Section creation failed:`, sectionError.message);
        continue;
      }

      for (let li = 0; li < section.lessons.length; li++) {
        const lesson = section.lessons[li];

        const { error: lessonError } = await supabase.from("lessons").insert({
          program_id: program.id,
          section_id: sectionData.id,
          title: lesson.title,
          content: lesson.content,
          published: lesson.published,
          visibility: "members",
          order_index: li,
        });

        if (lessonError) {
          console.warn(`      ⚠️  Lesson creation failed:`, lessonError.message);
        }
      }

      console.log(
        `      📂 Section: ${section.title} (${section.lessons.length} lessons)`
      );
    }
  }
}

async function seedTiers(communityId: string) {
  console.log("💎 Creating membership tiers...");

  for (let i = 0; i < MEMBERSHIP_TIERS.length; i++) {
    const tier = MEMBERSHIP_TIERS[i];

    const { error } = await supabase.from("membership_tiers").insert({
      community_id: communityId,
      name: tier.name,
      slug: tier.slug,
      description: tier.description,
      price_cents_monthly: tier.price_cents_monthly,
      price_cents_yearly: tier.price_cents_yearly,
      tier_level: tier.tier_level,
      is_default: tier.is_default,
      features: tier.features,
      active: true,
      order_index: i,
    });

    if (error) {
      console.warn(`   ⚠️  Tier "${tier.name}" failed:`, error.message);
    } else {
      const priceDisplay =
        tier.price_cents_monthly === 0
          ? "Free"
          : `$${(tier.price_cents_monthly / 100).toFixed(0)}/mo`;
      console.log(`   ✅ ${tier.name} (${priceDisplay})`);
    }
  }
}

async function seedEvents(communityId: string) {
  console.log("📅 Creating events...");

  for (const event of EVENTS) {
    const { error } = await supabase.from("events").insert({
      community_id: communityId,
      title: event.title,
      description: event.description,
      visibility: event.visibility,
      location: event.location,
      starts_at: event.starts_at,
      ends_at: event.ends_at,
      external_url: event.external_url,
    });

    if (error) {
      console.warn(`   ⚠️  Event "${event.title}" failed:`, error.message);
    } else {
      console.log(`   ✅ ${event.title}`);
    }
  }
}

async function seedResources(communityId: string) {
  console.log("📦 Creating resources...");

  for (let i = 0; i < RESOURCES.length; i++) {
    const resource = RESOURCES[i];

    const { error } = await supabase.from("resources").insert({
      community_id: communityId,
      title: resource.title,
      description: resource.description,
      type: resource.type,
      url: resource.url,
      folder: resource.folder,
      visibility: resource.visibility,
      order_index: i,
    });

    if (error) {
      console.warn(`   ⚠️  Resource "${resource.title}" failed:`, error.message);
    } else {
      console.log(`   ✅ ${resource.title}`);
    }
  }
}

async function cleanupExisting(communityId: string) {
  console.log("🧹 Cleaning up existing demo data...");

  // Delete in dependency order
  const tables = [
    "post_likes",
    "comments",
    "posts",
    "lesson_progress",
    "lesson_comments",
    "lessons",
    "program_sections",
    "programs",
    "membership_tiers",
    "events",
    "resources",
    "content_access_grants",
    "profiles",
    "community_modules",
  ];

  for (const table of tables) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq("community_id", communityId);

    if (error) {
      // Some tables might not have community_id directly
      // That's OK, we'll cascade
    }
  }

  // Delete the community itself
  await supabase.from("communities").delete().eq("id", communityId);

  console.log("   ✅ Cleanup complete");
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║   KLASS Demo Community Seeder            ║");
  console.log("╚══════════════════════════════════════════╝");
  console.log("");

  // Check for existing demo
  const existingId = await checkExisting();

  if (existingId) {
    console.log(`⚠️  Demo community already exists (ID: ${existingId})`);
    console.log("   Cleaning up and re-seeding...\n");
    await cleanupExisting(existingId);
  }

  // Seed everything
  const communityId = await seedCommunity();
  await seedModules(communityId);
  const profileIds = await seedProfiles(communityId);
  const postIds = await seedPosts(communityId, profileIds);
  await seedComments(postIds, profileIds);
  await seedLikes(postIds, profileIds);
  await seedPrograms(communityId);
  await seedTiers(communityId);
  await seedEvents(communityId);
  await seedResources(communityId);

  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║   ✅ Demo seed complete!                  ║");
  console.log("╚══════════════════════════════════════════╝");
  console.log("");
  console.log(`Community: ${DEMO_COMMUNITY_NAME}`);
  console.log(`Slug: ${DEMO_SLUG}`);
  console.log(`ID: ${communityId}`);
  console.log(`URL: /demo or /${DEMO_SLUG}`);
  console.log("");
  console.log("Seeded:");
  console.log(`  • ${MEMBER_PROFILES.length} member profiles`);
  console.log(`  • ${POSTS.length} posts with ${COMMENTS.length} comments`);
  console.log(`  • ${PROGRAMS.length} programs with sections & lessons`);
  console.log(`  • ${MEMBERSHIP_TIERS.length} membership tiers`);
  console.log(`  • ${EVENTS.length} events`);
  console.log(`  • ${RESOURCES.length} resources`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
