-- ============================================
-- KLASS Demo Community - Rich Seed Data
-- ============================================
-- Creates a fully-populated "Creator Academy" demo community
-- at /demo with realistic content that feels "lived in".
--
-- Usage: Run against Supabase SQL Editor or via psql
-- Idempotent: Uses ON CONFLICT where possible
-- ============================================

-- Fixed UUIDs for referential integrity
-- Community
-- demo-community-0001-0001-000000000001

-- ============================================
-- CLEANUP existing demo data (safe re-run)
-- ============================================
DO $$
DECLARE
  cid UUID := 'demo-community-0001-0001-000000000001';
BEGIN
  DELETE FROM poll_votes WHERE poll_id IN (SELECT id FROM polls WHERE post_id IN (SELECT id FROM posts WHERE community_id = cid));
  DELETE FROM poll_options WHERE poll_id IN (SELECT id FROM polls WHERE post_id IN (SELECT id FROM posts WHERE community_id = cid));
  DELETE FROM polls WHERE post_id IN (SELECT id FROM posts WHERE community_id = cid);
  DELETE FROM post_likes WHERE post_id IN (SELECT id FROM posts WHERE community_id = cid);
  DELETE FROM comments WHERE post_id IN (SELECT id FROM posts WHERE community_id = cid);
  DELETE FROM posts WHERE community_id = cid;
  DELETE FROM post_categories WHERE community_id = cid;
  DELETE FROM lesson_progress WHERE profile_id IN (SELECT id FROM profiles WHERE community_id = cid);
  DELETE FROM lessons WHERE program_id IN (SELECT id FROM programs WHERE community_id = cid);
  DELETE FROM program_sections WHERE program_id IN (SELECT id FROM programs WHERE community_id = cid);
  DELETE FROM programs WHERE community_id = cid;
  DELETE FROM events WHERE community_id = cid;
  DELETE FROM resources WHERE community_id = cid;
  DELETE FROM membership_tiers WHERE community_id = cid;
  DELETE FROM community_modules WHERE community_id = cid;
  DELETE FROM profile_tags WHERE profile_id IN (SELECT id FROM profiles WHERE community_id = cid);
  DELETE FROM member_tags WHERE community_id = cid;
  DELETE FROM profiles WHERE community_id = cid;
  DELETE FROM communities WHERE id = cid;
END $$;

-- ============================================
-- 1. COMMUNITY
-- ============================================
INSERT INTO communities (id, name, slug, description, logo_url, primary_color, accent_color, status, billing_status, settings_json)
VALUES (
  'demo-community-0001-0001-000000000001',
  'Creator Academy',
  'demo',
  'Master the art of building and monetizing online communities. Join 5,000+ creators learning to build sustainable businesses around their expertise.',
  'https://api.dicebear.com/7.x/shapes/svg?seed=CreatorAcademy&backgroundColor=6366f1',
  '#6366f1',
  '#8b5cf6',
  'active',
  'active',
  '{"welcome_message": "Welcome to Creator Academy! 🎉 Start with the Getting Started program, then introduce yourself in the feed.", "layout_mode": "sidebar", "show_about_page": true, "show_leaderboard": true}'
);

-- ============================================
-- 2. COMMUNITY MODULES
-- ============================================
INSERT INTO community_modules (community_id, key, label, enabled, order_index) VALUES
  ('demo-community-0001-0001-000000000001', 'feed', 'Community', true, 0),
  ('demo-community-0001-0001-000000000001', 'programs', 'Programs', true, 1),
  ('demo-community-0001-0001-000000000001', 'resources', 'Resources', true, 2),
  ('demo-community-0001-0001-000000000001', 'events', 'Events', true, 3),
  ('demo-community-0001-0001-000000000001', 'members', 'Members', true, 4);

-- ============================================
-- 3. MEMBERSHIP TIERS
-- ============================================
INSERT INTO membership_tiers (id, community_id, name, slug, description, price_cents_monthly, price_cents_yearly, tier_level, is_default, features, active, order_index)
VALUES
  ('tier-0001-0001-0001-000000000001', 'demo-community-0001-0001-000000000001',
   'Free', 'free', 'Get started with community access and free content.',
   0, 0, 0, true,
   '{"community_feed": true, "free_programs": true, "events_view": true}',
   true, 0),
  ('tier-0001-0001-0001-000000000002', 'demo-community-0001-0001-000000000001',
   'Pro', 'pro', 'Full access to all programs, resources, and premium events.',
   2900, 24900, 1, false,
   '{"community_feed": true, "free_programs": true, "premium_programs": true, "resources": true, "events_view": true, "events_attend": true}',
   true, 1),
  ('tier-0001-0001-0001-000000000003', 'demo-community-0001-0001-000000000001',
   'VIP', 'vip', 'Everything in Pro plus 1-on-1 coaching, code reviews, and early access.',
   9900, 89900, 2, false,
   '{"community_feed": true, "free_programs": true, "premium_programs": true, "resources": true, "events_view": true, "events_attend": true, "direct_support": true, "code_reviews": true, "early_access": true}',
   true, 2);

-- ============================================
-- 4. PROFILES (12 realistic members)
-- ============================================
INSERT INTO profiles (id, clerk_user_id, community_id, role, tier, display_name, avatar_url, bio, membership_tier_id) VALUES
  -- Admins
  ('prof-0001-0001-0001-000000000001', 'demo_admin_alex', 'demo-community-0001-0001-000000000001', 'ADMIN', 'PAID',
   'Alex Rivera',
   'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
   'Community founder & course creator. Helped 10,000+ creators build profitable communities. Previously grew a fitness brand to 50k members.',
   'tier-0001-0001-0001-000000000003'),

  ('prof-0001-0001-0001-000000000002', 'demo_admin_jordan', 'demo-community-0001-0001-000000000001', 'ADMIN', 'PAID',
   'Jordan Chen',
   'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
   'Co-founder & head of content. Former product designer at Figma. Obsessed with great community experiences.',
   'tier-0001-0001-0001-000000000003'),

  -- Paid Members
  ('prof-0001-0001-0001-000000000003', 'demo_user_sarah', 'demo-community-0001-0001-000000000001', 'PAID_MEMBER', 'PAID',
   'Sarah Chen',
   'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
   'Building a community for UX designers. Currently at 2,000 members and scaling to 10k this year! 🚀',
   'tier-0001-0001-0001-000000000002'),

  ('prof-0001-0001-0001-000000000004', 'demo_user_marcus', 'demo-community-0001-0001-000000000001', 'PAID_MEMBER', 'PAID',
   'Marcus Johnson',
   'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
   'Fitness coach turned community builder. Just crossed $10k MRR with my online training community. Helping trainers go digital.',
   'tier-0001-0001-0001-000000000002'),

  ('prof-0001-0001-0001-000000000005', 'demo_user_david', 'demo-community-0001-0001-000000000001', 'PAID_MEMBER', 'PAID',
   'David Kim',
   'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face',
   'Tech entrepreneur. Built 3 successful SaaS communities. Currently advising 5 startups on community-led growth.',
   'tier-0001-0001-0001-000000000003'),

  ('prof-0001-0001-0001-000000000006', 'demo_user_priya', 'demo-community-0001-0001-000000000001', 'PAID_MEMBER', 'PAID',
   'Priya Patel',
   'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
   'Online course creator with 50k+ students. Teaching educators how to build communities around their courses.',
   'tier-0001-0001-0001-000000000002'),

  ('prof-0001-0001-0001-000000000007', 'demo_user_miguel', 'demo-community-0001-0001-000000000001', 'PAID_MEMBER', 'PAID',
   'Miguel Torres',
   'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
   'YouTube creator (120k subs) building a paid community for aspiring video creators. Love helping people tell better stories.',
   'tier-0001-0001-0001-000000000002'),

  ('prof-0001-0001-0001-000000000008', 'demo_user_lisa', 'demo-community-0001-0001-000000000001', 'PAID_MEMBER', 'PAID',
   'Lisa Wang',
   'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
   'Newsletter writer (45k subscribers) exploring community as a revenue stream. Here to learn from the best!',
   'tier-0001-0001-0001-000000000002'),

  -- Free Members
  ('prof-0001-0001-0001-000000000009', 'demo_user_emily', 'demo-community-0001-0001-000000000001', 'FREE_MEMBER', 'FREE',
   'Emily Watson',
   'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
   'Just starting my creator journey. Excited to learn from everyone here! Currently building my first email list.',
   'tier-0001-0001-0001-000000000001'),

  ('prof-0001-0001-0001-000000000010', 'demo_user_jessica', 'demo-community-0001-0001-000000000001', 'FREE_MEMBER', 'FREE',
   'Jessica Martinez',
   'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
   'Podcaster & content creator. Exploring community building as my next big project. Love connecting with fellow creators.',
   'tier-0001-0001-0001-000000000001'),

  ('prof-0001-0001-0001-000000000011', 'demo_user_james', 'demo-community-0001-0001-000000000001', 'FREE_MEMBER', 'FREE',
   'James O''Brien',
   'https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop&crop=face',
   'Writer and coach. Thinking about starting a community for aspiring authors. Soaking up all the knowledge here.',
   'tier-0001-0001-0001-000000000001'),

  ('prof-0001-0001-0001-000000000012', 'demo_user_nina', 'demo-community-0001-0001-000000000001', 'FREE_MEMBER', 'FREE',
   'Nina Kowalski',
   'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
   'Marketing consultant pivoting to community-led growth. Here to understand the creator economy better.',
   'tier-0001-0001-0001-000000000001');

-- ============================================
-- 5. POST CATEGORIES
-- ============================================
INSERT INTO post_categories (id, community_id, name, slug, color, icon, display_order) VALUES
  ('cat-0001-0001-0001-000000000001', 'demo-community-0001-0001-000000000001', 'General', 'general', '#6366f1', 'message-circle', 1),
  ('cat-0001-0001-0001-000000000002', 'demo-community-0001-0001-000000000001', 'Introductions', 'introductions', '#10b981', 'hand-wave', 2),
  ('cat-0001-0001-0001-000000000003', 'demo-community-0001-0001-000000000001', 'Q&A', 'qa', '#f59e0b', 'help-circle', 3),
  ('cat-0001-0001-0001-000000000004', 'demo-community-0001-0001-000000000001', 'Wins', 'wins', '#ec4899', 'trophy', 4),
  ('cat-0001-0001-0001-000000000005', 'demo-community-0001-0001-000000000001', 'Resources', 'resources', '#8b5cf6', 'folder', 5),
  ('cat-0001-0001-0001-000000000006', 'demo-community-0001-0001-000000000001', 'Feedback', 'feedback', '#06b6d4', 'message-square', 6);

