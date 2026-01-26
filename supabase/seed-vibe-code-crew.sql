-- ============================================
-- SEED: Vibe Code Crew Community
-- ============================================
-- The flagship dogfood community for KLASS
-- Based on the Vibe Code Crew Community Plan
-- This also serves as the demo community

-- ============================================
-- 1. COMMUNITY
-- ============================================

INSERT INTO communities (id, name, slug, description, logo_url, primary_color, accent_color, settings_json)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Vibe Code Crew',
  'vibe-code-crew',
  'Learn to build real apps with AI-assisted (vibe) coding. No coding background required. Ship your own products and hold each other accountable.',
  NULL,
  '#1a1a2e',
  '#6366f1',
  '{
    "layout_mode": "sidebar",
    "show_leaderboard": true,
    "show_about_page": true,
    "banner_description": "The community where non-devs learn to build real apps with AI. Join the crew, ship your products.",
    "chat_settings": {
      "enabled": true,
      "provider": "discord",
      "invite_url": "https://discord.gg/vibecodecrew",
      "visibility": "members"
    }
  }'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  primary_color = EXCLUDED.primary_color,
  accent_color = EXCLUDED.accent_color,
  settings_json = EXCLUDED.settings_json;

-- ============================================
-- 2. COMMUNITY MODULES
-- ============================================

INSERT INTO community_modules (community_id, key, label, enabled, order_index)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'feed', 'Community', true, 0),
  ('00000000-0000-0000-0000-000000000001', 'programs', 'Courses', true, 1),
  ('00000000-0000-0000-0000-000000000001', 'resources', 'Resources', true, 2),
  ('00000000-0000-0000-0000-000000000001', 'events', 'Events', true, 3),
  ('00000000-0000-0000-0000-000000000001', 'members', 'Members', true, 4)
ON CONFLICT (community_id, key) DO UPDATE SET
  label = EXCLUDED.label,
  enabled = EXCLUDED.enabled,
  order_index = EXCLUDED.order_index;

-- ============================================
-- 3. POST CATEGORIES
-- ============================================

INSERT INTO post_categories (id, community_id, name, slug, color, display_order)
VALUES
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'Wins', 'wins', '#22c55e', 0),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 'Questions', 'questions', '#3b82f6', 1),
  ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000001', 'Show & Tell', 'show-and-tell', '#8b5cf6', 2),
  ('00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000001', 'Resources', 'resources', '#f59e0b', 3),
  ('00000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000001', 'General', 'general', '#6b7280', 4),
  ('00000000-0000-0000-0000-000000000106', '00000000-0000-0000-0000-000000000001', 'Introductions', 'introductions', '#ec4899', 5)
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. PROGRAMS (COURSES)
-- ============================================

-- Program 1: Month 1 Foundations
INSERT INTO programs (id, community_id, title, description, visibility, published, order_index)
VALUES (
  '00000000-0000-0000-0000-000000000201',
  '00000000-0000-0000-0000-000000000001',
  'Month 1: Foundations',
  'Your journey starts here. Set up your dev environment, learn prompting techniques, and deploy your first app — all in your first month. No coding background needed.',
  'members',
  true,
  0
)
ON CONFLICT DO NOTHING;

-- Program 2: Month 2 Real Features
INSERT INTO programs (id, community_id, title, description, visibility, published, order_index)
VALUES (
  '00000000-0000-0000-0000-000000000202',
  '00000000-0000-0000-0000-000000000001',
  'Month 2: Real Features',
  'Now that you have the basics, learn to build real features: authentication, databases, payments, and API integrations.',
  'members',
  true,
  1
)
ON CONFLICT DO NOTHING;

-- Program 3: Month 3 Deploy & Monetize
INSERT INTO programs (id, community_id, title, description, visibility, published, order_index)
VALUES (
  '00000000-0000-0000-0000-000000000203',
  '00000000-0000-0000-0000-000000000001',
  'Month 3: Deploy & Monetize',
  'Take your app live. Learn deployment, custom domains, landing pages, and how to get your first paying users.',
  'members',
  false,
  2
)
ON CONFLICT DO NOTHING;

-- Program 4: Month 4 Advanced
INSERT INTO programs (id, community_id, title, description, visibility, published, order_index)
VALUES (
  '00000000-0000-0000-0000-000000000204',
  '00000000-0000-0000-0000-000000000001',
  'Month 4: Advanced',
  'Level up with AI features, real-time capabilities, mobile apps, and scaling techniques.',
  'members',
  false,
  3
)
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. PROGRAM SECTIONS (Modules)
-- ============================================

