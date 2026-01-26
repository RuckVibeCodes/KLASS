-- ============================================
-- SEED: Vibe Code Crew Welcome Posts
-- ============================================
-- Run AFTER the admin profile exists (requires a real profile_id)
-- Replace ADMIN_PROFILE_ID with the actual UUID of the admin's profile

-- Usage:
-- 1. Sign in as admin to create your profile
-- 2. Get your profile ID: SELECT id FROM profiles WHERE community_id = '00000000-0000-0000-0000-000000000001' AND role = 'ADMIN' LIMIT 1;
-- 3. Replace ADMIN_PROFILE_ID below
-- 4. Run this SQL

-- Welcome Post (Pinned)
INSERT INTO posts (community_id, author_profile_id, content, visibility, pinned, category_id)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'ADMIN_PROFILE_ID',  -- REPLACE THIS
  '👋 Welcome to Vibe Code Crew!

I''m Matt, and I''m building real apps with AI — no traditional coding background. This community is where I teach everything I learn.

🎯 What you''ll get:
• Monthly course content (drip-fed so you can keep up)
• Weekly live build sessions (watch me build, ask questions)
• Weekly challenges to keep you shipping
• A community of builders who hold each other accountable

📋 Getting Started:
1. Introduce yourself below — what do you want to build?
2. Head to Courses → Month 1: Foundations
3. Set up your dev tools (first lesson walks you through it)
4. Join the weekly challenge!

Let''s build something! 🚀',
  'members',
  true,
  '00000000-0000-0000-0000-000000000105'  -- General category
);

-- Introductions Post
INSERT INTO posts (community_id, author_profile_id, content, visibility, pinned, category_id)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'ADMIN_PROFILE_ID',  -- REPLACE THIS
  '🙋 INTRODUCTIONS THREAD

Drop a comment below with:
• Your name
• What you want to build
• Your coding experience (zero is fine!)
• One fun fact about you

I''ll go first: I''m Matt. I''m building KLASS (a community platform), Timeslot (scheduling), and TouchGrass (outdoors app). I started coding with AI less than a year ago. Fun fact: I can juggle. 🤹‍♂️',
  'members',
  true,
  '00000000-0000-0000-0000-000000000106'  -- Introductions category
);

-- Week 1 Challenge Post
INSERT INTO posts (community_id, author_profile_id, content, visibility, pinned, category_id)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'ADMIN_PROFILE_ID',  -- REPLACE THIS
  '🏆 WEEK 1 CHALLENGE: Ship a Landing Page

This week''s challenge: Build and deploy a landing page for your app idea.

Requirements:
✅ A hero section with your app name and tagline
✅ At least 3 feature highlights
✅ A call-to-action button
✅ Deployed on Vercel with a live URL

Bonus points:
⭐ Custom domain
⭐ Email signup form
⭐ Responsive (looks good on mobile)

Share your live URL in the comments when you''re done! Let''s see what you build. 💪',
  'members',
  false,
  '00000000-0000-0000-0000-000000000101'  -- Wins category
);