-- ============================================
-- 6. PROGRAMS (4 programs with sections & lessons)
-- ============================================

-- Program 1: Getting Started (free, onboarding)
INSERT INTO programs (id, community_id, title, description, thumbnail_url, visibility, published, order_index) VALUES
  ('prog-0001-0001-0001-000000000001', 'demo-community-0001-0001-000000000001',
   'Getting Started',
   'Everything you need to hit the ground running. Complete this program first to get the most out of Creator Academy.',
   'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
   'members', true, 0);

INSERT INTO program_sections (id, program_id, title, order_index) VALUES
  ('sect-0001-0001-0001-000000000001', 'prog-0001-0001-0001-000000000001', 'Welcome & Orientation', 0),
  ('sect-0001-0001-0001-000000000002', 'prog-0001-0001-0001-000000000001', 'Community Essentials', 1);

INSERT INTO lessons (id, program_id, section_id, title, content, video_url, order_index, visibility, published) VALUES
  ('less-0001-0001-0001-000000000001', 'prog-0001-0001-0001-000000000001', 'sect-0001-0001-0001-000000000001',
   'Welcome to Creator Academy',
   E'# Welcome to Creator Academy! 🎉\n\nWe''re thrilled to have you here. This community is designed to help you build, grow, and monetize your online community.\n\n## What You''ll Learn\n\n- **Community Building** — The fundamentals of creating engaged communities\n- **Content Strategy** — How to create content that converts\n- **Monetization** — Turn your community into a business\n- **Growth** — Scale from 0 to 10,000+ members\n\n## Getting Started\n\n1. Complete this orientation program\n2. Introduce yourself in the community feed\n3. Join our weekly live calls (Thursdays at 6 PM)\n4. Start the Community Building Fundamentals program\n\n## Community Guidelines\n\nBe respectful, share knowledge, stay constructive, and help each other grow. We''re all on this journey together.\n\nLet''s build something amazing! 🚀',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 0, 'members', true),

  ('less-0001-0001-0001-000000000002', 'prog-0001-0001-0001-000000000001', 'sect-0001-0001-0001-000000000001',
   'Setting Up Your Profile',
   E'# Setting Up Your Profile\n\nYour profile is your first impression. A complete profile gets **3x more engagement** in the community.\n\n## Profile Essentials\n\n### 1. Profile Photo\nUse a clear, professional headshot. Members connect better with real faces.\n\n### 2. Bio\nKeep it concise but informative:\n- Who you are\n- What you''re building\n- What you want to learn\n- One fun fact about yourself\n\n### 3. Connect\nOnce your profile is set up:\n- Post an introduction in the Community feed\n- Comment on 3 other members'' posts\n- Join the next live call\n\n## Pro Tip\nMembers who complete their profile in the first 48 hours are **5x more likely** to stay engaged long-term. Don''t skip this step!',
   null, 1, 'members', true),

  ('less-0001-0001-0001-000000000003', 'prog-0001-0001-0001-000000000001', 'sect-0001-0001-0001-000000000002',
   'How to Use the Platform',
   E'# Navigating Creator Academy\n\nHere''s a quick tour of everything available to you.\n\n## Core Sections\n\n### 📝 Community Feed\nThe heart of Creator Academy. Share updates, ask questions, celebrate wins, and connect with fellow creators.\n\n### 📚 Programs\nStructured courses with lessons, sections, and progress tracking. Start with "Getting Started" (this one!) then move to the fundamentals.\n\n### 📁 Resources\nDownloadable templates, guides, checklists, and tools. Organized by folder for easy access.\n\n### 📅 Events\nLive calls, workshops, masterminds, and AMAs. Add them to your calendar so you never miss one.\n\n### 👥 Members\nBrowse and connect with fellow community members. Find people in your niche!\n\n## Membership Tiers\n\n- **Free** — Community access + Getting Started program\n- **Pro ($29/mo)** — All programs + resources + premium events\n- **VIP ($99/mo)** — Everything + 1-on-1 coaching + code reviews',
   null, 2, 'members', true),

  ('less-0001-0001-0001-000000000004', 'prog-0001-0001-0001-000000000001', 'sect-0001-0001-0001-000000000002',
   'Community Guidelines & Values',
   E'# Community Guidelines\n\nCreator Academy thrives because of our shared values. Here''s how we keep it that way.\n\n## Our Core Values\n\n### 🤝 Be Respectful\nTreat others how you want to be treated. We come from diverse backgrounds and experience levels.\n\n### 💡 Share Knowledge\nHelp others by sharing your experiences — wins AND failures. Vulnerability builds trust.\n\n### 🎯 Stay Constructive\nFeedback is welcome; negativity isn''t. Frame suggestions as "have you tried..." not "you should never..."\n\n### 🚫 No Spam\nQuality over quantity. Share your work when relevant, but don''t turn every conversation into a pitch.\n\n### 🔒 Respect Privacy\nWhat happens in the community stays in the community. Don''t share members'' content or conversations externally without permission.\n\n## Reporting Issues\nSee something that doesn''t belong? Tag @Alex Rivera or @Jordan Chen and we''ll handle it promptly.',
   null, 3, 'members', true);

-- Program 2: Community Building Fundamentals (members)
INSERT INTO programs (id, community_id, title, description, thumbnail_url, visibility, published, order_index) VALUES
  ('prog-0001-0001-0001-000000000002', 'demo-community-0001-0001-000000000001',
   'Community Building Fundamentals',
   'Learn the core principles of building an engaged online community from scratch. From finding your niche to getting your first 1,000 members.',
   'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
   'members', true, 1);

INSERT INTO program_sections (id, program_id, title, order_index) VALUES
  ('sect-0001-0001-0001-000000000003', 'prog-0001-0001-0001-000000000002', 'Foundation', 0),
  ('sect-0001-0001-0001-000000000004', 'prog-0001-0001-0001-000000000002', 'Growth', 1),
  ('sect-0001-0001-0001-000000000005', 'prog-0001-0001-0001-000000000002', 'Engagement', 2);

INSERT INTO lessons (id, program_id, section_id, title, content, video_url, order_index, visibility, published) VALUES
  ('less-0001-0001-0001-000000000005', 'prog-0001-0001-0001-000000000002', 'sect-0001-0001-0001-000000000003',
   'What Makes a Community',
   E'# What Makes a Community?\n\nNot every group of people is a community. Let''s understand what sets real communities apart.\n\n## The Community Triangle\n\n1. **Shared Interest** — A common topic or goal\n2. **Shared Identity** — Members see themselves as part of something\n3. **Shared Rituals** — Regular activities that reinforce belonging\n\n## Community vs. Audience\n\n| Audience | Community |\n|----------|----------|\n| One-way communication | Two-way interaction |\n| Passive consumption | Active participation |\n| Individual experience | Collective experience |\n| Creator-dependent | Self-sustaining |\n\n## The Magic Formula\n\nA thriving community = **Clear purpose** + **Consistent rituals** + **Member-to-member connections**\n\nThe best communities aren''t built around a creator — they''re built around a shared identity.\n\n## Exercise\nThink about the communities you''re part of. What makes them feel like a community vs. just an audience?',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 0, 'members', true),

  ('less-0001-0001-0001-000000000006', 'prog-0001-0001-0001-000000000002', 'sect-0001-0001-0001-000000000003',
   'Finding Your Niche',
   E'# Finding Your Niche\n\nThe riches are in the niches. Here''s how to find yours.\n\n## The Niche Sweet Spot\n\nYour ideal niche sits at the intersection of:\n- **Your expertise** — What you know deeply\n- **Your passion** — What energizes you daily\n- **Market demand** — What people will pay for\n\n## Validation Checklist\n\n- [ ] Are people already paying for solutions in this space?\n- [ ] Can you find at least 1,000 potential members?\n- [ ] Do you have unique insights or experience?\n- [ ] Can you commit to this for 3-5+ years?\n- [ ] Is the niche specific enough to create identity?\n\n## Examples of Great Niches\n\n❌ "Entrepreneurs" (too broad)\n✅ "Solo founders building B2B SaaS" (specific identity)\n\n❌ "Fitness" (too broad)\n✅ "Busy parents who want to get fit in 30 min/day" (specific pain point)\n\n## Exercise\nWrite down 3 potential niches and score them 1-10 on expertise, passion, and demand.',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1, 'members', true),

  ('less-0001-0001-0001-000000000007', 'prog-0001-0001-0001-000000000002', 'sect-0001-0001-0001-000000000004',
   'Your First 100 Members',
   E'# Getting Your First 100 Members\n\nThe hardest part is starting. Here''s your roadmap.\n\n## The 5×20 Strategy\n\nReach out to 20 people in each category:\n1. **Close friends** who fit your niche\n2. **Professional connections** in the industry\n3. **Social media followers** who engage with you\n4. **Email subscribers** who already trust you\n5. **People you admire** in the space\n\n## Your Founding Member Pitch\n\n> "I''m building [community name] for [specific audience]. We''re going to [specific outcome]. I''d love for you to be a founding member — your feedback will shape everything we build."\n\n## Key Insights\n\n- Your first 100 members aren''t customers — they''re **co-creators**\n- Personal invitations convert 10x better than public posts\n- Founding members become your biggest advocates\n- Quality of first members matters more than speed\n\n## Milestone Markers\n- **10 members** — You have a group chat\n- **25 members** — You have a community forming\n- **50 members** — Member-to-member connections emerge\n- **100 members** — Self-sustaining conversations begin',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 0, 'members', true),

  ('less-0001-0001-0001-000000000008', 'prog-0001-0001-0001-000000000002', 'sect-0001-0001-0001-000000000004',
   'Growth Channels That Work',
   E'# Growth Channels for Communities\n\nOrganically growing from 100 to 1,000 members.\n\n## Top Growth Channels\n\n### 1. Content Marketing (Best for most)\n- Long-form content that showcases community value\n- Share member wins and transformations publicly\n- Create "gateway content" — free resources that lead to the community\n\n### 2. Word of Mouth (Highest quality)\n- Build a referral program (we have one built into KLASS!)\n- Make members proud to share they''re part of your community\n- Create shareable moments and milestones\n\n### 3. Partnerships (Fastest at scale)\n- Cross-promote with complementary communities\n- Guest expert sessions with each other''s audiences\n- Bundle offers with related products\n\n### 4. Events (Best conversion)\n- Free webinars that demo community value\n- Challenges (7-day, 30-day) that create community experience\n- In-person meetups at conferences\n\n## The Growth Flywheel\nGreat community → Happy members → Word of mouth → More members → Better community',
   null, 1, 'members', true),

  ('less-0001-0001-0001-000000000009', 'prog-0001-0001-0001-000000000002', 'sect-0001-0001-0001-000000000005',
   'The Art of Engagement',
   E'# The Art of Community Engagement\n\nEngagement is the lifeblood of your community. Here''s how to keep it pumping.\n\n## The Daily Engagement Framework\n\n### Morning (15 min)\n- Post a discussion prompt or question\n- Reply to overnight comments\n\n### Afternoon (10 min)\n- Highlight a member contribution\n- Answer any unanswered questions\n\n### Evening (5 min)\n- React to member posts with thoughtful comments\n- Preview tomorrow''s content\n\n## High-Engagement Post Types\n\n1. **"What''s your take?"** — Opinion polls\n2. **Win celebrations** — Member spotlight\n3. **Behind-the-scenes** — Show your process\n4. **Challenges** — Weekly prompts with accountability\n5. **Hot takes** — Controversial (but safe) opinions\n\n## The 10-10-10 Rule\nFor every 10 posts YOU make:\n- 10 should be comments on MEMBER posts\n- 10 should be DMs to individual members\n\nCommunity-building is relationship-building at scale.',
   null, 0, 'members', true),

  ('less-0001-0001-0001-000000000010', 'prog-0001-0001-0001-000000000002', 'sect-0001-0001-0001-000000000005',
   'Rituals That Build Belonging',
   E'# Community Rituals\n\nRituals transform a group of strangers into a tribe.\n\n## Essential Rituals\n\n### 🗓️ Weekly Call\nSame day, same time, every week. This is non-negotiable.\n- It creates predictability\n- It builds real relationships\n- It gives members something to look forward to\n\n### 🏆 Win Wednesday\nEvery Wednesday, members share their wins. No win is too small.\n\n### 🆕 Welcome Ritual\nNew members get:\n1. A personal welcome message from you\n2. A shout-out in the feed\n3. A "Getting Started" guide\n4. Introduction to 2-3 members who share their interests\n\n### 📊 Monthly Retrospective\nOnce a month, share community metrics:\n- Members gained\n- Top posts\n- Member milestones\n- What''s coming next\n\n## Creating Your Signature Ritual\n\nThe best ritual:\n- Is unique to YOUR community\n- Requires member participation\n- Creates shared language/identity\n- Happens consistently',
   null, 1, 'members', true);

