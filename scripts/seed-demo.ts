/**
 * Demo Community Seed Script
 *
 * Seeds a "Creator Academy" demo community with rich, realistic data
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
    email: "alex.demo@creatoracademy.com",
    avatar_url: null,
    bio: "Full-stack dev obsessed with Next.js and building cool things. Community founder. 🚀",
    role: "ADMIN",
    tier: "PAID",
  },
  {
    display_name: "Jordan Chen",
    email: "jordan.demo@creatoracademy.com",
    avatar_url: null,
    bio: "UI/UX designer turned developer. Making the web beautiful one component at a time.",
    role: "ADMIN",
    tier: "PAID",
  },
  {
    display_name: "Sam Patel",
    email: "sam.demo@creatoracademy.com",
    avatar_url: null,
    bio: "Backend wizard. If it involves databases or APIs, I'm in.",
    role: "PAID_MEMBER",
    tier: "PAID",
  },
  {
    display_name: "Taylor Kim",
    email: "taylor.demo@creatoracademy.com",
    avatar_url: null,
    bio: "Indie hacker building micro-SaaS products. Currently at 3 launched 🎉",
    role: "PAID_MEMBER",
    tier: "PAID",
  },
  {
    display_name: "Morgan Lee",
    email: "morgan.demo@creatoracademy.com",
    avatar_url: null,
    bio: "Learning to code! Just finished my first React project 💪",
    role: "FREE_MEMBER",
    tier: "FREE",
  },
  {
    display_name: "Casey Brooks",
    email: "casey.demo@creatoracademy.com",
    avatar_url: null,
    bio: "DevOps & cloud infrastructure. Making deployments boring (in a good way).",
    role: "PAID_MEMBER",
    tier: "PAID",
  },
  {
    display_name: "Riley Martinez",
    email: "riley.demo@creatoracademy.com",
    avatar_url: null,
    bio: "Mobile dev with a passion for React Native. Building the next big app.",
    role: "FREE_MEMBER",
    tier: "FREE",
  },
  {
    display_name: "Avery Johnson",
    email: "avery.demo@creatoracademy.com",
    avatar_url: null,
    bio: "Data science meets web dev. Love building dashboards and visualizations.",
    role: "PAID_MEMBER",
    tier: "PAID",
  },
  {
    display_name: "Quinn Davis",
    email: "quinn.demo@creatoracademy.com",
    avatar_url: null,
    bio: "Open source contributor. TypeScript enthusiast. Coffee addict ☕",
    role: "FREE_MEMBER",
    tier: "FREE",
  },
  {
    display_name: "Drew Wilson",
    email: "drew.demo@creatoracademy.com",
    avatar_url: null,
    bio: "Freelance web developer helping small businesses get online.",
    role: "PAID_MEMBER",
    tier: "PAID",
  },
  {
    display_name: "Skyler Nguyen",
    email: "skyler.demo@creatoracademy.com",
    avatar_url: null,
    bio: "Ex-FAANG engineer, now building my own thing. Obsessed with developer tooling.",
    role: "PAID_MEMBER",
    tier: "PAID",
  },
  {
    display_name: "Jamie Reyes",
    email: "jamie.demo@creatoracademy.com",
    avatar_url: null,
    bio: "Content creator and educator. Teaching web dev on YouTube (12K subs!). Here to connect with other creators.",
    role: "PAID_MEMBER",
    tier: "PAID",
  },
];

const POSTS = [
  {
    content: `🚀 Welcome to Creator Academy!\n\nThis is your space to learn, build, and grow as a creator. Here's what you'll find:\n\n• **Programs** — Structured courses on building & monetizing communities\n• **Resources** — Curated tools, templates, and guides\n• **Events** — Live workshops, AMAs, and co-working sessions\n• **Community** — Connect with fellow builders\n\nDrop a comment below and introduce yourself! What are you working on? 👇`,
    visibility: "public",
    pinned: true,
    authorIndex: 0,
    daysAgo: 45,
  },
  {
    content: `Just shipped a new feature using server actions in Next.js 15 and it's 🔥\n\nThe DX improvement over API routes for simple mutations is massive. No more writing fetch calls, managing loading states manually, or dealing with serialization.\n\nHere's a quick before/after:\n\n**Before (API Route):**\n\`\`\`typescript\n// pages/api/update-name.ts\nexport default async function handler(req, res) {\n  const { name } = req.body;\n  await db.user.update({ name });\n  return res.json({ success: true });\n}\n\`\`\`\n\n**After (Server Action):**\n\`\`\`typescript\n"use server"\nasync function updateName(name: string) {\n  await db.user.update({ name });\n  revalidatePath("/profile");\n}\n\`\`\`\n\nAnyone else making the switch? What patterns are you finding useful?`,
    visibility: "members",
    pinned: false,
    authorIndex: 3,
    daysAgo: 38,
  },
  {
    content: `Pro tip: If you're using Supabase with Next.js, set up Row Level Security (RLS) from day one.\n\nI learned this the hard way — retrofitting RLS policies on an existing app is painful. But starting with it means your data is secure by default, even if your server code has a bug.\n\nHere's my go-to starter policy pattern:\n\n\`\`\`sql\nCREATE POLICY "Users can read own data"\nON profiles FOR SELECT\nUSING (auth.uid() = user_id);\n\nCREATE POLICY "Users can update own data"\nON profiles FOR UPDATE\nUSING (auth.uid() = user_id);\n\`\`\`\n\nSaved my bacon more than once! 🥓\n\nWhat security patterns have you found essential?`,
    visibility: "members",
    pinned: false,
    authorIndex: 2,
    daysAgo: 32,
  },
  {
    content: `Weekly wins thread! 🏆\n\nShare what you accomplished this week, no matter how small:\n\n• Landed a new client? 🎉\n• Fixed that nasty bug? 🐛\n• Learned something new? 📚\n• Pushed code to prod? 🚀\n\nEvery step forward counts. Let's celebrate together!`,
    visibility: "members",
    pinned: false,
    authorIndex: 1,
    daysAgo: 28,
  },
  {
    content: `🧵 Thread: My complete tech stack for building SaaS in 2025\n\nAfter building 3 products this year, here's what I've settled on:\n\n**Frontend:**\n• Next.js 15 (App Router)\n• Tailwind CSS + shadcn/ui\n• React Hook Form + Zod\n\n**Backend:**\n• Supabase (Postgres + Auth + Storage + Realtime)\n• Stripe for payments\n• Resend for transactional email\n\n**Infra:**\n• Vercel for hosting\n• Cloudflare for DNS + CDN\n• GitHub Actions for CI/CD\n\n**Dev Tools:**\n• TypeScript (strict mode, always)\n• ESLint + Prettier\n• Cursor as my IDE\n\nTotal monthly cost for a SaaS doing $5K MRR? Under $100.\n\nAnything I'm missing? What would you swap out?`,
    visibility: "members",
    pinned: false,
    authorIndex: 3,
    daysAgo: 25,
  },
  {
    content: `Question for the group: How do you handle environment variables across dev/staging/prod?\n\nI've been using .env.local for dev and Vercel environment variables for prod, but managing secrets across environments is getting messy as my team grows.\n\nAnyone using Doppler, Infisical, or something similar? Is it worth the overhead for a 2-3 person team?`,
    visibility: "members",
    pinned: false,
    authorIndex: 5,
    daysAgo: 22,
  },
  {
    content: `📚 Just finished the "Ship Your SaaS" program here and WOW.\n\nThe section on database design patterns alone saved me weeks of mistakes. I was about to build my multi-tenant app with separate schemas per tenant (nightmare maintenance), and the program showed me why a shared schema with RLS is the way to go.\n\nHighly recommend if you're building anything with Supabase. The Stripe integration walkthrough is also *chef's kiss*.\n\nThanks @Alex for putting this together! 🙏`,
    visibility: "members",
    pinned: false,
    authorIndex: 7,
    daysAgo: 18,
  },
  {
    content: `Hot take: You don't need a design system to ship your MVP.\n\nI see so many devs spending weeks building custom component libraries before they even validate their idea. Here's what I do instead:\n\n1. Pick a good component library (shadcn/ui, Radix, etc.)\n2. Choose a color palette from Tailwind defaults\n3. Use consistent spacing (4, 8, 16, 24, 32)\n4. Ship it.\n\nYou can always refine the design later. Your first 100 users care about the product working, not pixel-perfect margins.\n\nDisagree? Fight me in the comments 😄`,
    visibility: "members",
    pinned: false,
    authorIndex: 1,
    daysAgo: 15,
  },
  {
    content: `🎉 Milestone: Just hit $2K MRR on my invoice generator SaaS!\n\nQuick backstory: Built it as a weekend project 3 months ago after seeing freelancers in this community struggling with invoicing. Launched on Product Hunt, got 47 upvotes, and it's been growing organically since.\n\n**What's working:**\n• Simple landing page with clear pricing\n• 14-day free trial (no credit card)\n• Weekly email with invoicing tips\n• This community for feedback and beta testers!\n\n**What I'd do differently:**\n• Start charging sooner (I was free for too long)\n• Build in public from day 1\n• Focus on one feature, not five\n\nHappy to answer any questions about the journey! 🚀`,
    visibility: "members",
    pinned: false,
    authorIndex: 3,
    daysAgo: 12,
  },
  {
    content: `TIL: You can use the \`useOptimistic\` hook in React 19 for instant UI updates.\n\nInstead of waiting for the server to respond before updating the UI, you can show the expected result immediately and roll back if it fails.\n\n\`\`\`typescript\nconst [optimisticMessages, addOptimistic] = useOptimistic(\n  messages,\n  (state, newMessage) => [...state, newMessage]\n);\n\nasync function sendMessage(formData: FormData) {\n  addOptimistic({ text: formData.get("text"), pending: true });\n  await saveMessage(formData);\n}\n\`\`\`\n\nMakes chat interfaces and like buttons feel SO snappy. Game changer for perceived performance.`,
    visibility: "members",
    pinned: false,
    authorIndex: 10,
    daysAgo: 8,
  },
  {
    content: `Hosting my first live workshop this Friday! 🎬\n\n"Build a Dashboard with Next.js" — we'll go from zero to a deployed analytics dashboard in 90 minutes.\n\nWhat we'll cover:\n• Server components for data fetching\n• Recharts for beautiful charts\n• Real-time updates with Supabase subscriptions\n• Deploy to Vercel\n\nRSVP on the Events page — spots are limited!\n\nAny specific topics you'd like me to cover? Drop them below 👇`,
    visibility: "members",
    pinned: false,
    authorIndex: 0,
    daysAgo: 5,
  },
  {
    content: `Just released my Tailwind CSS component collection as a free resource in the vault! 🎨\n\n50+ production-ready components including:\n• Hero sections\n• Pricing tables\n• Feature grids\n• Testimonial cards\n• Dashboard layouts\n• Auth forms\n\nAll built with shadcn/ui patterns and fully responsive. Check the Resources tab!\n\nDrop a ❤️ if you find it useful — motivates me to add more!`,
    visibility: "public",
    pinned: false,
    authorIndex: 1,
    daysAgo: 3,
  },
  {
    content: `Good morning crew! ☀️\n\nStarting a new project today — a community platform for fitness coaches. Using everything I learned in the Ship Your SaaS program.\n\nDay 1 plan:\n- [x] Project setup (Next.js + Supabase)\n- [x] Auth flow\n- [ ] Database schema\n- [ ] Landing page\n\nGonna build in public here. Who wants to follow along? 🏗️`,
    visibility: "members",
    pinned: false,
    authorIndex: 9,
    daysAgo: 1,
  },
];

const COMMENTS = [
  // Welcome post (index 0)
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
    postIndex: 0,
    authorIndex: 10,
    content:
      "Skyler here! Left big tech to do my own thing. Building developer tools and loving the indie life. Great community already!",
  },
  {
    postIndex: 0,
    authorIndex: 11,
    content:
      "Jamie from YouTube! Really excited to connect with other creators here. This platform looks amazing 🔥",
  },
  // Server actions post (index 1)
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
    postIndex: 1,
    authorIndex: 10,
    content:
      "One thing to watch out for: server actions serialize everything across the network boundary. Make sure you're not accidentally sending large objects. `use server` doesn't mean it runs *only* on the server — the args and return value cross the wire.",
  },
  // RLS post (index 2)
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
    postIndex: 2,
    authorIndex: 5,
    content:
      "I'd add: always test your RLS policies with the Supabase SQL editor using `set role authenticated` before deploying. Saved me from a nasty data leak once.",
  },
  // Weekly wins (index 3)
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
  {
    postIndex: 3,
    authorIndex: 11,
    content:
      "Hit 12K subscribers on my YouTube channel! The coding tutorials are resonating. Thanks for the content ideas, community! 🎬",
  },
  // Tech stack post (index 4)
  {
    postIndex: 4,
    authorIndex: 5,
    content:
      "Solid stack! I'd add Sentry for error monitoring — it's free for small projects and has saved me so many times in prod.",
  },
  {
    postIndex: 4,
    authorIndex: 2,
    content:
      "Have you tried Drizzle ORM instead of raw Supabase queries? The type safety is incredible and it plays nicely with the Supabase Postgres instance.",
  },
  {
    postIndex: 4,
    authorIndex: 10,
    content:
      "Under $100/mo for $5K MRR is wild. The margins on SaaS are ridiculous if you architect things right. I'd also recommend Upstash Redis for caching — their free tier is generous.",
  },
  {
    postIndex: 4,
    authorIndex: 0,
    content:
      "Great breakdown Taylor! This is basically the exact stack we teach in the Ship Your SaaS program. The key insight is keeping it simple — you don't need Kubernetes when Vercel handles scaling for you.",
  },
  // Env variables post (index 5)
  {
    postIndex: 5,
    authorIndex: 2,
    content:
      "We use Doppler at my day job and it's worth it even for small teams. The CLI integration is clean — `doppler run -- npm run dev` and all your env vars are injected. No more .env files to manage.",
  },
  {
    postIndex: 5,
    authorIndex: 10,
    content:
      "For 2-3 people, I'd just use Vercel's built-in env management + a shared 1Password vault for local dev. Doppler is great but might be overkill at your stage.",
  },
  {
    postIndex: 5,
    authorIndex: 3,
    content:
      "I wrote a small script that generates .env.local from a template. Happy to share if anyone wants it!",
  },
  // Ship Your SaaS review (index 6)
  {
    postIndex: 6,
    authorIndex: 0,
    content:
      "Thanks for the kind words Avery! Really glad the database section was helpful. That's actually the most common mistake I see — over-engineering the data layer too early.",
  },
  {
    postIndex: 6,
    authorIndex: 3,
    content:
      "+1 on the Stripe section. I followed it step-by-step for my invoice app and had subscriptions working in an afternoon. The webhook testing tips alone are worth it.",
  },
  // Hot take on design systems (index 7)
  {
    postIndex: 7,
    authorIndex: 6,
    content:
      "As someone who designs AND codes — I partially agree. You don't need a *custom* design system, but you absolutely need *a* system. shadcn/ui IS a design system, just one you didn't build from scratch.",
  },
  {
    postIndex: 7,
    authorIndex: 3,
    content:
      "100% agree. My first SaaS looked terrible by designer standards but converted at 4%. Nobody cared about the border radius.",
  },
  {
    postIndex: 7,
    authorIndex: 9,
    content:
      "This is the permission I needed to hear 😂 I've been spending way too long on my button variants instead of building features.",
  },
  {
    postIndex: 7,
    authorIndex: 11,
    content:
      "I made a whole video about this! \"Stop Designing, Start Shipping\" — it's my most viewed tutorial. The audience AGREES.",
  },
  // $2K MRR milestone (index 8)
  {
    postIndex: 8,
    authorIndex: 0,
    content:
      "LET'S GO! 🎉 This is exactly what this community is about. From weekend project to $2K MRR in 3 months — incredible execution Taylor.",
  },
  {
    postIndex: 8,
    authorIndex: 7,
    content:
      "Congrats! The 14-day free trial without credit card is smart. What's your conversion rate from trial to paid?",
  },
  {
    postIndex: 8,
    authorIndex: 9,
    content:
      "This is so inspiring. I'm building something similar for freelance designers. Would love to chat about your onboarding flow!",
  },
  {
    postIndex: 8,
    authorIndex: 4,
    content:
      "Amazing!! 🚀 The 'start charging sooner' lesson is so real. I made the same mistake with my first project.",
  },
  {
    postIndex: 8,
    authorIndex: 11,
    content:
      "Would you be open to a collab video about your journey? My audience would love this story!",
  },
  // useOptimistic post (index 9)
  {
    postIndex: 9,
    authorIndex: 2,
    content:
      "This is fantastic! We're using this pattern for our like/unlike buttons and the UX improvement is noticeable. Users feel like the app is instant.",
  },
  {
    postIndex: 9,
    authorIndex: 5,
    content:
      "How do you handle the rollback case? If the server fails, does the UI automatically revert? Or do you need to handle that manually?",
  },
  {
    postIndex: 9,
    authorIndex: 10,
    content:
      "The rollback is automatic! If the server action throws, React reverts to the previous state. You can also catch and show an error toast. It's really well designed.",
  },
  // Workshop announcement (index 10)
  {
    postIndex: 10,
    authorIndex: 7,
    content:
      "RSVP'd! Can you cover how to set up real-time subscriptions for the chart data? That's the part I always struggle with.",
  },
  {
    postIndex: 10,
    authorIndex: 4,
    content:
      "So excited for this! Will there be a recording for those of us in different time zones? 🌍",
  },
  {
    postIndex: 10,
    authorIndex: 0,
    content:
      "Yes! Recording will be available in the Resources vault within 24 hours after the session. 🎥",
  },
  // Tailwind components (index 11)
  {
    postIndex: 11,
    authorIndex: 9,
    content:
      "OMG the pricing table component alone is worth it. Just dropped it into my project and it looks incredible. Thank you Jordan! ❤️",
  },
  {
    postIndex: 11,
    authorIndex: 3,
    content:
      "The dashboard layouts are exactly what I needed for my SaaS. Saved me hours of work. You're a legend!",
  },
  {
    postIndex: 11,
    authorIndex: 6,
    content:
      "These are beautiful! Any plans to add a dark mode variant? Some of the hero sections assume a light background.",
  },
  {
    postIndex: 11,
    authorIndex: 1,
    content:
      "Great feedback Riley! Dark mode variants are coming in the next update. Stay tuned 🌙",
  },
  // Build in public post (index 12)
  {
    postIndex: 12,
    authorIndex: 3,
    content:
      "Following! Build in public is the way. I documented my entire invoice app journey and it helped me stay accountable AND attract early users.",
  },
  {
    postIndex: 12,
    authorIndex: 0,
    content:
      "Love this Drew! The Ship Your SaaS program has a whole section on building in public. Make sure to share your database schema when you design it — the community gives great feedback.",
  },
  {
    postIndex: 12,
    authorIndex: 4,
    content:
      "A community platform for fitness coaches sounds amazing! My sister is a personal trainer and she'd definitely use something like that. Keep us posted! 💪",
  },
];

const PROGRAMS = [
  {
    title: "Creator Fundamentals",
    description:
      "Master the foundations of building an online community. Learn to create engaging content, build an audience, and design a compelling member experience.",
    visibility: "members",
    published: true,
    thumbnail_url: null,
    sections: [
      {
        title: "Getting Started",
        lessons: [
          {
            title: "Welcome & Community Setup",
            content:
              "Welcome to Creator Fundamentals! In this lesson, we'll set up your community foundation and get familiar with the tools we'll use throughout the course.\n\n## What You'll Learn\n\n- How to define your community's mission and values\n- Setting up your platform and branding\n- Creating your first content pieces\n- Building an inviting member experience\n\n## Your Community Blueprint\n\n1. **Mission Statement** — Why does your community exist?\n2. **Target Audience** — Who are you serving?\n3. **Value Proposition** — What unique value do members get?\n4. **Content Strategy** — What will you teach and share?\n\nLet's build something people love! 🚀",
            published: true,
          },
          {
            title: "Content Strategy Essentials",
            content:
              "A strong content strategy is the backbone of any thriving community. We'll cover content types, posting cadence, and how to create content that drives engagement.\n\n## Key Concepts\n\n- The 3 types of community content (Educational, Conversational, Celebratory)\n- Finding your posting rhythm\n- Repurposing content across platforms\n- Using member questions as content inspiration\n\n## The Content Mix\n\n| Type | Frequency | Purpose |\n|------|-----------|----------|\n| Educational | 2-3x/week | Teach and add value |\n| Conversational | Daily | Drive engagement |\n| Celebratory | Weekly | Build culture |\n\nConsistency beats perfection. Start with what you can sustain.",
            published: true,
          },
          {
            title: "Building Your Brand Voice",
            content:
              "Your brand voice is how your community feels. Learn to develop a consistent, authentic voice that resonates with your audience.\n\n## Topics Covered\n\n- Defining your brand personality\n- Writing guidelines for consistency\n- Tone vs. voice (and why both matter)\n- Examples from successful communities\n\n## Exercise\n\nWrite three versions of a welcome post:\n1. Professional & authoritative\n2. Casual & friendly\n3. Energetic & motivational\n\nWhich one feels most like YOU? That's your voice.",
            published: true,
          },
        ],
      },
      {
        title: "Growing Your Audience",
        lessons: [
          {
            title: "Your First 100 Members",
            content:
              "The hardest members to get are the first 100. Here's a battle-tested playbook for building your initial audience.\n\n## The Launch Playbook\n\n1. **Personal Network** (Members 1-20) — Friends, colleagues, existing audience\n2. **Content Marketing** (Members 20-50) — Blog posts, social media, podcasts\n3. **Strategic Partnerships** (Members 50-100) — Guest posts, collaborations, cross-promotions\n\n## Key Metrics to Track\n\n- Member sign-up rate\n- Activation rate (members who post within 7 days)\n- Retention (members still active after 30 days)",
            published: true,
          },
          {
            title: "Engagement & Retention",
            content:
              "Getting members is one thing. Keeping them engaged is another. Learn proven strategies for building a sticky community.\n\n## Engagement Frameworks\n\n- **Welcome Sequence** — Automated onboarding that makes new members feel valued\n- **Weekly Rituals** — Recurring events that build habits (Win Wednesday, Feedback Friday)\n- **Recognition Programs** — Celebrating member achievements\n- **Accountability Groups** — Small groups that drive commitment",
            published: true,
          },
          {
            title: "Scaling to 1,000 Members",
            content:
              "Strategies for growing beyond your initial audience. Paid acquisition, partnerships, and building a referral engine.",
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
              "Before writing a single line of code, make sure you're building something people want.\n\n## The Validation Framework\n\n1. **Problem Interview** — Talk to 10 potential users\n2. **Solution Sketch** — Low-fidelity mockup\n3. **Landing Page Test** — Measure interest with a waitlist\n4. **Pre-sell** — Get commitments before building\n\nMost failed products skip this step. Don't be one of them.\n\n## Questions to Ask in Problem Interviews\n\n- \"What's the hardest part about [problem area]?\"\n- \"How are you currently solving this?\"\n- \"What would your ideal solution look like?\"\n- \"Would you pay $X/month for a solution?\"\n\n## Success Criteria\n\nYou're ready to build when:\n- 7/10 interviewees have the problem\n- 5/10 are actively looking for a solution\n- 3/10 would pay for your specific solution",
            published: true,
          },
          {
            title: "Tech Stack Setup",
            content:
              "Setting up the production-ready tech stack: Next.js 15, Supabase, Stripe, Vercel.\n\n## Architecture Overview\n\n- **Frontend:** Next.js with App Router\n- **Database:** Supabase (Postgres + Auth + Storage)\n- **Payments:** Stripe\n- **Hosting:** Vercel\n- **Email:** Resend\n\n## Project Structure\n\n```\n├── app/              # Next.js App Router\n│   ├── (auth)/       # Auth pages\n│   ├── (dashboard)/  # Protected pages\n│   └── api/          # API routes\n├── components/       # Reusable components\n├── lib/              # Utilities & configs\n├── supabase/         # Migrations & seeds\n└── types/            # TypeScript types\n```\n\n## Environment Setup\n\n1. Clone the starter template\n2. Install dependencies with `npm install`\n3. Set up Supabase project\n4. Configure environment variables\n5. Run `npm run dev` — you're live!",
            published: true,
          },
          {
            title: "Database Design Patterns",
            content:
              "Design a scalable database schema for your SaaS. Multi-tenancy, RLS policies, and migration strategies.\n\n## Multi-Tenancy Approaches\n\n| Approach | Pros | Cons |\n|----------|------|------|\n| Separate DBs | Full isolation | Expensive, hard to manage |\n| Separate schemas | Good isolation | Migration complexity |\n| **Shared schema + RLS** | Simple, scalable | Requires careful policies |\n\n## Recommended: Shared Schema + RLS\n\n```sql\n-- Every table gets a tenant_id\nALTER TABLE todos ADD COLUMN org_id UUID REFERENCES orgs(id);\n\n-- RLS ensures data isolation\nCREATE POLICY \"tenant_isolation\" ON todos\n  USING (org_id = current_user_org_id());\n```\n\nThis gives you the simplicity of one database with the security of full isolation.",
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
              "Implement secure authentication with Clerk or Supabase Auth. User profiles, roles, and permissions.\n\n## Auth Options Compared\n\n- **Clerk** — Beautiful UI, easy setup, webhook-based sync\n- **Supabase Auth** — Built-in, free, deep database integration\n- **NextAuth** — Flexible, many providers, self-hosted\n\n## Implementation Steps\n\n1. Choose your auth provider\n2. Set up sign-in/sign-up pages\n3. Create user profiles table\n4. Implement role-based access control\n5. Add middleware for route protection",
            published: true,
          },
          {
            title: "Subscription Billing with Stripe",
            content:
              "Integrate Stripe for recurring payments. Checkout sessions, webhooks, customer portal, and pricing tiers.\n\n## The Billing Stack\n\n1. **Stripe Products** — Define your pricing tiers\n2. **Checkout Sessions** — Hosted payment pages\n3. **Webhooks** — Sync subscription status\n4. **Customer Portal** — Self-service management\n\n## Webhook Events to Handle\n\n- `checkout.session.completed` → Create subscription\n- `customer.subscription.updated` → Sync tier changes\n- `customer.subscription.deleted` → Handle cancellation\n- `invoice.payment_failed` → Notify user & retry\n\n## Pro Tips\n\n- Always verify webhook signatures\n- Use idempotency keys for retries\n- Test with Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`",
            published: true,
          },
          {
            title: "Launch Checklist",
            content:
              "Everything you need to do before and after launch. SEO, analytics, monitoring, and your first 100 users.\n\n## Pre-Launch Checklist\n\n- [ ] Security audit (RLS, CORS, rate limiting)\n- [ ] Performance testing (Lighthouse > 90)\n- [ ] Error monitoring (Sentry)\n- [ ] Analytics (PostHog or Vercel Analytics)\n- [ ] SEO basics (meta tags, sitemap, robots.txt)\n- [ ] Legal (ToS, Privacy Policy)\n\n## Launch Day\n\n- [ ] ProductHunt submission\n- [ ] Hacker News Show HN\n- [ ] Twitter/X announcement thread\n- [ ] Email your waitlist\n- [ ] Post in relevant communities\n\n## Post-Launch (Week 1)\n\n- [ ] Monitor error rates\n- [ ] Respond to every user message\n- [ ] Ship one improvement daily\n- [ ] Collect testimonials",
            published: true,
          },
        ],
      },
    ],
  },
  {
    title: "Monetization Mastery",
    description:
      "Turn your community into a sustainable business. Learn pricing psychology, membership models, upselling strategies, and how to build recurring revenue.",
    visibility: "members",
    published: true,
    thumbnail_url: null,
    sections: [
      {
        title: "Pricing & Positioning",
        lessons: [
          {
            title: "Pricing Psychology 101",
            content:
              "Pricing is as much psychology as it is math. Learn the principles that drive purchase decisions.\n\n## Core Pricing Principles\n\n### 1. Anchoring\nAlways show your most expensive plan first. It makes everything else feel like a deal.\n\n### 2. The Decoy Effect\nOffer three plans where the middle option is the obvious best value. The expensive plan makes the middle look reasonable.\n\n### 3. Price Endings\n- $99 feels significantly cheaper than $100\n- $97 suggests a deal\n- $100 suggests premium\n\n### 4. Annual Discounts\nOffer 2 months free on annual billing. It increases LTV AND reduces churn.\n\n## Exercise\n\nDesign a 3-tier pricing page for your community. Which plan do you WANT people to choose? Design the page to guide them there.",
            published: true,
          },
          {
            title: "Membership Models That Work",
            content:
              "Explore different membership models and find the right one for your community.\n\n## Popular Models\n\n### 1. Freemium + Premium\n- Free tier: Community access, limited content\n- Paid tier: Full library, events, resources\n- Best for: Large audiences, top-of-funnel growth\n\n### 2. Single Tier\n- One price, full access\n- Best for: Niche communities, simplicity\n\n### 3. Tiered Access\n- 2-3 levels with escalating benefits\n- Best for: Diverse audiences, maximizing revenue\n\n### 4. Cohort-Based\n- Fixed enrollment periods\n- Best for: Course-driven communities\n\n## What the Data Says\n\n- Communities with free tiers grow 3x faster\n- Tiered pricing increases ARPU by 40%\n- Annual plans reduce churn by 60%",
            published: true,
          },
          {
            title: "Setting Your First Price",
            content:
              "A practical framework for choosing your initial price point.\n\n## The Pricing Formula\n\n1. **Cost** — What does it cost you to deliver? (time, tools, hosting)\n2. **Value** — What's the outcome worth to members?\n3. **Market** — What are similar communities charging?\n4. **Goal** — What revenue do you need?\n\n## Rule of Thumb\n\nCharge 10% of the value you create. If your community helps someone earn $5K more per year, $50/month is a no-brainer.\n\n## Start Here\n\n- $0-29/mo: Information & community access\n- $29-99/mo: Structured programs + community\n- $99-299/mo: Programs + coaching + exclusive access\n- $299+/mo: Done-with-you services + community",
            published: true,
          },
        ],
      },
      {
        title: "Revenue Growth",
        lessons: [
          {
            title: "Reducing Churn",
            content:
              "Every 1% reduction in churn compounds dramatically over time. Here are proven strategies to keep members engaged and paying.\n\n## Churn Triggers\n\n1. **No quick wins** — Members who don't see value in 7 days leave\n2. **Content fatigue** — Same format every week\n3. **No connection** — Members who don't know anyone leave\n4. **Life changes** — Budget cuts, career shifts\n\n## Anti-Churn Playbook\n\n- **Onboarding email sequence** (Days 1, 3, 7, 14)\n- **Win tracking** — Help members see their progress\n- **Community connections** — Introduce members to each other\n- **Cancellation survey** — Understand why and offer alternatives\n- **Win-back campaign** — Re-engage canceled members after 30 days",
            published: true,
          },
          {
            title: "Upselling & Expansion Revenue",
            content:
              "Grow revenue without adding new members. Upsells, add-ons, and tier upgrades.\n\n## Revenue Expansion Strategies\n\n- **Tier upgrades** — Show the value of the next level\n- **One-time workshops** — Premium live events\n- **1-on-1 coaching** — High-ticket add-on\n- **Digital products** — Templates, courses, tools\n- **Affiliate partnerships** — Curated tool recommendations",
            published: true,
          },
          {
            title: "Building a Revenue Flywheel",
            content:
              "Create a self-sustaining growth engine where happy members drive new members who become happy members.\n\nThe flywheel: Great Content → Member Results → Testimonials → New Members → More Content → Better Results → ...\n\nThis is the ultimate moat for a community business.",
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
  // Past events (make the community feel lived-in)
  {
    title: "Workshop: Landing Page That Converts",
    description:
      "Learn the anatomy of a high-converting landing page. We built one live from scratch and hit 12% signup rate in the first week.",
    visibility: "members",
    location: "Zoom",
    starts_at: getPastDate(45),
    ends_at: getPastDate(45, -2),
    external_url: null,
  },
  {
    title: "AMA: From 0 to $5K MRR in 6 Months",
    description:
      "Taylor shared their journey building micro-SaaS products. 47 members attended and we covered pricing, marketing, and technical architecture.",
    visibility: "members",
    location: "Discord Voice",
    starts_at: getPastDate(30),
    ends_at: getPastDate(30, -1.5),
    external_url: null,
  },
  {
    title: "Co-Working Session: Ship It Saturday",
    description:
      "Our first co-working session! 23 members joined to work on their projects together. Great energy and accountability.",
    visibility: "members",
    location: "Zoom",
    starts_at: getPastDate(14),
    ends_at: getPastDate(14, -4),
    external_url: null,
  },
  // Upcoming events
  {
    title: "Live Coding: Build a Dashboard with Next.js",
    description:
      "Watch Alex build a real-time analytics dashboard from scratch using Next.js, Supabase, and Recharts. Ask questions live!\n\nWhat we'll cover:\n• Server components for data fetching\n• Recharts for beautiful charts\n• Real-time updates with Supabase subscriptions\n• Deploy to Vercel\n\nBring your questions!",
    visibility: "members",
    location: "Zoom (link shared in community)",
    starts_at: getFutureDate(5),
    ends_at: getFutureDate(5, 2),
    external_url: "https://zoom.us/demo",
  },
  {
    title: "Workshop: Mastering TypeScript Generics",
    description:
      "A deep-dive hands-on workshop on TypeScript generics. We'll build type-safe utility functions and understand conditional types.\n\nPerfect for intermediate TypeScript devs who want to level up their type game.",
    visibility: "members",
    location: "Zoom (link shared 1hr before)",
    starts_at: getFutureDate(12),
    ends_at: getFutureDate(12, 3),
    external_url: null,
  },
  {
    title: "Monthly Mastermind: Revenue Goals Check-in",
    description:
      "Monthly accountability session where we review our revenue goals, share what's working, and help each other overcome blockers.\n\nOpen to all members — bring your metrics and questions!",
    visibility: "members",
    location: "Google Meet",
    starts_at: getFutureDate(19),
    ends_at: getFutureDate(19, 1.5),
    external_url: null,
  },
  {
    title: "Guest Speaker: Building in Public with @dannypostma",
    description:
      "Special guest Danny Postma shares how building in public helped him grow Headlime to $1M+ ARR. Live Q&A included!\n\nDon't miss this one — Danny has incredible insights on indie hacking and content marketing.",
    visibility: "members",
    location: "Zoom",
    starts_at: getFutureDate(28),
    ends_at: getFutureDate(28, 1.5),
    external_url: null,
  },
];

const RESOURCES = [
  {
    title: "Next.js Project Starter Template",
    description:
      "A production-ready Next.js 15 template with Auth, Supabase, Tailwind, and shadcn/ui pre-configured. Clone and start building in minutes.",
    type: "link" as const,
    url: "https://github.com/example/nextjs-starter",
    folder: "Templates",
    visibility: "members" as const,
  },
  {
    title: "The Indie Hacker's Launch Checklist",
    description:
      "A comprehensive 50-point checklist for launching your SaaS or community. From domain setup to ProductHunt strategy.",
    type: "link" as const,
    url: "https://example.com/launch-checklist",
    folder: "Guides",
    visibility: "public" as const,
  },
  {
    title: "Tailwind CSS Cheat Sheet",
    description:
      "Quick reference for Tailwind utility classes. Spacing, typography, flexbox, grid, colors, and responsive breakpoints.",
    type: "link" as const,
    url: "https://tailwindcomponents.com/cheatsheet",
    folder: "Cheat Sheets",
    visibility: "public" as const,
  },
  {
    title: "Supabase RLS Policy Templates",
    description:
      "Copy-paste Row Level Security policies for common patterns: user data, team access, admin overrides, and multi-tenant setups.",
    type: "link" as const,
    url: "https://example.com/rls-templates",
    folder: "Templates",
    visibility: "members" as const,
  },
  {
    title: "Tailwind Component Collection (50+ components)",
    description:
      "Production-ready UI components: hero sections, pricing tables, feature grids, testimonials, dashboards, and auth forms. All responsive.",
    type: "link" as const,
    url: "https://example.com/tailwind-components",
    folder: "Templates",
    visibility: "members" as const,
  },
  {
    title: "Community Content Calendar Template",
    description:
      "A Notion template for planning your community content. Includes weekly themes, post templates, and engagement tracking.",
    type: "link" as const,
    url: "https://example.com/content-calendar",
    folder: "Templates",
    visibility: "members" as const,
  },
  {
    title: "Pricing Page Design Guide",
    description:
      "How to design a pricing page that converts. Includes psychological pricing tactics, layout patterns, and A/B testing strategies.",
    type: "link" as const,
    url: "https://example.com/pricing-guide",
    folder: "Guides",
    visibility: "members" as const,
  },
  {
    title: "Stripe Integration Cookbook",
    description:
      "Step-by-step recipes for common Stripe integrations: subscriptions, one-time payments, metered billing, and customer portal.",
    type: "link" as const,
    url: "https://example.com/stripe-cookbook",
    folder: "Guides",
    visibility: "members" as const,
  },
  {
    title: "SaaS Metrics Dashboard (Google Sheets)",
    description:
      "Track MRR, churn, LTV, and CAC with this pre-built Google Sheets dashboard. Just plug in your numbers.",
    type: "link" as const,
    url: "https://docs.google.com/spreadsheets/example",
    folder: "Tools",
    visibility: "public" as const,
  },
  {
    title: "Email Sequence Templates",
    description:
      "7 proven email sequences: welcome series, onboarding, re-engagement, upsell, win-back, launch, and weekly digest.",
    type: "link" as const,
    url: "https://example.com/email-templates",
    folder: "Templates",
    visibility: "members" as const,
  },
  {
    title: "SEO Checklist for SaaS",
    description:
      "A technical SEO checklist specifically for SaaS products. Meta tags, structured data, sitemap, Core Web Vitals, and content strategy.",
    type: "link" as const,
    url: "https://example.com/seo-checklist",
    folder: "Cheat Sheets",
    visibility: "public" as const,
  },
  {
    title: "Workshop Recording: Landing Pages That Convert",
    description:
      "Recording of our live workshop on building high-converting landing pages. Includes the live build and Q&A.",
    type: "link" as const,
    url: "https://example.com/workshop-recording-lp",
    folder: "Recordings",
    visibility: "members" as const,
  },
];

// ============================================================================
// Helpers
// ============================================================================

function getFutureDate(daysAhead: number, hoursOffset = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  date.setHours(18 + hoursOffset, 0, 0, 0); // Default 6 PM ET
  return date.toISOString();
}

function getPastDate(daysAgo: number, hoursOffset = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(18 + Math.abs(hoursOffset), 0, 0, 0);
  return date.toISOString();
}

function getTimestampDaysAgo(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  // Random hour between 8 AM and 10 PM
  date.setHours(8 + Math.floor(Math.random() * 14), Math.floor(Math.random() * 60), 0, 0);
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
        "Master the art of building and monetizing online communities. Join 500+ creators learning to build sustainable businesses around their expertise.",
      primary_color: "#6366f1",
      accent_color: "#8b5cf6",
      logo_url: null,
      status: "active",
      billing_status: "active",
      settings_json: {
        welcome_message: "Welcome to Creator Academy! 🚀",
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

  const profiles = MEMBER_PROFILES.map((p, i) => ({
    display_name: p.display_name,
    avatar_url: p.avatar_url,
    bio: p.bio,
    role: p.role,
    tier: p.tier,
    community_id: communityId,
    clerk_user_id: `demo_${p.email.split("@")[0]}_${Date.now()}_${i}`,
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

  // Insert posts one at a time to set created_at properly
  const postIds: string[] = [];

  for (const p of POSTS) {
    const { data, error } = await supabase
      .from("posts")
      .insert({
        community_id: communityId,
        author_profile_id: profileIds[p.authorIndex],
        content: p.content,
        visibility: p.visibility,
        pinned: p.pinned,
        media_urls: [],
        created_at: getTimestampDaysAgo(p.daysAgo),
      })
      .select("id")
      .single();

    if (error) {
      console.error(`Failed to create post:`, error.message);
      continue;
    }

    postIds.push(data.id);
  }

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

  // Give each post some random likes, with more popular posts getting more
  const likes: { post_id: string; profile_id: string }[] = [];

  postIds.forEach((postId, postIndex) => {
    // Vary like counts: pinned/milestone posts get more likes
    let likeCount: number;
    if (postIndex === 0) likeCount = 10; // Welcome post: everyone likes
    else if (postIndex === 8) likeCount = 9; // $2K MRR milestone
    else if (postIndex === 11) likeCount = 8; // Free components
    else likeCount = 3 + Math.floor(Math.random() * 6);

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
      const isPast = new Date(event.starts_at) < new Date();
      console.log(`   ✅ ${isPast ? "(past)" : "(upcoming)"} ${event.title}`);
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
    "content_tier_requirements",
    "profiles",
    "community_modules",
  ];

  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq("community_id", communityId);

      if (error && !error.message.includes("does not exist")) {
        // Some tables might not have community_id directly — that's OK
      }
    } catch {
      // Ignore errors for tables that don't exist
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
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║   KLASS Demo Community Seeder (Rich v2)      ║");
  console.log("╚══════════════════════════════════════════════╝");
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

  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║   ✅ Demo seed complete!                      ║");
  console.log("╚══════════════════════════════════════════════╝");
  console.log("");
  console.log(`Community: ${DEMO_COMMUNITY_NAME}`);
  console.log(`Slug: ${DEMO_SLUG}`);
  console.log(`ID: ${communityId}`);
  console.log(`URL: /demo`);
  console.log("");
  console.log("Seeded:");
  console.log(`  • ${MEMBER_PROFILES.length} member profiles (${MEMBER_PROFILES.filter(p => p.role === 'ADMIN').length} admins, ${MEMBER_PROFILES.filter(p => p.tier === 'PAID').length} paid, ${MEMBER_PROFILES.filter(p => p.tier === 'FREE').length} free)`);
  console.log(`  • ${POSTS.length} posts with ${COMMENTS.length} comments`);
  console.log(`  • ${PROGRAMS.length} programs with ${PROGRAMS.reduce((acc, p) => acc + p.sections.reduce((a, s) => a + s.lessons.length, 0), 0)} total lessons`);
  console.log(`  • ${MEMBERSHIP_TIERS.length} membership tiers`);
  console.log(`  • ${EVENTS.length} events (${EVENTS.filter(e => new Date(e.starts_at) < new Date()).length} past, ${EVENTS.filter(e => new Date(e.starts_at) >= new Date()).length} upcoming)`);
  console.log(`  • ${RESOURCES.length} resources across ${[...new Set(RESOURCES.map(r => r.folder))].length} folders`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