-- Month 1 sections
INSERT INTO program_sections (id, program_id, title, description, order_index)
VALUES
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000201', 'Setting Up Your Environment', 'Get your tools ready for vibe coding', 0),
  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000201', 'Prompting Like a Pro', 'Master the art of talking to AI', 1),
  ('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000201', 'Your First App', 'Go from idea to deployed in a weekend', 2),
  ('00000000-0000-0000-0000-000000000304', '00000000-0000-0000-0000-000000000201', 'Understanding the Stack', 'React, Next.js, Supabase — in plain English', 3)
ON CONFLICT DO NOTHING;

-- Month 2 sections
INSERT INTO program_sections (id, program_id, title, description, order_index)
VALUES
  ('00000000-0000-0000-0000-000000000305', '00000000-0000-0000-0000-000000000202', 'Authentication', 'Login, signup, and user accounts', 0),
  ('00000000-0000-0000-0000-000000000306', '00000000-0000-0000-0000-000000000202', 'Database Design', 'Storing and retrieving data with Supabase', 1),
  ('00000000-0000-0000-0000-000000000307', '00000000-0000-0000-0000-000000000202', 'Payments with Stripe', 'Accept money from your users', 2),
  ('00000000-0000-0000-0000-000000000308', '00000000-0000-0000-0000-000000000202', 'API Basics', 'Connect to external services', 3)
ON CONFLICT DO NOTHING;

-- ============================================
-- 6. LESSONS
-- ============================================

-- Month 1 > Setting Up Your Environment
INSERT INTO lessons (id, program_id, section_id, title, content, video_url, order_index, visibility, published)
VALUES
  ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000301',
   'Welcome to Vibe Code Crew',
   '# Welcome to Vibe Code Crew! 🎉

You''re about to learn how to build real, working apps using AI — without any prior coding experience.

## What is Vibe Coding?

Vibe coding is using AI tools like Claude, Cursor, and ChatGPT to write code for you. You provide the vision, the AI provides the code. Think of it like being an architect — you design the building, AI does the construction.

## What You''ll Build

By the end of this course, you''ll have:
- A fully deployed web app
- Users who can sign up and log in
- A database storing real data
- Payments (yes, you''ll accept real money)

## How This Works

1. **Watch the videos** — Short, practical walkthroughs
2. **Follow along** — Build as you learn
3. **Complete the challenges** — Weekly build challenges keep you shipping
4. **Ask questions** — Use the community feed when you''re stuck