-- Program 3: Content Strategy Masterclass (paid)
INSERT INTO programs (id, community_id, title, description, thumbnail_url, visibility, published, order_index) VALUES
  ('prog-0001-0001-0001-000000000003', 'demo-community-0001-0001-000000000001',
   'Content Strategy Masterclass',
   'Create content that attracts, engages, and converts. Build a sustainable content engine for your community that runs itself.',
   'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
   'paid', true, 2);

INSERT INTO program_sections (id, program_id, title, order_index) VALUES
  ('sect-0001-0001-0001-000000000006', 'prog-0001-0001-0001-000000000003', 'Content Foundations', 0),
  ('sect-0001-0001-0001-000000000007', 'prog-0001-0001-0001-000000000003', 'Content Systems', 1);

INSERT INTO lessons (id, program_id, section_id, title, content, video_url, order_index, visibility, published) VALUES
  ('less-0001-0001-0001-000000000011', 'prog-0001-0001-0001-000000000003', 'sect-0001-0001-0001-000000000006',
   'The Content Flywheel',
   E'# The Content Flywheel\n\nCreate a self-reinforcing content engine for your community.\n\n## How the Flywheel Works\n\n1. **Create** — Share valuable content consistently\n2. **Engage** — Respond to every comment within 4 hours\n3. **Curate** — Highlight the best member contributions\n4. **Iterate** — Double down on what gets traction\n\n## Content Types That Work\n\n- **Educational** (40%) — Teach something specific and actionable\n- **Inspirational** (20%) — Share success stories and transformations\n- **Conversational** (20%) — Ask thought-provoking questions\n- **Behind-the-scenes** (20%) — Show your process, be vulnerable\n\n## Your Weekly Content Mix\n- Mon: Educational deep-dive\n- Tue: Member spotlight / win celebration\n- Wed: Discussion prompt or poll\n- Thu: Behind-the-scenes / live call\n- Fri: Resource share or tool recommendation\n\n## The Compound Effect\nAfter 12 weeks of consistent content, you''ll have a library that sells your community for you.',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 0, 'paid', true),

  ('less-0001-0001-0001-000000000012', 'prog-0001-0001-0001-000000000003', 'sect-0001-0001-0001-000000000006',
   'Writing Posts That Get Engagement',
   E'# Writing Posts That Get Engagement\n\nThe anatomy of a high-engagement community post.\n\n## The HOOK Framework\n\n- **H**ook — Open with something unexpected\n- **O**bservation — Share an insight or story\n- **O**utcome — What changed because of this\n- **K**ick — End with a question or CTA\n\n## Post Formatting Tips\n\n1. **Short paragraphs** — 1-2 sentences max\n2. **Use emojis** — Sparingly, for visual breaks\n3. **Line breaks** — White space is your friend\n4. **Bold key phrases** — Guide the skimmer\n5. **End with a question** — Always invite response\n\n## Example High-Engagement Post\n\n> Unpopular opinion: Free communities are harder to run than paid ones.\n>\n> Here''s why:\n> - No financial commitment = no skin in the game\n> - Free attracts tire-kickers, paid attracts action-takers\n> - You can''t invest in quality without revenue\n>\n> The hardest thing I ever did was charge $49/mo. It was also the best decision.\n>\n> What''s your take? Free or paid? 👇',
   null, 1, 'paid', true),

  ('less-0001-0001-0001-000000000013', 'prog-0001-0001-0001-000000000003', 'sect-0001-0001-0001-000000000007',
   'Building Your Content Calendar',
   E'# Building Your Content Calendar\n\nConsistency beats intensity. Here''s how to stay consistent without burning out.\n\n## The 12-Week Content System\n\n### Weeks 1-4: Foundation\n- Define your 3-5 core content pillars\n- Create templates for each content type\n- Build a 2-week content buffer\n- Establish your posting cadence\n\n### Weeks 5-8: Optimization\n- Analyze what''s getting engagement\n- Double down on top-performing formats\n- Start repurposing community content externally\n- Invite guest contributors\n\n### Weeks 9-12: Scaling\n- Launch member-led content series\n- Build content partnerships\n- Create a content committee of active members\n- Automate your content pipeline\n\n## The 80/20 Rule\n80% of your engagement will come from 20% of your content types. Find your 20% fast and lean into it.\n\n## Batching Strategy\nBatch create 1 week of content in 2 hours:\n- 30 min: Plan topics\n- 60 min: Write all posts\n- 30 min: Schedule + create images',
   null, 0, 'paid', true),

  ('less-0001-0001-0001-000000000014', 'prog-0001-0001-0001-000000000003', 'sect-0001-0001-0001-000000000007',
   'Repurposing Community Content',
   E'# Repurposing Community Content\n\nYour community is a content goldmine. Here''s how to extract maximum value.\n\n## The Content Recycling System\n\n### Community → External\n- Top discussion threads → Twitter threads\n- Member wins → Case study blog posts\n- Q&A sessions → YouTube videos\n- Resource requests → Lead magnets\n\n### External → Community\n- Blog posts → Discussion prompts\n- Podcast episodes → Community deep-dives\n- Social media comments → Community polls\n\n## Permission Framework\n- Always ask before sharing member content externally\n- Give credit and tag the member\n- Share the finished piece back with the community\n- This encourages MORE great content from members\n\n## The Content Multiplier\nOne great community discussion can become:\n- 1 blog post\n- 5 tweets\n- 1 newsletter edition\n- 1 short-form video\n- 1 resource/template\n\nThat''s 9 pieces of content from ONE conversation.',
   null, 1, 'paid', true);

-- Program 4: Monetization Playbook (paid)
INSERT INTO programs (id, community_id, title, description, thumbnail_url, visibility, published, order_index) VALUES
  ('prog-0001-0001-0001-000000000004', 'demo-community-0001-0001-000000000001',
   'Monetization Playbook',
   'Turn your community into a sustainable business. Pricing strategies, membership tiers, revenue diversification, and optimization.',
   'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&q=80',
   'paid', true, 3);

INSERT INTO program_sections (id, program_id, title, order_index) VALUES
  ('sect-0001-0001-0001-000000000008', 'prog-0001-0001-0001-000000000004', 'Pricing & Packaging', 0),
  ('sect-0001-0001-0001-000000000009', 'prog-0001-0001-0001-000000000004', 'Revenue Diversification', 1);

INSERT INTO lessons (id, program_id, section_id, title, content, video_url, order_index, visibility, published) VALUES
  ('less-0001-0001-0001-000000000015', 'prog-0001-0001-0001-000000000004', 'sect-0001-0001-0001-000000000008',
   'Pricing Your Community',
   E'# Pricing Your Community\n\nThe #1 mistake creators make: underpricing. Let''s fix that.\n\n## Pricing Principles\n\n1. **Price on value, not cost** — What transformation do members get?\n2. **Start higher than you think** — You can always discount, never raise easily\n3. **Create tiers** — Give options for different commitment levels\n4. **Annual saves you** — Annual plans reduce churn by 3x\n\n## The 3-Tier Model\n\n| Tier | Price | What''s Included |\n|------|-------|----------------|\n| Free | $0/mo | Community feed + 1 free program |\n| Pro | $29-99/mo | All content + resources + events |\n| VIP | $199-499/mo | Everything + 1:1 access + coaching |\n\n## Pricing Psychology\n\n- **Anchoring:** Show VIP first to make Pro feel affordable\n- **Annual discount:** 2 months free on annual creates urgency\n- **Founding member pricing:** Lock in early adopters at a lower rate\n\n## Pricing Exercise\nList 10 outcomes your community provides. Assign a dollar value to each. Your price should be 10-20% of the total value.',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 0, 'paid', true),

  ('less-0001-0001-0001-000000000016', 'prog-0001-0001-0001-000000000004', 'sect-0001-0001-0001-000000000008',
   'Reducing Churn',
   E'# Reducing Churn\n\nAcquiring members is hard. Keeping them is harder — and more profitable.\n\n## The Churn Equation\n\nIf you gain 50 members/month but lose 40, you''re growing by 10. Cut churn in half and you''re growing by 30.\n\n## Top Churn Reasons (& Fixes)\n\n### 1. "I''m not using it enough"\n**Fix:** Weekly email digest highlighting what they missed\n\n### 2. "I got what I needed"\n**Fix:** Regular new content + evolving curriculum\n\n### 3. "Too expensive"\n**Fix:** Show ROI. Track and celebrate member wins.\n\n### 4. "Don''t feel connected"\n**Fix:** Personal check-ins + small group cohorts\n\n### 5. "Forgot about it"\n**Fix:** Push notifications + habit-building rituals\n\n## The Retention Stack\n1. **Onboarding** (Week 1) — Get them to first value fast\n2. **Quick Win** (Week 2-4) — Help them achieve something\n3. **Connection** (Month 1-3) — Build relationships with other members\n4. **Identity** (Month 3+) — They see themselves as part of the community',
   null, 1, 'paid', true),

  ('less-0001-0001-0001-000000000017', 'prog-0001-0001-0001-000000000004', 'sect-0001-0001-0001-000000000009',
   'Beyond Memberships: Revenue Diversification',
   E'# Beyond Memberships\n\nDon''t put all your eggs in one basket.\n\n## Revenue Streams for Communities\n\n### 1. Memberships (Recurring) — 60-70% of revenue\n- Monthly/annual subscriptions\n- Multiple tiers for different needs\n- The foundation of your business\n\n### 2. Courses (One-time) — 15-20% of revenue\n- Deep-dive premium programs\n- Higher price point ($200-$2,000)\n- Launches create revenue spikes\n\n### 3. Events (Periodic) — 5-10% of revenue\n- Live workshops ($50-$200)\n- In-person retreats ($500-$2,000)\n- Virtual summits (free, upsell to community)\n\n### 4. Coaching (High-ticket) — 10-15% of revenue\n- Group coaching programs\n- 1-on-1 sessions\n- VIP days\n\n### 5. Partnerships (Variable)\n- Affiliate deals with tools you use\n- Sponsored content (carefully)\n- White-label services\n\n## The Revenue Mix Goal\nNo single stream > 50% of revenue. This protects you from platform changes and market shifts.',
   null, 0, 'paid', true),

  ('less-0001-0001-0001-000000000018', 'prog-0001-0001-0001-000000000004', 'sect-0001-0001-0001-000000000009',
   'Your First $10k Month',
   E'# The Path to $10k/month\n\nLet''s reverse-engineer a $10k/month community.\n\n## The Math\n\n### Scenario A: Volume Play\n- 350 members × $29/mo = **$10,150/mo**\n- Requires: Strong content marketing + low churn\n\n### Scenario B: Premium Play\n- 100 members × $99/mo = **$9,900/mo**\n- Requires: Deep expertise + high-touch experience\n\n### Scenario C: Hybrid Play\n- 150 Pro × $49/mo = $7,350\n- 15 VIP × $199/mo = $2,985\n- Total: **$10,335/mo**\n- Most recommended approach\n\n## The Timeline\n\n- **Month 1-3:** Build foundation, get first 50 members\n- **Month 4-6:** Optimize content, add second tier\n- **Month 7-9:** Launch premium program, hit 100 members\n- **Month 10-12:** Scale acquisition, optimize retention\n- **Month 12-18:** Reach $10k MRR milestone 🎉\n\n## The Uncomfortable Truth\nMost communities that hit $10k/month took 12-18 months. The ones that "overnight succeeded" were building in public for years. Trust the process.',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1, 'paid', true);

-- ============================================
-- 7. POSTS (10 realistic posts over 30 days)
-- ============================================

-- Post 1: Pinned welcome post (30 days ago)
INSERT INTO posts (id, community_id, author_profile_id, content, media_urls, visibility, pinned, likes_count, comments_count, category_id, created_at) VALUES
  ('post-0001-0001-0001-000000000001', 'demo-community-0001-0001-000000000001', 'prof-0001-0001-0001-000000000001',
   E'Welcome to Creator Academy! 🎉\n\nI''m Alex, and I built this community because I believe every creator deserves the tools and knowledge to build a thriving online business.\n\nHere''s what you''ll find:\n\n📚 **Programs** — Start with "Getting Started" then dive into the fundamentals\n💬 **Community** — Ask questions, share wins, get honest feedback\n📅 **Events** — Weekly calls, workshops, and masterminds\n📁 **Resources** — Templates, guides, checklists, and tools\n\nOur community values: **Be respectful. Share knowledge. Stay constructive. Help each other grow.**\n\nDrop a comment below and introduce yourself! Where are you on your community-building journey? 👇',
   ARRAY['https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80'],
   'members', true, 47, 8, 'cat-0001-0001-0001-000000000001', NOW() - INTERVAL '30 days');

-- Post 2: Member introduction (25 days ago)
INSERT INTO posts (id, community_id, author_profile_id, content, media_urls, visibility, pinned, likes_count, comments_count, category_id, created_at) VALUES
  ('post-0001-0001-0001-000000000002', 'demo-community-0001-0001-000000000001', 'prof-0001-0001-0001-000000000003',
   E'Hey everyone! 👋\n\nI''m Sarah, and I''m building a community for UX designers. Currently at 2,000 members and looking to scale to 10k this year.\n\nMy biggest challenge right now: **keeping engagement high as we grow.** It feels like the community gets quieter as it gets bigger. The ratio of lurkers to contributors keeps climbing.\n\nAnyone else dealt with this? What worked for you?\n\nWould love to connect with others building design-related communities! 🎨',
   ARRAY['https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80'],
   'members', false, 32, 5, 'cat-0001-0001-0001-000000000002', NOW() - INTERVAL '25 days');

-- Post 3: Big win post (14 days ago)
INSERT INTO posts (id, community_id, author_profile_id, content, media_urls, visibility, pinned, likes_count, comments_count, category_id, created_at) VALUES
  ('post-0001-0001-0001-000000000003', 'demo-community-0001-0001-000000000001', 'prof-0001-0001-0001-000000000004',
   E'BIG WIN 🏆🏆🏆\n\nJust crossed **$10k MRR** with my fitness community!\n\nHere''s exactly what worked:\n\n✅ Started with 1:1 coaching to understand pain points deeply\n✅ Created a signature 8-week program based on the most common questions\n✅ Added a $49/month community tier for ongoing support\n✅ Weekly live workout sessions to drive retention (churn dropped 40%!)\n✅ Launched an annual plan — 30% of members switched immediately\n\nTook 18 months of grinding, but we''re here.\n\nBiggest lesson: **Don''t try to scale before you nail the experience for 50 people.** I spent 6 months with fewer than 100 members, just perfecting the onboarding and content.\n\nThanks @Alex Rivera for the pricing framework in the Monetization Playbook — that was the unlock that got me from $4k to $10k. 🙏\n\nAsk me anything about fitness community building 💪',
   ARRAY['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80'],
   'members', false, 89, 7, 'cat-0001-0001-0001-000000000004', NOW() - INTERVAL '14 days');

-- Post 4: Q&A post (10 days ago)
INSERT INTO posts (id, community_id, author_profile_id, content, media_urls, visibility, pinned, likes_count, comments_count, category_id, created_at) VALUES
  ('post-0001-0001-0001-000000000004', 'demo-community-0001-0001-000000000001', 'prof-0001-0001-0001-000000000009',
   E'Quick question for the group 🤔\n\nI''m trying to decide on the right platform for my first community. Main options I''m considering:\n\n1. **Circle** — Seems polished but pricey\n2. **Skool** — Simple but limited branding\n3. **Discord** — Free but chaotic\n4. **KLASS** — New but looks promising 👀\n\nMy needs:\n- Course hosting built-in\n- Community feed/discussions\n- Mobile-friendly\n- White-label branding (my brand, not theirs)\n- Budget: ~$50-100/month\n\nWhat are you all using? Pros and cons from actual experience would be amazing!',
   NULL,
   'members', false, 23, 6, 'cat-0001-0001-0001-000000000003', NOW() - INTERVAL '10 days');

-- Post 5: Resource share (7 days ago)
INSERT INTO posts (id, community_id, author_profile_id, content, media_urls, visibility, pinned, likes_count, comments_count, category_id, created_at) VALUES
  ('post-0001-0001-0001-000000000005', 'demo-community-0001-0001-000000000001', 'prof-0001-0001-0001-000000000005',
   E'Just put together a comprehensive guide on community onboarding sequences — dropping it in Resources now! 📋\n\n**What''s inside:**\n- The 7-day welcome sequence that converts trial → paid\n- Email templates you can copy-paste\n- Automation workflows for different platforms\n- Real examples from 6-figure communities\n- A/B test results from my 3 communities\n\nThis took me 2 years of trial and error to figure out. Your onboarding sequence is the single highest-leverage thing you can optimize.\n\nStats from my community:\n- Before the sequence: 15% trial-to-paid conversion\n- After: 42% conversion 🤯\n\nGo grab it in Resources → Getting Started folder. Let me know if you have questions!',
   ARRAY['https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80'],
   'members', false, 56, 4, 'cat-0001-0001-0001-000000000005', NOW() - INTERVAL '7 days');

-- Post 6: Engagement/discussion (5 days ago)
INSERT INTO posts (id, community_id, author_profile_id, content, media_urls, visibility, pinned, likes_count, comments_count, category_id, created_at) VALUES
  ('post-0001-0001-0001-000000000006', 'demo-community-0001-0001-000000000001', 'prof-0001-0001-0001-000000000001',
   E'Thursday thought 💭\n\nThe biggest difference I see between communities that thrive and communities that die?\n\n👉 **Rituals.**\n\nSuccessful communities have predictable, repeatable rituals:\n- Weekly calls at the exact same time\n- Monthly challenges with clear structure\n- Daily prompts that create habits\n- Celebration posts for every win, no matter how small\n\nThe communities that struggle? They post when they feel like it. No rhythm. No predictability. Members never know what to expect.\n\nConsistency isn''t sexy, but it''s the foundation everything else is built on.\n\nWhat rituals does YOUR community have? Or if you''re still planning — what rituals are you thinking about implementing? Share below 👇',
   NULL,
   'members', false, 41, 5, 'cat-0001-0001-0001-000000000001', NOW() - INTERVAL '5 days');