Let''s go! 🚀',
   NULL, 0, 'members', true),

  ('00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000301',
   'Installing Your Tools (Claude Code, Cursor, VS Code)',
   '# Setting Up Your Dev Environment

Before we start building, let''s get your tools installed. This takes about 15 minutes.

## Tools You''ll Need

### 1. VS Code (Free)
Your code editor. This is where you''ll see and edit files.
- Download: [code.visualstudio.com](https://code.visualstudio.com)
- Install it like any other app

### 2. Cursor (Free tier available)
An AI-powered code editor built on VS Code. This is your secret weapon.
- Download: [cursor.com](https://cursor.com)
- It looks and works like VS Code but with AI built in

### 3. Claude (Subscription recommended)
The AI that writes your code. Claude is the best at understanding what you want.
- Sign up: [claude.ai](https://claude.ai)
- Pro plan ($20/mo) recommended for serious building

### 4. Node.js
The runtime that makes JavaScript work on your computer.
- Download: [nodejs.org](https://nodejs.org) (LTS version)
- Verify: Open terminal and type `node --version`

### 5. Git
Version control — saves your work and lets you undo mistakes.
- Mac: Already installed (or install via Homebrew)
- Windows: Download from [git-scm.com](https://git-scm.com)

## ✅ Challenge
Get all 5 tools installed and post a screenshot in the community feed with the #wins tag!',
   NULL, 1, 'members', true),

  ('00000000-0000-0000-0000-000000000403', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000301',
   'Your Terminal is Your Friend',
   '# Getting Comfortable with the Terminal

The terminal (or command line) might look scary, but it''s just a text-based way to talk to your computer.

## Basic Commands

| Command | What it does |
|---------|-------------|
| `cd folder-name` | Go into a folder |
| `cd ..` | Go back one folder |
| `ls` | List files in current folder |
| `mkdir my-project` | Create a new folder |
| `code .` | Open VS Code here |

## Creating Your First Project Folder

```bash
mkdir my-first-app
cd my-first-app
code .
```

That''s it! You just created a project folder and opened it in VS Code.

## Pro Tips
- Use **Tab** to auto-complete file/folder names
- Use **Up arrow** to repeat the last command
- **Ctrl+C** stops anything running

Don''t worry about memorizing everything. You''ll learn by doing.',
   NULL, 2, 'members', true)
ON CONFLICT DO NOTHING;

-- Month 1 > Prompting Like a Pro
INSERT INTO lessons (id, program_id, section_id, title, content, video_url, order_index, visibility, published)
VALUES
  ('00000000-0000-0000-0000-000000000404', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000302',
   'The Art of Prompting',
   '# Prompting Techniques That Actually Work

The #1 skill in vibe coding isn''t coding — it''s communicating with AI. Here''s how to get the best results.

## The Golden Rule

**Be specific, not vague.**

❌ Bad: "Make me an app"
✅ Good: "Create a Next.js 15 app with a landing page that has a hero section, feature grid, and email signup form using Tailwind CSS"

## The SPEC Framework

1. **S**tack — Tell it what technologies to use
2. **P**urpose — Explain what the app does
3. **E**xamples — Show it what you want (screenshots, links)
4. **C**onstraints — Set boundaries (no TypeScript errors, mobile-friendly)

## Example Prompt

```
Build a task management app using:
- Next.js 15 with App Router
- Tailwind CSS for styling
- Supabase for the database

Features:
- Users can create, edit, and delete tasks
- Tasks have a title, description, and due date
- Tasks can be marked as complete
- Sort tasks by due date

Make it look clean and modern. Use shadcn/ui components.
```

This prompt is specific, clear, and gives the AI everything it needs.',
   NULL, 0, 'members', true),

  ('00000000-0000-0000-0000-000000000405', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000302',
   'Iterating and Debugging with AI',
   '# When Things Go Wrong (And They Will)

Every developer — human or AI-assisted — hits bugs. Here''s how to fix them fast.

## The Debug Loop

1. **Read the error** — Copy the exact error message
2. **Ask AI** — Paste the error and ask "What does this mean and how do I fix it?"
3. **Apply the fix** — Make the change AI suggests
4. **Test again** — See if it worked
5. **Repeat** — Sometimes it takes 2-3 iterations

## Pro Tips for Debugging

- **Always share context** — Tell AI what file you''re in and what you''re trying to do
- **Show your code** — Paste the relevant code, not just the error
- **One fix at a time** — Don''t try to fix 5 things at once
- **Use screenshots** — If it''s a visual bug, show what it looks like vs. what you want

## Common Beginner Issues

| Error | Usually means |
|-------|-------------|
| "Module not found" | You need to install a package (`npm install ...`) |
| "Cannot read property of undefined" | You''re trying to use data that doesn''t exist yet |
| "Hydration mismatch" | Your server and client code don''t match |
| Port already in use | Another dev server is running. Kill it or use a different port |',
   NULL, 1, 'members', true)
ON CONFLICT DO NOTHING;

-- Month 1 > Your First App
INSERT INTO lessons (id, program_id, section_id, title, content, video_url, order_index, visibility, published)
VALUES
  ('00000000-0000-0000-0000-000000000406', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000303',
   'From Idea to Project Setup',
   '# Building Your First App: Project Setup

Time to build something real. We''re going to create a simple app from scratch.

## Pick Your Idea

Choose something simple for your first app:
- A personal portfolio site
- A simple todo list
- A quote generator
- A link-in-bio page

## Create the Project

```bash
npx create-next-app@latest my-first-app
```

When it asks questions, choose:
- TypeScript: **Yes**
- ESLint: **Yes**
- Tailwind CSS: **Yes**
- src directory: **No**
- App Router: **Yes**
- Import alias: **Yes** (default @/)

## Run It

```bash
cd my-first-app
npm run dev
```

Open `http://localhost:3000` in your browser. You should see the Next.js starter page.

🎉 **You just created a web app!**

Now let''s make it yours.',
   NULL, 0, 'members', true),

  ('00000000-0000-0000-0000-000000000407', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000303',
   'Building Your Core Feature',
   '# Building the Core Feature

Every app does ONE thing well. Let''s build that one thing.

## The Process

1. **Define it** — Write one sentence: "My app lets users [do X]"
2. **Prompt it** — Ask AI to build the UI for that feature
3. **Iterate** — Refine until it looks and works right
4. **Ship it** — Deploy and share

## Example: Building a Quote Generator

Here''s a prompt you could use:

```
In my Next.js app, create a page at app/page.tsx that:
- Shows a random inspirational quote in the center of the page
- Has a "New Quote" button that shows a different quote
- Use a nice gradient background
- Make the quote text large and elegant
- Include the author name below the quote
- Store at least 20 quotes in an array

Use Tailwind CSS for styling. Make it look beautiful.
```

## Iteration Tips

After the first version:
- "Make the font size larger"
- "Add a fade-in animation when the quote changes"
- "Add a copy-to-clipboard button"
- "Make it responsive for mobile"

Each iteration makes it better. This is the vibe coding workflow.',
   NULL, 1, 'members', true),

  ('00000000-0000-0000-0000-000000000408', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000303',
   'Deploying to the World',
   '# Deploy Your App to Vercel

Your app works locally. Now let''s put it on the internet.

## Step 1: Push to GitHub

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "My first app!"

# Create a repo on GitHub, then:
git remote add origin https://github.com/YOUR-USERNAME/my-first-app.git
git push -u origin main
```

## Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New Project"
3. Select your repository
4. Click "Deploy"

That''s it. In about 60 seconds, your app is live on the internet with a real URL.

## Step 3: Share It!

Post your deployed URL in the community feed. Tag it with #wins.

You just went from zero to deployed. That''s a real accomplishment. 🚀

## ✅ Week 4 Challenge
Deploy your first app and share the live URL in the community.',
   NULL, 2, 'members', true)
ON CONFLICT DO NOTHING;

-- Month 1 > Understanding the Stack
INSERT INTO lessons (id, program_id, section_id, title, content, video_url, order_index, visibility, published)
VALUES
  ('00000000-0000-0000-0000-000000000409', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000304',
   'React & Next.js in Plain English',
   '# Understanding React & Next.js

You don''t need to be an expert. You need to understand the concepts.

## React: Building Blocks

Think of React like LEGO blocks:
- **Components** = Individual LEGO pieces (a button, a card, a header)
- **Props** = How you customize each piece (color, size, text)
- **State** = Things that change (is the menu open? what did the user type?)

```jsx
// This is a component. It''s just a function that returns UI.
function WelcomeCard({ name }) {
  return (
    <div className="p-4 border rounded">
      <h2>Welcome, {name}!</h2>
    </div>
  );
}
```

## Next.js: The Framework

Next.js is like a house blueprint that uses React bricks:
- **Pages** = Files in the `app/` folder become URLs
- **Server Components** = Code that runs on the server (fetch data)
- **Client Components** = Code that runs in the browser (interactivity)
- **API Routes** = Backend endpoints you can call

## Supabase: Your Database

Supabase is where your data lives:
- **Tables** = Like spreadsheets
- **Rows** = Individual records
- **RLS** = Security rules (who can see what)

## Tailwind CSS: Styling

Instead of writing CSS files, you add classes directly:
```html
<div className="bg-blue-500 text-white p-4 rounded-lg">
  I''m a blue box!
</div>
```

That''s it. You now know enough to be dangerous. 😎',
   NULL, 0, 'members', true)
ON CONFLICT DO NOTHING;

-- Month 2 > Authentication
INSERT INTO lessons (id, program_id, section_id, title, content, video_url, order_index, visibility, published)
VALUES
  ('00000000-0000-0000-0000-000000000410', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000305',
   'Why Authentication Matters',
   '# User Authentication: The Foundation

Every real app needs users. Authentication is how you know who''s who.

## What You''ll Learn
- Sign up / Sign in flows
- Protecting pages (only logged-in users can see them)
- Getting the current user''s info
- User profiles

## Tools We''ll Use
- **Clerk** — The easiest auth for Next.js (what KLASS uses)
- **Supabase Auth** — Alternative if you want more control

## Why Clerk?
- 5-minute setup
- Beautiful sign-in/sign-up pages out of the box
- Social logins (Google, GitHub) with one click
- Free for up to 10,000 users

Let''s set it up in the next lesson.',
   NULL, 0, 'members', true),

  ('00000000-0000-0000-0000-000000000411', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000305',
   'Setting Up Clerk in 5 Minutes',
   '# Adding Clerk Auth to Your App

This is one of those "it feels like magic" moments.

## Setup Steps

### 1. Install
```bash
npm install @clerk/nextjs
```

### 2. Add Environment Variables
Create `.env.local`:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 3. Add the Provider
Wrap your app in `app/layout.tsx`:
```tsx
import { ClerkProvider } from "@clerk/nextjs";

export default function Layout({ children }) {
  return (
    <ClerkProvider>
      <html><body>{children}</body></html>
    </ClerkProvider>
  );
}
```

### 4. Add Sign In/Up Pages
Clerk provides these automatically at `/sign-in` and `/sign-up`.

### 5. Protect Pages
```tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return <h1>Welcome to your dashboard!</h1>;
}
```

That''s it. Your app now has real user authentication. 🔒',
   NULL, 1, 'members', true)
ON CONFLICT DO NOTHING;

-- Month 2 > Database Design
INSERT INTO lessons (id, program_id, section_id, title, content, video_url, order_index, visibility, published)
VALUES
  ('00000000-0000-0000-0000-000000000412', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000306',
   'Database Design for Non-Devs',
   '# Thinking About Data

A database is just organized information. Think spreadsheets, but more powerful.

## Key Concepts

### Tables = Spreadsheet tabs
Each table stores one type of thing:
- `users` table → user info
- `posts` table → blog posts
- `products` table → items for sale

### Columns = Spreadsheet headers
Each column is a field:
- `name`, `email`, `created_at`

### Rows = Individual records
Each row is one item:
- "Matt, matt@example.com, 2024-01-01"

### Relationships
Tables can reference each other:
- A `post` belongs to a `user` (via `user_id`)
- A `user` has many `posts`

## Supabase Makes This Easy

1. Go to your Supabase dashboard
2. Click "Table Editor"
3. Create tables with a UI (no SQL needed!)

Or use SQL if you prefer:
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Think about what data your app needs, then design tables for it.',
   NULL, 0, 'members', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- 7. RESOURCES
-- ============================================

INSERT INTO resources (id, community_id, title, description, type, url, folder, visibility, order_index)
VALUES
  ('00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000001',
   'Prompt Templates Library', 'Copy-paste prompt templates for common tasks', 'link',
   'https://docs.google.com/document/d/example-prompt-templates', 'Templates', 'members', 0),

  ('00000000-0000-0000-0000-000000000502', '00000000-0000-0000-0000-000000000001',
   'Recommended Tools & Services', 'Curated list of tools for vibe coders', 'link',
   'https://docs.google.com/document/d/example-tools', 'Guides', 'members', 1),

  ('00000000-0000-0000-0000-000000000503', '00000000-0000-0000-0000-000000000001',
   'Deployment Checklist', 'Step-by-step checklist before going live', 'link',
   'https://docs.google.com/document/d/example-checklist', 'Templates', 'members', 2),

  ('00000000-0000-0000-0000-000000000504', '00000000-0000-0000-0000-000000000001',
   'Weekly Challenge Tracker', 'Track your progress through the weekly build challenges', 'link',
   'https://docs.google.com/spreadsheets/d/example-tracker', 'Templates', 'members', 3)
ON CONFLICT DO NOTHING;

-- ============================================
-- 8. EVENTS
-- ============================================

INSERT INTO events (id, community_id, title, description, starts_at, ends_at, location, external_url, visibility)
VALUES
  ('00000000-0000-0000-0000-000000000601', '00000000-0000-0000-0000-000000000001',
   'Weekly Live Build Session',
   'Watch Matt build real features live. Ask questions, learn techniques, and see the vibe coding workflow in action.',
   (NOW() + INTERVAL '3 days')::timestamptz,
   (NOW() + INTERVAL '3 days' + INTERVAL '1 hour')::timestamptz,
   'Online',
   'https://meet.google.com/example',
   'members'),

  ('00000000-0000-0000-0000-000000000602', '00000000-0000-0000-0000-000000000001',
   'Monthly Office Hours & Q&A',
   'Open floor — bring your questions, share your progress, get feedback on your projects.',
   (NOW() + INTERVAL '10 days')::timestamptz,
   (NOW() + INTERVAL '10 days' + INTERVAL '1 hour')::timestamptz,
   'Online',
   'https://meet.google.com/example-office-hours',
   'members')
ON CONFLICT DO NOTHING;

-- ============================================
-- NOTE: Profile creation requires a real Clerk user_id
-- so we don't seed profiles or posts here.
-- Posts/welcome content should be created by the admin
-- after signing in for the first time.
-- ============================================

-- ============================================
-- 9. FEATURE FLAGS (enable AI for this community)
-- ============================================

INSERT INTO feature_flags (community_id, key, enabled)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'ai_enabled', true),
  ('00000000-0000-0000-0000-000000000001', 'affiliates_enabled', true)
ON CONFLICT DO NOTHING;