-- Post 7: Member win (3 days ago)
INSERT INTO posts (id, community_id, author_profile_id, content, media_urls, visibility, pinned, likes_count, comments_count, category_id, created_at) VALUES
  ('post-0001-0001-0001-000000000007', 'demo-community-0001-0001-000000000001', 'prof-0001-0001-0001-000000000006',
   E'Small but mighty win 🎉\n\nI just got my **first 3 paying members** for my online education community!\n\n$29/mo each = $87 MRR. I know it''s tiny, but a month ago this was ZERO.\n\nWhat I did differently this week:\n- Sent personalized video messages to 20 people on my email list\n- Offered a founding member discount (20% off for life)\n- Created a "What you''ll get in month 1" doc that spelled out the value clearly\n\nConversion rate: 15% (3/20). Not bad for cold outreach!\n\nNext goal: 10 paying members by end of month.\n\nThank you to everyone here who''s been sharing their journey — it gave me the courage to finally launch. 🙏',
   NULL,
   'members', false, 34, 5, 'cat-0001-0001-0001-000000000004', NOW() - INTERVAL '3 days');

-- Post 8: Content from admin (2 days ago)
INSERT INTO posts (id, community_id, author_profile_id, content, media_urls, visibility, pinned, likes_count, comments_count, category_id, created_at) VALUES
  ('post-0001-0001-0001-000000000008', 'demo-community-0001-0001-000000000001', 'prof-0001-0001-0001-000000000002',
   E'🆕 New lesson dropped in the Content Strategy Masterclass!\n\n**"Repurposing Community Content"** — Learn how to turn one great community discussion into 9+ pieces of external content.\n\nThis is the strategy that helped me grow from 1k to 45k newsletter subscribers. Your community is a content goldmine most creators completely ignore.\n\nKey takeaway: The best content isn''t created from scratch. It''s extracted from real conversations.\n\nPro members, go check it out in Programs → Content Strategy → Content Systems.\n\nLet me know what you think! 🔥',
   NULL,
   'members', false, 28, 3, 'cat-0001-0001-0001-000000000001', NOW() - INTERVAL '2 days');

-- Post 9: Q&A/feedback (1 day ago)
INSERT INTO posts (id, community_id, author_profile_id, content, media_urls, visibility, pinned, likes_count, comments_count, category_id, created_at) VALUES
  ('post-0001-0001-0001-000000000009', 'demo-community-0001-0001-000000000001', 'prof-0001-0001-0001-000000000008',
   E'Newsletter friends — I need your help! 📧\n\nI have 45k email subscribers and I''m thinking about launching a paid community. But I''m nervous about:\n\n1. **Cannibalization** — Will people stop reading my free newsletter?\n2. **Expectations** — What do community members expect that''s different from email?\n3. **Time commitment** — I already spend 10hrs/week on the newsletter\n\nFor those of you who went newsletter → community:\n- How did you position it?\n- What % of subscribers converted?\n- Was it worth the extra time?\n\nTrying to make a decision this week. Your input means everything! 🙏',
   NULL,
   'members', false, 19, 4, 'cat-0001-0001-0001-000000000006', NOW() - INTERVAL '1 day');

-- Post 10: Poll post (6 hours ago)
INSERT INTO posts (id, community_id, author_profile_id, content, media_urls, visibility, pinned, likes_count, comments_count, category_id, created_at) VALUES
  ('post-0001-0001-0001-000000000010', 'demo-community-0001-0001-000000000001', 'prof-0001-0001-0001-000000000001',
   E'Quick poll! What topic should we cover in next week''s live call? 🗳️\n\nVote below and drop any specific questions in the comments!',
   NULL,
   'members', false, 15, 3, 'cat-0001-0001-0001-000000000001', NOW() - INTERVAL '6 hours');

-- ============================================
-- 8. COMMENTS (spread across posts)
-- ============================================
INSERT INTO comments (post_id, author_profile_id, content, created_at) VALUES
  -- Welcome post comments
  ('post-0001-0001-0001-000000000001', 'prof-0001-0001-0001-000000000003',
   'So excited to be here! Can''t wait to dive into the programs. The Getting Started guide was exactly what I needed.', NOW() - INTERVAL '29 days'),
  ('post-0001-0001-0001-000000000001', 'prof-0001-0001-0001-000000000004',
   'The weekly calls are incredible. Already learned more in 2 weeks than in 6 months of YouTube videos. This community is gold.', NOW() - INTERVAL '28 days'),
  ('post-0001-0001-0001-000000000001', 'prof-0001-0001-0001-000000000009',
   'Just joined! I''m Emily, building my first email list and dreaming about a community. So glad I found this place! 🙌', NOW() - INTERVAL '20 days'),
  ('post-0001-0001-0001-000000000001', 'prof-0001-0001-0001-000000000005',
   'Been here 3 months now. This community literally changed the trajectory of my business. The ROI on the Pro membership is insane.', NOW() - INTERVAL '15 days'),
  ('post-0001-0001-0001-000000000001', 'prof-0001-0001-0001-000000000007',
   'Hey everyone! Miguel here — YouTube creator exploring community as the next step. The monetization content looks 🔥', NOW() - INTERVAL '10 days'),
  ('post-0001-0001-0001-000000000001', 'prof-0001-0001-0001-000000000010',
   'Podcaster checking in! 🎙️ Love seeing so many different creator types here. Can''t wait to learn from all of you.', NOW() - INTERVAL '7 days'),
  ('post-0001-0001-0001-000000000001', 'prof-0001-0001-0001-000000000012',
   'Marketing consultant here, pivoting to community-led growth for my clients. The fundamentals program is exactly what I needed.', NOW() - INTERVAL '3 days'),
  ('post-0001-0001-0001-000000000001', 'prof-0001-0001-0001-000000000011',
   'Writer and coach, new to communities. The platform walkthrough lesson was super helpful. Already feeling at home!', NOW() - INTERVAL '1 day'),

  -- Sarah's intro comments
  ('post-0001-0001-0001-000000000002', 'prof-0001-0001-0001-000000000001',
   'Welcome Sarah! Scaling engagement is the #1 challenge at your stage. Check out "The Art of Engagement" lesson in the Community Building program — addresses this directly. Also: small group cohorts are a game-changer at 2k+.', NOW() - INTERVAL '24 days'),
  ('post-0001-0001-0001-000000000002', 'prof-0001-0001-0001-000000000005',
   'I''m at 5k members and we solved the engagement scaling problem with small group cohorts of 15-20 people. Each cohort has a "captain" who facilitates. DM me and I''ll share our system!', NOW() - INTERVAL '23 days'),
  ('post-0001-0001-0001-000000000002', 'prof-0001-0001-0001-000000000006',
   'I''m a fellow educator and I found that themed discussion days help a lot. "Teardown Tuesday" where members share their work for feedback is our most active day by far.', NOW() - INTERVAL '22 days'),
  ('post-0001-0001-0001-000000000002', 'prof-0001-0001-0001-000000000007',
   'Design community sounds awesome! I''d be interested in connecting — thinking about adding design resources to my video creator community.', NOW() - INTERVAL '21 days'),
  ('post-0001-0001-0001-000000000002', 'prof-0001-0001-0001-000000000004',
   'The lurker ratio increasing is actually normal at scale. The key metric isn''t % of contributors — it''s total # of contributors. If that''s growing, you''re fine!', NOW() - INTERVAL '20 days'),

  -- Marcus's win comments
  ('post-0001-0001-0001-000000000003', 'prof-0001-0001-0001-000000000001',
   'LET''S GO MARCUS! 🎉🎉🎉 So proud of you. This is what happens when you nail the fundamentals first. The patience to stay at 100 members for 6 months is what separates you from everyone else.', NOW() - INTERVAL '13 days'),
  ('post-0001-0001-0001-000000000003', 'prof-0001-0001-0001-000000000003',
   'Incredible journey! The live workouts for retention is genius. I''m totally stealing that idea for my design community — live design critiques!', NOW() - INTERVAL '13 days'),
  ('post-0001-0001-0001-000000000003', 'prof-0001-0001-0001-000000000010',
   'This is SO inspiring. I''m just starting out and posts like this keep me motivated. The timeline being 18 months is also really validating — no overnight success, just consistent work.', NOW() - INTERVAL '12 days'),
  ('post-0001-0001-0001-000000000003', 'prof-0001-0001-0001-000000000005',
   'The 40% churn reduction from live sessions is massive. What''s your retention rate now? And how often do you do the live workouts?', NOW() - INTERVAL '12 days'),
  ('post-0001-0001-0001-000000000003', 'prof-0001-0001-0001-000000000008',
   'As a newsletter writer, I love the detail in this post. Would you be open to doing a guest piece about your journey? My audience would eat this up.', NOW() - INTERVAL '11 days'),
  ('post-0001-0001-0001-000000000003', 'prof-0001-0001-0001-000000000009',
   'Goals! 🎯 I''m at $0 MRR right now but seeing these real numbers makes it feel achievable. Congrats Marcus!', NOW() - INTERVAL '10 days'),
  ('post-0001-0001-0001-000000000003', 'prof-0001-0001-0001-000000000004',
   'Happy to chat more about the annual plan strategy! That 30% conversion to annual is awesome. I''m at about 25% — would love to learn your pitch.', NOW() - INTERVAL '10 days'),

  -- Emily's platform question comments
  ('post-0001-0001-0001-000000000004', 'prof-0001-0001-0001-000000000005',
   'I''ve used Circle, Skool, and now KLASS. Quick takes:\n\n- Circle: Great features, but $89/mo before you earn anything\n- Skool: Simple but you''re building on THEIR brand, not yours\n- KLASS: White-label + courses + free tier = best value by far\n\nFor your needs, I''d go KLASS or Circle.', NOW() - INTERVAL '9 days'),
  ('post-0001-0001-0001-000000000004', 'prof-0001-0001-0001-000000000004',
   'I started on Discord and it was a disaster. No structure, endless scrolling, members couldn''t find anything. Moved to a proper community platform and retention doubled.', NOW() - INTERVAL '9 days'),
  ('post-0001-0001-0001-000000000004', 'prof-0001-0001-0001-000000000007',
   'White-label branding was the dealbreaker for me. My audience trusts MY brand. Having "Powered by [Platform]" everywhere undermines that trust.', NOW() - INTERVAL '8 days'),
  ('post-0001-0001-0001-000000000004', 'prof-0001-0001-0001-000000000001',
   'Great question Emily! The right platform depends on your stage. Early on, don''t overthink it — pick something, launch, and iterate. The platform matters less than the community you build on it. That said, starting free (like KLASS) removes a huge barrier to getting started.', NOW() - INTERVAL '8 days'),
  ('post-0001-0001-0001-000000000004', 'prof-0001-0001-0001-000000000006',
   'For course hosting specifically, make sure whatever you pick has good progress tracking. My students love seeing their completion %. It gamifies the learning.', NOW() - INTERVAL '8 days'),
  ('post-0001-0001-0001-000000000004', 'prof-0001-0001-0001-000000000012',
   'From a marketing perspective: own your platform, own your brand, own your data. That''s non-negotiable if you''re building a real business.', NOW() - INTERVAL '7 days'),

  -- David's resource post comments
  ('post-0001-0001-0001-000000000005', 'prof-0001-0001-0001-000000000003',
   'Just downloaded this — the A/B test results alone are worth a Pro membership. Going from 15% to 42% conversion is INCREDIBLE. Implementing this week!', NOW() - INTERVAL '6 days'),
  ('post-0001-0001-0001-000000000005', 'prof-0001-0001-0001-000000000006',
   'This is exactly what I needed! Quick question — do you segment your onboarding based on how members found you? (Organic vs referral vs paid)', NOW() - INTERVAL '6 days'),
  ('post-0001-0001-0001-000000000005', 'prof-0001-0001-0001-000000000008',
   'David, this is gold. The email templates are so well-written. Would you be open to co-hosting a workshop on onboarding sequences?', NOW() - INTERVAL '5 days'),
  ('post-0001-0001-0001-000000000005', 'prof-0001-0001-0001-000000000001',
   'This is why I love this community. Members sharing real, actionable stuff from their own experience. David, you''re a legend 🙌', NOW() - INTERVAL '5 days'),

  -- Alex's rituals post comments
  ('post-0001-0001-0001-000000000006', 'prof-0001-0001-0001-000000000004',
   'Our biggest ritual: "Win Wednesday." Members share ANY win from the week. It''s our most engaged post every week. People actually look forward to Wednesdays now.', NOW() - INTERVAL '4 days'),
  ('post-0001-0001-0001-000000000006', 'prof-0001-0001-0001-000000000007',
   'I do "Create Something Friday" — every Friday members share something they made that week. A video, a blog post, a landing page, anything. It creates incredible accountability.', NOW() - INTERVAL '4 days'),
  ('post-0001-0001-0001-000000000006', 'prof-0001-0001-0001-000000000003',
   'We''re just starting rituals in my design community. Going to try "Teardown Tuesday" where members submit their designs for group feedback. Nervous but excited!', NOW() - INTERVAL '3 days'),
  ('post-0001-0001-0001-000000000006', 'prof-0001-0001-0001-000000000006',
   '100% agree. My community fell flat when I posted "whenever I felt like it." The moment I committed to a schedule, everything changed. Consistency is everything.', NOW() - INTERVAL '3 days'),
  ('post-0001-0001-0001-000000000006', 'prof-0001-0001-0001-000000000011',
   'New here and I love this thread. For my future writing community, I''m thinking "First Draft Friday" where people share rough drafts without judgment. Thoughts?', NOW() - INTERVAL '2 days'),

  -- Priya's win comments
  ('post-0001-0001-0001-000000000007', 'prof-0001-0001-0001-000000000001',
   'THIS IS AMAZING! 🎉 3 paying members is a HUGE milestone. You now have proof that people will pay for what you''re building. The jump from 0 to 1 is the hardest. From 3 to 30 is just doing more of what''s working!', NOW() - INTERVAL '2 days'),
  ('post-0001-0001-0001-000000000007', 'prof-0001-0001-0001-000000000004',
   'Personalized video messages are SO underrated. I did the same thing — 25% conversion rate on video DMs vs 5% on text. People can feel the effort.', NOW() - INTERVAL '2 days'),
  ('post-0001-0001-0001-000000000007', 'prof-0001-0001-0001-000000000009',
   'This gives me hope! I''m still at $0 but seeing someone at a similar stage succeed makes it feel real. Rooting for your 10-member goal! 🙌', NOW() - INTERVAL '2 days'),
  ('post-0001-0001-0001-000000000007', 'prof-0001-0001-0001-000000000003',
   'The founding member discount is smart. I wish I''d done that. It creates urgency AND loyalty. Those 3 members will be your biggest advocates forever.', NOW() - INTERVAL '1 day'),
  ('post-0001-0001-0001-000000000007', 'prof-0001-0001-0001-000000000005',
   'Pro tip: Now that you have 3 paying members, ask each of them for a testimonial and a referral. Social proof + word of mouth = your best growth channel at this stage.', NOW() - INTERVAL '1 day'),

  -- Jordan's new lesson post comments
  ('post-0001-0001-0001-000000000008', 'prof-0001-0001-0001-000000000008',
   'Just went through it — the section on turning discussions into Twitter threads is brilliant. Already repurposed 2 threads from our community conversations. 🔥', NOW() - INTERVAL '1 day'),
  ('post-0001-0001-0001-000000000008', 'prof-0001-0001-0001-000000000005',
   'This should be required reading for every community builder. We''re all sitting on a goldmine of content and don''t realize it.', NOW() - INTERVAL '1 day'),
  ('post-0001-0001-0001-000000000008', 'prof-0001-0001-0001-000000000007',
   'The permission framework section is key. I''ve seen creators get in trouble sharing member content without asking. Great that you addressed this!', NOW() - INTERVAL '12 hours'),

  -- Lisa's newsletter question comments
  ('post-0001-0001-0001-000000000009', 'prof-0001-0001-0001-000000000005',
   'I went from newsletter → community. Key learnings:\n\n1. Don''t cannibalize — position community as the "action" layer on top of your "information" layer\n2. Expect 2-5% conversion rate\n3. The extra time is worth it if community members engage 10x more than email subscribers\n\nHappy to jump on a call to share more details!', NOW() - INTERVAL '20 hours'),
  ('post-0001-0001-0001-000000000009', 'prof-0001-0001-0001-000000000001',
   'Lisa, with 45k subscribers you''re in an incredible position. Here''s how I''d think about it:\n\n- Keep newsletter free (top of funnel)\n- Community = premium layer ($29-49/mo)\n- Even 2% conversion = 900 members = $26k+ MRR\n\nThe key is framing it as "newsletter = what, community = how."', NOW() - INTERVAL '18 hours'),
  ('post-0001-0001-0001-000000000009', 'prof-0001-0001-0001-000000000007',
   'I made this exact transition with my YouTube audience. The community members are 10x more engaged and provide incredible content ideas. Time investment increased but so did revenue.', NOW() - INTERVAL '15 hours'),
  ('post-0001-0001-0001-000000000009', 'prof-0001-0001-0001-000000000003',
   'One thing nobody mentions: community members become your best newsletter content source. The ROI compounds because better content → more subscribers → more community members.', NOW() - INTERVAL '12 hours'),

  -- Poll post comments
  ('post-0001-0001-0001-000000000010', 'prof-0001-0001-0001-000000000006',
   'Voted for onboarding systems — it''s the thing I need most help with right now!', NOW() - INTERVAL '5 hours'),
  ('post-0001-0001-0001-000000000010', 'prof-0001-0001-0001-000000000003',
   'Would love a deep dive on pricing. Specifically: how to raise prices without losing existing members.', NOW() - INTERVAL '4 hours'),
  ('post-0001-0001-0001-000000000010', 'prof-0001-0001-0001-000000000011',
   'As a newbie, I''d love the onboarding topic. How do you make new members feel welcome at scale?', NOW() - INTERVAL '2 hours');

-- ============================================
-- 9. POST LIKES (spread across posts and members)
-- ============================================
-- Every member likes the welcome post
INSERT INTO post_likes (post_id, profile_id) VALUES
  ('post-0001-0001-0001-000000000001', 'prof-0001-0001-0001-000000000003'),
  ('post-0001-0001-0001-000000000001', 'prof-0001-0001-0001-000000000004'),
  ('post-0001-0001-0001-000000000001', 'prof-0001-0001-0001-000000000005'),
  ('post-0001-0001-0001-000000000001', 'prof-0001-0001-0001-000000000006'),
  ('post-0001-0001-0001-000000000001', 'prof-0001-0001-0001-000000000007'),
  ('post-0001-0001-0001-000000000001', 'prof-0001-0001-0001-000000000008'),
  ('post-0001-0001-0001-000000000001', 'prof-0001-0001-0001-000000000009'),
  ('post-0001-0001-0001-000000000001', 'prof-0001-0001-0001-000000000010'),
  ('post-0001-0001-0001-000000000001', 'prof-0001-0001-0001-000000000011'),
  ('post-0001-0001-0001-000000000001', 'prof-0001-0001-0001-000000000012');

-- Marcus's win post gets lots of likes
INSERT INTO post_likes (post_id, profile_id) VALUES
  ('post-0001-0001-0001-000000000003', 'prof-0001-0001-0001-000000000001'),
  ('post-0001-0001-0001-000000000003', 'prof-0001-0001-0001-000000000002'),
  ('post-0001-0001-0001-000000000003', 'prof-0001-0001-0001-000000000003'),
  ('post-0001-0001-0001-000000000003', 'prof-0001-0001-0001-000000000005'),
  ('post-0001-0001-0001-000000000003', 'prof-0001-0001-0001-000000000006'),
  ('post-0001-0001-0001-000000000003', 'prof-0001-0001-0001-000000000007'),
  ('post-0001-0001-0001-000000000003', 'prof-0001-0001-0001-000000000008'),
  ('post-0001-0001-0001-000000000003', 'prof-0001-0001-0001-000000000009'),
  ('post-0001-0001-0001-000000000003', 'prof-0001-0001-0001-000000000010'),
  ('post-0001-0001-0001-000000000003', 'prof-0001-0001-0001-000000000011'),
  ('post-0001-0001-0001-000000000003', 'prof-0001-0001-0001-000000000012');

-- Other posts get varied likes
INSERT INTO post_likes (post_id, profile_id) VALUES
  ('post-0001-0001-0001-000000000002', 'prof-0001-0001-0001-000000000001'),
  ('post-0001-0001-0001-000000000002', 'prof-0001-0001-0001-000000000004'),
  ('post-0001-0001-0001-000000000002', 'prof-0001-0001-0001-000000000005'),
  ('post-0001-0001-0001-000000000002', 'prof-0001-0001-0001-000000000006'),
  ('post-0001-0001-0001-000000000002', 'prof-0001-0001-0001-000000000007'),

  ('post-0001-0001-0001-000000000004', 'prof-0001-0001-0001-000000000001'),
  ('post-0001-0001-0001-000000000004', 'prof-0001-0001-0001-000000000003'),
  ('post-0001-0001-0001-000000000004', 'prof-0001-0001-0001-000000000005'),
  ('post-0001-0001-0001-000000000004', 'prof-0001-0001-0001-000000000007'),

  ('post-0001-0001-0001-000000000005', 'prof-0001-0001-0001-000000000001'),
  ('post-0001-0001-0001-000000000005', 'prof-0001-0001-0001-000000000003'),
  ('post-0001-0001-0001-000000000005', 'prof-0001-0001-0001-000000000004'),
  ('post-0001-0001-0001-000000000005', 'prof-0001-0001-0001-000000000006'),
  ('post-0001-0001-0001-000000000005', 'prof-0001-0001-0001-000000000007'),
  ('post-0001-0001-0001-000000000005', 'prof-0001-0001-0001-000000000008'),

  ('post-0001-0001-0001-000000000006', 'prof-0001-0001-0001-000000000003'),
  ('post-0001-0001-0001-000000000006', 'prof-0001-0001-0001-000000000004'),
  ('post-0001-0001-0001-000000000006', 'prof-0001-0001-0001-000000000005'),
  ('post-0001-0001-0001-000000000006', 'prof-0001-0001-0001-000000000007'),
  ('post-0001-0001-0001-000000000006', 'prof-0001-0001-0001-000000000011'),

  ('post-0001-0001-0001-000000000007', 'prof-0001-0001-0001-000000000001'),
  ('post-0001-0001-0001-000000000007', 'prof-0001-0001-0001-000000000003'),
  ('post-0001-0001-0001-000000000007', 'prof-0001-0001-0001-000000000004'),
  ('post-0001-0001-0001-000000000007', 'prof-0001-0001-0001-000000000005'),
  ('post-0001-0001-0001-000000000007', 'prof-0001-0001-0001-000000000009'),

  ('post-0001-0001-0001-000000000008', 'prof-0001-0001-0001-000000000003'),
  ('post-0001-0001-0001-000000000008', 'prof-0001-0001-0001-000000000005'),
  ('post-0001-0001-0001-000000000008', 'prof-0001-0001-0001-000000000007'),
  ('post-0001-0001-0001-000000000008', 'prof-0001-0001-0001-000000000008'),

  ('post-0001-0001-0001-000000000009', 'prof-0001-0001-0001-000000000001'),
  ('post-0001-0001-0001-000000000009', 'prof-0001-0001-0001-000000000005'),
  ('post-0001-0001-0001-000000000009', 'prof-0001-0001-0001-000000000007'),

  ('post-0001-0001-0001-000000000010', 'prof-0001-0001-0001-000000000003'),
  ('post-0001-0001-0001-000000000010', 'prof-0001-0001-0001-000000000006'),
  ('post-0001-0001-0001-000000000010', 'prof-0001-0001-0001-000000000011');

-- ============================================
-- 10. POLL (on latest post)
-- ============================================
INSERT INTO polls (id, post_id, question, multiple_choice) VALUES
  ('poll-0001-0001-0001-000000000001', 'post-0001-0001-0001-000000000010', 'What topic should we cover next week?', false);

INSERT INTO poll_options (id, poll_id, option_text, votes_count, display_order) VALUES
  ('popt-0001-0001-0001-000000000001', 'poll-0001-0001-0001-000000000001', 'Community pricing strategies', 15, 0),
  ('popt-0001-0001-0001-000000000002', 'poll-0001-0001-0001-000000000001', 'Member onboarding systems', 23, 1),
  ('popt-0001-0001-0001-000000000003', 'poll-0001-0001-0001-000000000001', 'Content repurposing workflows', 11, 2),
  ('popt-0001-0001-0001-000000000004', 'poll-0001-0001-0001-000000000001', 'Building a launch waitlist', 8, 3);

-- Add some poll votes
INSERT INTO poll_votes (poll_id, option_id, profile_id) VALUES
  ('poll-0001-0001-0001-000000000001', 'popt-0001-0001-0001-000000000002', 'prof-0001-0001-0001-000000000003'),
  ('poll-0001-0001-0001-000000000001', 'popt-0001-0001-0001-000000000001', 'prof-0001-0001-0001-000000000004'),
  ('poll-0001-0001-0001-000000000001', 'popt-0001-0001-0001-000000000002', 'prof-0001-0001-0001-000000000005'),
  ('poll-0001-0001-0001-000000000001', 'popt-0001-0001-0001-000000000002', 'prof-0001-0001-0001-000000000006'),
  ('poll-0001-0001-0001-000000000001', 'popt-0001-0001-0001-000000000003', 'prof-0001-0001-0001-000000000007'),
  ('poll-0001-0001-0001-000000000001', 'popt-0001-0001-0001-000000000001', 'prof-0001-0001-0001-000000000009'),
  ('poll-0001-0001-0001-000000000001', 'popt-0001-0001-0001-000000000002', 'prof-0001-0001-0001-000000000011');

-- ============================================
-- 11. EVENTS (past + upcoming)
-- ============================================
INSERT INTO events (community_id, title, description, starts_at, ends_at, location, external_url, visibility) VALUES
  -- Past events (give the community history)
  ('demo-community-0001-0001-000000000001',
   'Community Kickoff Call',
   'Our very first community call! We introduced the platform, shared the roadmap, and met the founding members.',
   NOW() - INTERVAL '28 days' + TIME '18:00:00',
   NOW() - INTERVAL '28 days' + TIME '19:30:00',
   'Zoom', 'https://zoom.us/j/123456789', 'members'),

  ('demo-community-0001-0001-000000000001',
   'Workshop: Finding Your Niche',
   'Hands-on workshop where members identified and validated their community niches. Great exercises and group feedback.',
   NOW() - INTERVAL '21 days' + TIME '17:00:00',
   NOW() - INTERVAL '21 days' + TIME '19:00:00',
   'Zoom', 'https://zoom.us/j/123456789', 'members'),

  ('demo-community-0001-0001-000000000001',
   'Pro Mastermind: Pricing Deep-Dive',
   'Exclusive mastermind for Pro/VIP members. We analyzed each member''s pricing strategy and optimized their tier structure.',
   NOW() - INTERVAL '14 days' + TIME '17:00:00',
   NOW() - INTERVAL '14 days' + TIME '18:30:00',
   'Zoom', 'https://zoom.us/j/987654321', 'paid'),

  ('demo-community-0001-0001-000000000001',
   'Weekly Community Call #3',
   'Member spotlight on Marcus (fitness community hitting $10k MRR), Q&A on platform selection, and preview of new content.',
   NOW() - INTERVAL '7 days' + TIME '18:00:00',
   NOW() - INTERVAL '7 days' + TIME '19:00:00',
   'Zoom', 'https://zoom.us/j/123456789', 'members'),

  -- Upcoming events
  ('demo-community-0001-0001-000000000001',
   'Weekly Community Call',
   'Join us for our weekly live call! This week: poll results reveal, member Q&A, and a special guest sharing their $50k community launch strategy.',
   NOW() + INTERVAL '2 days' + TIME '18:00:00',
   NOW() + INTERVAL '2 days' + TIME '19:00:00',
   'Zoom', 'https://zoom.us/j/123456789', 'members'),

  ('demo-community-0001-0001-000000000001',
   'Pro Members Mastermind',
   'Exclusive mastermind for Pro & VIP members. Deep dive into advanced strategies with hot seat coaching. This month: onboarding optimization.',
   NOW() + INTERVAL '5 days' + TIME '17:00:00',
   NOW() + INTERVAL '5 days' + TIME '18:30:00',
   'Zoom', 'https://zoom.us/j/987654321', 'paid'),

  ('demo-community-0001-0001-000000000001',
   'New Member Orientation',
   'Monthly welcome session for new members. Get oriented, meet fellow newcomers, and learn how to get the most out of Creator Academy. All experience levels welcome!',
   NOW() + INTERVAL '8 days' + TIME '16:00:00',
   NOW() + INTERVAL '8 days' + TIME '17:00:00',
   'Zoom', 'https://zoom.us/j/111222333', 'members'),

  ('demo-community-0001-0001-000000000001',
   'Workshop: Building Your Onboarding System',
   'Hands-on workshop where you''ll build a complete member onboarding flow. Walk away with email templates, automation workflows, and a 7-day welcome sequence. Bring your laptop!',
   NOW() + INTERVAL '14 days' + TIME '15:00:00',
   NOW() + INTERVAL '14 days' + TIME '17:00:00',
   'Zoom', 'https://zoom.us/j/444555666', 'paid'),

  ('demo-community-0001-0001-000000000001',
   'Monthly AMA with Alex & Jordan',
   'Ask us anything! Bring your burning questions about community building, content strategy, monetization, tech stack, or anything else. No question is too basic.',
   NOW() + INTERVAL '21 days' + TIME '18:00:00',
   NOW() + INTERVAL '21 days' + TIME '19:30:00',
   'Zoom', 'https://zoom.us/j/555666777', 'members'),

  ('demo-community-0001-0001-000000000001',
   'Guest Expert: From 0 to $100k with Community-Led Growth',
   'Special guest session with a creator who built a $100k/year community in 12 months. Learn their exact playbook, mistakes, and what they''d do differently.',
   NOW() + INTERVAL '28 days' + TIME '17:00:00',
   NOW() + INTERVAL '28 days' + TIME '18:30:00',
   'Zoom', 'https://zoom.us/j/777888999', 'members');

-- ============================================
-- 12. RESOURCES (organized by folder)
-- ============================================
INSERT INTO resources (community_id, title, description, type, url, folder, visibility, order_index) VALUES
  -- Getting Started folder
  ('demo-community-0001-0001-000000000001',
   'Community Launch Checklist',
   'A comprehensive 50-point checklist for launching your community. Covers everything from platform setup to your first 30 days of content.',
   'file', 'https://example.com/launch-checklist.pdf', 'Getting Started', 'members', 0),

  ('demo-community-0001-0001-000000000001',
   'Welcome Sequence Templates',
   '5 proven email templates for onboarding new members. Copy, customize, and automate your welcome flow in under an hour.',
   'file', 'https://example.com/welcome-templates.pdf', 'Getting Started', 'members', 1),

  ('demo-community-0001-0001-000000000001',
   'Community Naming Guide',
   'How to choose the perfect name for your community. Includes brainstorming exercises, checklist, and 50+ naming patterns that work.',
   'file', 'https://example.com/naming-guide.pdf', 'Getting Started', 'members', 2),

  -- Templates folder
  ('demo-community-0001-0001-000000000001',
   'Content Calendar Template',
   'Notion template for planning your community content. Pre-filled with content types, categories, and a 12-week planning framework.',
   'link', 'https://notion.so/content-calendar', 'Templates', 'members', 0),

  ('demo-community-0001-0001-000000000001',
   'Member Survey Template',
   'Typeform survey to understand your members better. 15 questions covering demographics, goals, pain points, and feature requests.',
   'link', 'https://typeform.com/survey-template', 'Templates', 'members', 1),

  ('demo-community-0001-0001-000000000001',
   'Community Metrics Dashboard',
   'Google Sheets template to track your key community metrics: growth rate, engagement rate, churn, MRR, and more.',
   'link', 'https://docs.google.com/spreadsheets/community-metrics', 'Templates', 'members', 2),

  -- Pro Resources folder
  ('demo-community-0001-0001-000000000001',
   'Pricing Calculator',
   'Interactive spreadsheet to model your community pricing. Test different tier structures, annual vs monthly, and project revenue.',
   'file', 'https://example.com/pricing-calc.xlsx', 'Pro Resources', 'paid', 0),

  ('demo-community-0001-0001-000000000001',
   'Onboarding Sequence Playbook',
   'The complete 7-day onboarding system that took our trial-to-paid conversion from 15% to 42%. Includes automation workflows and email templates.',
   'file', 'https://example.com/onboarding-playbook.pdf', 'Pro Resources', 'paid', 1),

  ('demo-community-0001-0001-000000000001',
   'Partnership Agreement Template',
   'Legal template for community partnerships and cross-promotions. Reviewed by our lawyer, ready to customize.',
   'file', 'https://example.com/partnership-template.pdf', 'Pro Resources', 'paid', 2),

  ('demo-community-0001-0001-000000000001',
   'Churn Prevention Checklist',
   'A detailed checklist for identifying and preventing member churn. Includes warning signs, intervention strategies, and win-back email templates.',
   'file', 'https://example.com/churn-prevention.pdf', 'Pro Resources', 'paid', 3),

  -- Tools & Links folder
  ('demo-community-0001-0001-000000000001',
   'Recommended Tech Stack',
   'Our curated list of the best tools for community builders. Organized by category: platform, email, payments, analytics, design.',
   'link', 'https://example.com/tech-stack', 'Tools & Links', 'public', 0),

  ('demo-community-0001-0001-000000000001',
   'Community Builder Resource Hub',
   'A curated collection of the best articles, podcasts, and books on community building. Updated monthly.',
   'link', 'https://example.com/resource-hub', 'Tools & Links', 'public', 1),

  ('demo-community-0001-0001-000000000001',
   'Free Stock Photos for Communities',
   'Our favorite sources for high-quality, free stock photos perfect for community posts and course thumbnails.',
   'link', 'https://example.com/stock-photos', 'Tools & Links', 'public', 2);

-- ============================================
-- 13. MEMBER TAGS
-- ============================================
INSERT INTO member_tags (id, community_id, name, color, description) VALUES
  ('mtag-0001-0001-0001-000000000001', 'demo-community-0001-0001-000000000001', 'Founding Member', '#6366f1', 'Joined during the founding period'),
  ('mtag-0001-0001-0001-000000000002', 'demo-community-0001-0001-000000000001', 'Top Contributor', '#ec4899', 'Consistently contributes to discussions'),
  ('mtag-0001-0001-0001-000000000003', 'demo-community-0001-0001-000000000001', 'Course Creator', '#10b981', 'Runs their own online courses'),
  ('mtag-0001-0001-0001-000000000004', 'demo-community-0001-0001-000000000001', 'Newbie', '#f59e0b', 'New to community building');

INSERT INTO profile_tags (profile_id, tag_id) VALUES
  ('prof-0001-0001-0001-000000000003', 'mtag-0001-0001-0001-000000000001'),
  ('prof-0001-0001-0001-000000000004', 'mtag-0001-0001-0001-000000000001'),
  ('prof-0001-0001-0001-000000000005', 'mtag-0001-0001-0001-000000000001'),
  ('prof-0001-0001-0001-000000000004', 'mtag-0001-0001-0001-000000000002'),
  ('prof-0001-0001-0001-000000000005', 'mtag-0001-0001-0001-000000000002'),
  ('prof-0001-0001-0001-000000000007', 'mtag-0001-0001-0001-000000000002'),
  ('prof-0001-0001-0001-000000000006', 'mtag-0001-0001-0001-000000000003'),
  ('prof-0001-0001-0001-000000000007', 'mtag-0001-0001-0001-000000000003'),
  ('prof-0001-0001-0001-000000000009', 'mtag-0001-0001-0001-000000000004'),
  ('prof-0001-0001-0001-000000000011', 'mtag-0001-0001-0001-000000000004'),
  ('prof-0001-0001-0001-000000000012', 'mtag-0001-0001-0001-000000000004');

-- ============================================
-- 14. LESSON PROGRESS (some members have started programs)
-- ============================================
INSERT INTO lesson_progress (lesson_id, profile_id, completed_at) VALUES
  -- Sarah completed Getting Started
  ('less-0001-0001-0001-000000000001', 'prof-0001-0001-0001-000000000003', NOW() - INTERVAL '24 days'),
  ('less-0001-0001-0001-000000000002', 'prof-0001-0001-0001-000000000003', NOW() - INTERVAL '23 days'),
  ('less-0001-0001-0001-000000000003', 'prof-0001-0001-0001-000000000003', NOW() - INTERVAL '22 days'),
  ('less-0001-0001-0001-000000000004', 'prof-0001-0001-0001-000000000003', NOW() - INTERVAL '21 days'),
  -- Sarah in Community Building
  ('less-0001-0001-0001-000000000005', 'prof-0001-0001-0001-000000000003', NOW() - INTERVAL '18 days'),
  ('less-0001-0001-0001-000000000006', 'prof-0001-0001-0001-000000000003', NOW() - INTERVAL '15 days'),

  -- Marcus completed Getting Started + Community Building
  ('less-0001-0001-0001-000000000001', 'prof-0001-0001-0001-000000000004', NOW() - INTERVAL '28 days'),
  ('less-0001-0001-0001-000000000002', 'prof-0001-0001-0001-000000000004', NOW() - INTERVAL '27 days'),
  ('less-0001-0001-0001-000000000003', 'prof-0001-0001-0001-000000000004', NOW() - INTERVAL '26 days'),
  ('less-0001-0001-0001-000000000004', 'prof-0001-0001-0001-000000000004', NOW() - INTERVAL '25 days'),
  ('less-0001-0001-0001-000000000005', 'prof-0001-0001-0001-000000000004', NOW() - INTERVAL '22 days'),
  ('less-0001-0001-0001-000000000006', 'prof-0001-0001-0001-000000000004', NOW() - INTERVAL '20 days'),
  ('less-0001-0001-0001-000000000007', 'prof-0001-0001-0001-000000000004', NOW() - INTERVAL '18 days'),
  ('less-0001-0001-0001-000000000008', 'prof-0001-0001-0001-000000000004', NOW() - INTERVAL '16 days'),
  ('less-0001-0001-0001-000000000009', 'prof-0001-0001-0001-000000000004', NOW() - INTERVAL '14 days'),
  ('less-0001-0001-0001-000000000010', 'prof-0001-0001-0001-000000000004', NOW() - INTERVAL '12 days'),

  -- David completed everything including paid programs
  ('less-0001-0001-0001-000000000001', 'prof-0001-0001-0001-000000000005', NOW() - INTERVAL '26 days'),
  ('less-0001-0001-0001-000000000002', 'prof-0001-0001-0001-000000000005', NOW() - INTERVAL '25 days'),
  ('less-0001-0001-0001-000000000003', 'prof-0001-0001-0001-000000000005', NOW() - INTERVAL '24 days'),
  ('less-0001-0001-0001-000000000004', 'prof-0001-0001-0001-000000000005', NOW() - INTERVAL '23 days'),
  ('less-0001-0001-0001-000000000011', 'prof-0001-0001-0001-000000000005', NOW() - INTERVAL '20 days'),
  ('less-0001-0001-0001-000000000012', 'prof-0001-0001-0001-000000000005', NOW() - INTERVAL '18 days'),
  ('less-0001-0001-0001-000000000013', 'prof-0001-0001-0001-000000000005', NOW() - INTERVAL '16 days'),
  ('less-0001-0001-0001-000000000015', 'prof-0001-0001-0001-000000000005', NOW() - INTERVAL '14 days'),

  -- Emily started Getting Started
  ('less-0001-0001-0001-000000000001', 'prof-0001-0001-0001-000000000009', NOW() - INTERVAL '8 days'),
  ('less-0001-0001-0001-000000000002', 'prof-0001-0001-0001-000000000009', NOW() - INTERVAL '7 days');

-- ============================================
-- Done! Summary of seeded data:
-- ============================================
-- • 1 community ("Creator Academy" at /demo)
-- • 5 community modules
-- • 3 membership tiers (Free, Pro, VIP)
-- • 12 member profiles (2 admins, 6 paid, 4 free)
-- • 6 post categories
-- • 4 programs with 10 sections and 18 lessons
-- • 10 community posts spanning 30 days
-- • 60+ comments across all posts
-- • 40+ post likes
-- • 1 poll with options and votes
-- • 10 events (4 past, 6 upcoming)
-- • 13 resources in 4 folders
-- • 4 member tags with assignments
-- • Lesson progress for multiple members
-- ============================================
