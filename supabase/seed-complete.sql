-- Complete Seed Data for Klass Demo
-- Run this to reset and populate all demo data
-- Execute in order: 1) migrations, 2) this file

-- ============================================
-- CLEANUP (optional - uncomment to reset)
-- ============================================
-- DELETE FROM poll_votes;
-- DELETE FROM poll_options;
-- DELETE FROM polls;
-- DELETE FROM post_likes;
-- DELETE FROM comments;
-- DELETE FROM posts;
-- DELETE FROM post_categories;
-- DELETE FROM events;
-- DELETE FROM resources;
-- DELETE FROM lesson_progress;
-- DELETE FROM lessons;
-- DELETE FROM programs;
-- DELETE FROM community_modules;
-- DELETE FROM profiles;
-- DELETE FROM communities WHERE slug = 'demo-community';

-- ============================================
-- DEMO COMMUNITY
-- ============================================
INSERT INTO communities (id, name, slug, description, logo_url, primary_color, accent_color, settings_json)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Creator Academy',
  'demo-community',
  'Master the art of building and monetizing online communities. Join 5,000+ creators on their journey to building sustainable online businesses.',
  'https://api.dicebear.com/7.x/shapes/svg?seed=CreatorAcademy&backgroundColor=6366f1',
  '#6366f1',
  '#8b5cf6',
  '{"welcome_message": "Welcome to Creator Academy! Start with the Getting Started program."}'
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  logo_url = EXCLUDED.logo_url,
  primary_color = EXCLUDED.primary_color,
  accent_color = EXCLUDED.accent_color;

-- ============================================
-- COMMUNITY MODULES
-- ============================================
DELETE FROM community_modules WHERE community_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
INSERT INTO community_modules (community_id, key, label, enabled, order_index) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'feed', 'Community', true, 0),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'programs', 'Programs', true, 1),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'resources', 'Resources', true, 2),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'events', 'Events', true, 3),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'members', 'Members', true, 4);

-- ============================================
-- PROFILES (Demo Users with Avatars)
-- ============================================
INSERT INTO profiles (id, clerk_user_id, community_id, role, tier, display_name, avatar_url, bio)
VALUES
  -- Admin/Creator
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'demo_admin', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'ADMIN', 'PAID',
   'Alex Rivera',
   'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
   'Community founder & course creator. Helped 10,000+ creators build profitable communities.'),

  -- Active Members
  ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'demo_user_1', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'MEMBER', 'PAID',
   'Sarah Chen',
   'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
   'Building a community for designers. 2,000 members and growing!'),

  ('b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a24', 'demo_user_2', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'MEMBER', 'PAID',
   'Marcus Johnson',
   'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
   'Fitness coach turned community builder. Helping trainers go online.'),

  ('b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a25', 'demo_user_3', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'MEMBER', 'FREE',
   'Emily Watson',
   'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
   'Just started my journey. Excited to learn from everyone here!'),

  ('b4eebc99-9c0b-4ef8-bb6d-6bb9bd380a26', 'demo_user_4', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'MEMBER', 'PAID',
   'David Kim',
   'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
   'Tech entrepreneur. Built 3 successful SaaS communities.'),

  ('b5eebc99-9c0b-4ef8-bb6d-6bb9bd380a27', 'demo_user_5', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'MEMBER', 'FREE',
   'Jessica Martinez',
   'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
   'Content creator & podcaster. Learning community building.')
ON CONFLICT (clerk_user_id, community_id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  avatar_url = EXCLUDED.avatar_url,
  bio = EXCLUDED.bio;

-- ============================================
-- POST CATEGORIES
-- ============================================
DELETE FROM post_categories WHERE community_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
INSERT INTO post_categories (id, community_id, name, slug, color, icon, display_order) VALUES
  ('cat-0001-0001-0001-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'General', 'general', '#6366f1', 'message-circle', 1),
  ('cat-0001-0001-0001-000000000002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Introductions', 'introductions', '#10b981', 'hand-wave', 2),
  ('cat-0001-0001-0001-000000000003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Q&A', 'qa', '#f59e0b', 'help-circle', 3),
  ('cat-0001-0001-0001-000000000004', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Wins', 'wins', '#ec4899', 'trophy', 4),
  ('cat-0001-0001-0001-000000000005', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Resources', 'resources', '#8b5cf6', 'folder', 5),
  ('cat-0001-0001-0001-000000000006', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Feedback', 'feedback', '#06b6d4', 'message-square', 6);

-- ============================================
-- PROGRAMS (with thumbnail images)
-- ============================================
INSERT INTO programs (id, community_id, title, description, thumbnail_url, visibility, published, order_index)
VALUES
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'Getting Started',
   'Everything you need to hit the ground running. Complete this program first to get the most out of the community.',
   'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
   'members', true, 0),

  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'Community Building Fundamentals',
   'Learn the core principles of building an engaged online community from scratch. From finding your niche to scaling to 10,000 members.',
   'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
   'members', true, 1),

  ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'Content Strategy Masterclass',
   'Create content that attracts, engages, and converts. Build a sustainable content engine for your community.',
   'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
   'paid', true, 2),

  ('c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'Monetization Playbook',
   'Turn your community into a sustainable business. Pricing strategies, membership tiers, and revenue optimization.',
   'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&q=80',
   'paid', true, 3)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  thumbnail_url = EXCLUDED.thumbnail_url;

-- ============================================
-- LESSONS (with video content)
-- ============================================
INSERT INTO lessons (id, program_id, title, content, video_url, order_index, visibility, published)
VALUES
  -- Getting Started Lessons
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
   'Welcome to Creator Academy',
   E'# Welcome to Creator Academy! 🎉\n\nWe''re thrilled to have you here. This community is designed to help you build, grow, and monetize your online community.\n\n## What You''ll Learn\n\n- **Community Building** - The fundamentals of creating engaged communities\n- **Content Strategy** - How to create content that converts\n- **Monetization** - Turn your community into a business\n\n## Getting Started\n\n1. Complete this orientation program\n2. Introduce yourself in the community feed\n3. Join our weekly live calls\n4. Start the Community Building Fundamentals program\n\nLet''s build something amazing together!',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 0, 'members', true),

  ('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
   'Setting Up Your Profile',
   E'# Setting Up Your Profile\n\nYour profile is your first impression. Let''s make it count!\n\n## Profile Essentials\n\n### 1. Profile Photo\nUse a clear, professional headshot. Profiles with photos get 3x more engagement.\n\n### 2. Bio\nKeep it concise but informative:\n- Who you are\n- What you''re building\n- What you want to learn\n\n### 3. Connect\nOnce your profile is set up, introduce yourself in the community!',
   null, 1, 'members', true),

  ('d2eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
   'Community Guidelines',
   E'# Community Guidelines\n\nOur community thrives because of our shared values.\n\n## Our Core Values\n\n### 🤝 Be Respectful\nTreat others how you want to be treated. We''re all here to learn and grow.\n\n### 💡 Share Knowledge\nHelp others by sharing your experiences, wins, and lessons learned.\n\n### 🎯 Stay Focused\nKeep discussions relevant and constructive.\n\n### 🚫 No Spam\nQuality over quantity. No self-promotion without providing value first.\n\n## Reporting Issues\nIf you see something that violates these guidelines, please report it to the admin team.',
   null, 2, 'members', true),

  -- Community Building Lessons
  ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a45', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
   'What Makes a Community',
   E'# What Makes a Community?\n\nNot every group of people is a community. Let''s understand what sets real communities apart.\n\n## The Community Triangle\n\n1. **Shared Interest** - A common topic or goal that brings people together\n2. **Shared Identity** - Members see themselves as part of something bigger\n3. **Shared Rituals** - Regular activities that reinforce belonging\n\n## Community vs. Audience\n\n| Audience | Community |\n|----------|----------|\n| One-way communication | Two-way interaction |\n| Passive consumption | Active participation |\n| Individual experience | Collective experience |\n\n## Your Action Item\nThink about the communities you''re part of. What makes them feel like a community?',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 0, 'members', true),

  ('d4eebc99-9c0b-4ef8-bb6d-6bb9bd380a45', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
   'Finding Your Niche',
   E'# Finding Your Niche\n\nThe riches are in the niches. Here''s how to find yours.\n\n## The Niche Sweet Spot\n\nYour ideal niche sits at the intersection of:\n- **Your expertise** - What you know well\n- **Your passion** - What energizes you\n- **Market demand** - What people will pay for\n\n## Validation Checklist\n\n- [ ] Are people already paying for solutions in this space?\n- [ ] Can you find at least 1,000 potential members?\n- [ ] Do you have unique insights or experience?\n- [ ] Can you commit to this for 5+ years?\n\n## Exercise\nWrite down 3 potential niches and score them 1-10 on each criteria.',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1, 'members', true),

  ('d5eebc99-9c0b-4ef8-bb6d-6bb9bd380a45', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
   'Your First 100 Members',
   E'# Getting Your First 100 Members\n\nThe hardest part is starting. Here''s your roadmap.\n\n## The 5x20 Strategy\n\nReach out to 20 people in each category:\n1. Close friends who fit your niche\n2. Professional connections\n3. Social media followers\n4. Email subscribers\n5. People you admire in the space\n\n## Your Founding Member Pitch\n\n"I''m building [community name] for [specific audience]. We''re going to [specific outcome]. I''d love for you to be a founding member - your feedback will shape everything we build."\n\n## Key Insight\nYour first 100 members aren''t customers - they''re co-creators. Treat them that way.',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 2, 'members', true),

  -- Content Strategy Lessons (Paid)
  ('d6eebc99-9c0b-4ef8-bb6d-6bb9bd380a46', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
   'The Content Flywheel',
   E'# The Content Flywheel\n\nCreate a self-reinforcing content engine for your community.\n\n## How the Flywheel Works\n\n1. **Create** - Share valuable content\n2. **Engage** - Respond to every comment\n3. **Curate** - Highlight member contributions\n4. **Iterate** - Double down on what works\n\n## Content Types That Work\n\n- **Educational** - Teach something specific\n- **Inspirational** - Share success stories\n- **Conversational** - Ask thought-provoking questions\n- **Behind-the-scenes** - Show your process\n\n## Your Weekly Content Mix\n- 3 educational posts\n- 1 member spotlight\n- 1 behind-the-scenes\n- 1 open discussion',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 0, 'paid', true),

  ('d7eebc99-9c0b-4ef8-bb6d-6bb9bd380a46', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
   'Content Calendar System',
   E'# Building Your Content Calendar\n\nConsistency beats intensity. Here''s how to stay consistent.\n\n## The 12-Week Content System\n\n### Week 1-4: Foundation\n- Define your core content pillars\n- Create templates for each content type\n- Build a 2-week content buffer\n\n### Week 5-8: Optimization\n- Analyze what''s working\n- Double down on top performers\n- Start repurposing content\n\n### Week 9-12: Scaling\n- Involve members in content creation\n- Launch member-led content series\n- Build content partnerships',
   null, 1, 'paid', true),

  -- Monetization Lessons (Paid)
  ('d8eebc99-9c0b-4ef8-bb6d-6bb9bd380a47', 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
   'Pricing Your Community',
   E'# Pricing Your Community\n\nThe #1 mistake: underpricing. Let''s fix that.\n\n## Pricing Principles\n\n1. **Price on value, not time** - What transformation do members get?\n2. **Start higher than you think** - You can always lower prices\n3. **Create tiers** - Give options for different commitment levels\n\n## The 3-Tier Model\n\n| Tier | Price | Value |\n|------|-------|-------|\n| Free | $0 | Limited content, no community access |\n| Pro | $49/mo | Full content + community |\n| VIP | $199/mo | Everything + 1:1 access |\n\n## Pricing Exercise\nList 10 outcomes your community provides. Assign a dollar value to each.',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 0, 'paid', true),

  ('d9eebc99-9c0b-4ef8-bb6d-6bb9bd380a47', 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
   'Revenue Diversification',
   E'# Beyond Memberships: Diversifying Revenue\n\nDon''t put all your eggs in one basket.\n\n## Revenue Streams for Communities\n\n### 1. Memberships (Recurring)\n- Monthly/annual subscriptions\n- Typically 60-70% of revenue\n\n### 2. Courses (One-time)\n- Deep-dive programs\n- Higher price point ($500-$2000)\n\n### 3. Events (Periodic)\n- Live workshops\n- In-person meetups\n- Virtual summits\n\n### 4. Partnerships (Variable)\n- Affiliate deals\n- Sponsorships\n- White-label services\n\n## The Revenue Mix Goal\nAim for no single revenue stream to exceed 50% of total revenue.',
   null, 1, 'paid', true)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  video_url = EXCLUDED.video_url;

-- ============================================
-- RESOURCES (with folders)
-- ============================================
DELETE FROM resources WHERE community_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
INSERT INTO resources (community_id, title, description, type, url, folder, visibility, order_index)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Community Launch Checklist', 'Step-by-step checklist for launching your community', 'file', 'https://example.com/launch-checklist.pdf', 'Getting Started', 'members', 0),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Welcome Sequence Templates', '5 email templates for onboarding new members', 'file', 'https://example.com/welcome-templates.pdf', 'Getting Started', 'members', 1),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Content Calendar Template', 'Notion template for planning your content', 'link', 'https://notion.so/content-calendar', 'Templates', 'members', 0),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Member Survey Template', 'Typeform survey to understand your members', 'link', 'https://typeform.com/survey-template', 'Templates', 'members', 1),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Pricing Calculator', 'Spreadsheet to model your community pricing', 'file', 'https://example.com/pricing-calc.xlsx', 'Pro Resources', 'paid', 0),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Partnership Agreement Template', 'Legal template for community partnerships', 'file', 'https://example.com/partnership-template.pdf', 'Pro Resources', 'paid', 1),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Recommended Tech Stack', 'Our favorite tools for community builders', 'link', 'https://example.com/tech-stack', 'root', 'public', 0);

-- ============================================
-- EVENTS
-- ============================================
DELETE FROM events WHERE community_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
INSERT INTO events (community_id, title, description, starts_at, ends_at, location, external_url, visibility)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'Weekly Community Call',
   'Join us every Thursday for our live community call! We discuss wins, challenges, and answer your questions in real-time. Bring your coffee and your questions!',
   NOW() + INTERVAL '2 days' + TIME '18:00:00',
   NOW() + INTERVAL '2 days' + TIME '19:00:00',
   'Zoom',
   'https://zoom.us/j/123456789',
   'members'),

  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'Pro Members Mastermind',
   'Exclusive mastermind for Pro members. Deep dive into advanced strategies with hot seat coaching and Q&A. Limited to 20 participants.',
   NOW() + INTERVAL '5 days' + TIME '17:00:00',
   NOW() + INTERVAL '5 days' + TIME '18:30:00',
   'Zoom',
   'https://zoom.us/j/987654321',
   'paid'),

  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'New Member Orientation',
   'Welcome session for new members. Get oriented, meet other newcomers, and learn how to get the most out of this community.',
   NOW() + INTERVAL '7 days' + TIME '16:00:00',
   NOW() + INTERVAL '7 days' + TIME '17:00:00',
   'Zoom',
   'https://zoom.us/j/111222333',
   'members'),

  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'Community Building Workshop',
   'Hands-on workshop: Building Your Member Onboarding System. Walk away with a complete onboarding flow for your community.',
   NOW() + INTERVAL '14 days' + TIME '15:00:00',
   NOW() + INTERVAL '14 days' + TIME '17:00:00',
   'Zoom',
   'https://zoom.us/j/444555666',
   'paid'),

  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'Monthly AMA with Alex',
   'Ask Me Anything session with founder Alex Rivera. Bring your burning questions about community building, content, and monetization.',
   NOW() + INTERVAL '21 days' + TIME '18:00:00',
   NOW() + INTERVAL '21 days' + TIME '19:30:00',
   'Zoom',
   'https://zoom.us/j/555666777',
   'members');

-- ============================================
-- POSTS (with rich content, images, categories)
-- ============================================
DELETE FROM posts WHERE community_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

-- Pinned welcome post
INSERT INTO posts (id, community_id, author_profile_id, content, media_urls, visibility, pinned, likes_count, comments_count, category_id, created_at)
VALUES
  ('post-0001-0001-0001-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
   E'Welcome to Creator Academy! 🎉\n\nI''m so excited to have you here. This community is built for creators who want to build real, profitable online communities.\n\nHere''s what you''ll find:\n\n📚 Programs - Start with "Getting Started" then dive into the fundamentals\n💬 Community - Ask questions, share wins, get feedback\n📅 Events - Weekly calls, workshops, and masterminds\n📁 Resources - Templates, guides, and tools\n\nDrop a comment and introduce yourself! Where are you on your community building journey?',
   ARRAY['https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80'],
   'members', true, 47, 23, 'cat-0001-0001-0001-000000000001', NOW() - INTERVAL '30 days');

-- Member intro post
INSERT INTO posts (id, community_id, author_profile_id, content, media_urls, visibility, pinned, likes_count, comments_count, category_id, created_at)
VALUES
  ('post-0001-0001-0001-000000000002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a23',
   E'Hey everyone! 👋\n\nI''m Sarah, and I''m building a community for UX designers. Currently at 2,000 members and looking to scale to 10k this year.\n\nMy biggest challenge right now: keeping engagement high as we grow. Feels like the community gets quieter as it gets bigger.\n\nAnyone else dealt with this? Would love to connect with others building design communities!',
   ARRAY['https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80'],
   'members', false, 32, 14, 'cat-0001-0001-0001-000000000002', NOW() - INTERVAL '7 days');

-- Win post
INSERT INTO posts (id, community_id, author_profile_id, content, media_urls, visibility, pinned, likes_count, comments_count, category_id, created_at)
VALUES
  ('post-0001-0001-0001-000000000003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a24',
   E'BIG WIN! 🏆\n\nJust crossed $10k MRR with my fitness community!\n\nWhat worked:\n✅ Started with 1:1 coaching to understand pain points\n✅ Created a signature program based on common questions\n✅ Added a $49/month community tier\n✅ Weekly live workouts to drive retention\n\nTook 18 months but we''re here. Thanks @AlexRivera for the pricing advice in the mastermind last month - that was the unlock.',
   ARRAY['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80'],
   'members', false, 89, 31, 'cat-0001-0001-0001-000000000004', NOW() - INTERVAL '3 days');

-- Question post
INSERT INTO posts (id, community_id, author_profile_id, content, media_urls, visibility, pinned, likes_count, comments_count, category_id, created_at)
VALUES
  ('post-0001-0001-0001-000000000004', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a25',
   E'Quick question for the group:\n\nI''m trying to decide between Circle and Skool for my new community. What are the pros/cons of each?\n\nMy needs:\n- Course hosting\n- Community feed\n- Mobile app is nice to have\n- Budget: ~$100/month\n\nWould love to hear from anyone who''s used both!',
   NULL,
   'members', false, 18, 12, 'cat-0001-0001-0001-000000000003', NOW() - INTERVAL '1 day');

-- Resource share post
INSERT INTO posts (id, community_id, author_profile_id, content, media_urls, visibility, pinned, likes_count, comments_count, category_id, created_at)
VALUES
  ('post-0001-0001-0001-000000000005', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b4eebc99-9c0b-4ef8-bb6d-6bb9bd380a26',
   E'Just put together a comprehensive guide on community onboarding sequences.\n\n📖 What''s inside:\n- The 7-day welcome sequence that converts\n- Email templates you can steal\n- Automation workflows for Circle, Slack, and Discord\n- Real examples from 6-figure communities\n\nDropped it in the Resources section under "Getting Started". Let me know if you have questions!',
   ARRAY['https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80'],
   'members', false, 56, 19, 'cat-0001-0001-0001-000000000005', NOW() - INTERVAL '12 hours');

-- Engagement post from admin
INSERT INTO posts (id, community_id, author_profile_id, content, media_urls, visibility, pinned, likes_count, comments_count, category_id, created_at)
VALUES
  ('post-0001-0001-0001-000000000006', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
   E'Thursday thought:\n\nThe biggest difference I see between communities that thrive and communities that die?\n\n👉 Rituals.\n\nSuccessful communities have predictable rituals:\n- Weekly calls at the same time\n- Monthly challenges\n- Daily prompts\n- Celebration posts for wins\n\nWhat rituals does your community have? Share below 👇',
   NULL,
   'members', false, 41, 27, 'cat-0001-0001-0001-000000000001', NOW() - INTERVAL '6 hours');

-- ============================================
-- COMMENTS
-- ============================================
DELETE FROM comments WHERE post_id IN (SELECT id FROM posts WHERE community_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');

INSERT INTO comments (post_id, author_profile_id, content, created_at)
VALUES
  -- Comments on welcome post
  ('post-0001-0001-0001-000000000001', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a23',
   'So excited to be here! Can''t wait to dive into the programs.', NOW() - INTERVAL '29 days'),
  ('post-0001-0001-0001-000000000001', 'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a24',
   'The Getting Started program was exactly what I needed. Clear and actionable!', NOW() - INTERVAL '28 days'),
  ('post-0001-0001-0001-000000000001', 'b4eebc99-9c0b-4ef8-bb6d-6bb9bd380a26',
   'Already learned so much from the weekly calls. This community is gold.', NOW() - INTERVAL '25 days'),

  -- Comments on Sarah's intro
  ('post-0001-0001-0001-000000000002', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
   'Welcome Sarah! Scaling engagement is a super common challenge. Check out Lesson 3 in the Content Strategy program - that addresses this directly.', NOW() - INTERVAL '6 days'),
  ('post-0001-0001-0001-000000000002', 'b4eebc99-9c0b-4ef8-bb6d-6bb9bd380a26',
   'I''m at 5k members and we solved this with small group cohorts. DM me and I''ll share our system!', NOW() - INTERVAL '5 days'),

  -- Comments on Marcus's win
  ('post-0001-0001-0001-000000000003', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
   'LET''S GO! So proud of you Marcus. This is what happens when you focus on the fundamentals. 🎉', NOW() - INTERVAL '2 days'),
  ('post-0001-0001-0001-000000000003', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a23',
   'Incredible! The live workouts for retention is genius. Stealing that idea!', NOW() - INTERVAL '2 days'),
  ('post-0001-0001-0001-000000000003', 'b5eebc99-9c0b-4ef8-bb6d-6bb9bd380a27',
   'This is so inspiring. I''m just starting out and posts like this keep me going!', NOW() - INTERVAL '1 day'),

  -- Comments on Emily's question
  ('post-0001-0001-0001-000000000004', 'b4eebc99-9c0b-4ef8-bb6d-6bb9bd380a26',
   'I use Circle and love it. The course hosting + community combo is seamless. Mobile app just launched too.', NOW() - INTERVAL '20 hours'),
  ('post-0001-0001-0001-000000000004', 'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a24',
   'Skool is great for simplicity. Circle is more customizable. Depends on your needs!', NOW() - INTERVAL '18 hours');

-- ============================================
-- POST LIKES
-- ============================================
DELETE FROM post_likes WHERE post_id IN (SELECT id FROM posts WHERE community_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');

INSERT INTO post_likes (post_id, profile_id)
SELECT 'post-0001-0001-0001-000000000001', id FROM profiles WHERE community_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' AND clerk_user_id != 'demo_admin';
INSERT INTO post_likes (post_id, profile_id)
SELECT 'post-0001-0001-0001-000000000003', id FROM profiles WHERE community_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

-- ============================================
-- POLLS (Example poll post)
-- ============================================
INSERT INTO posts (id, community_id, author_profile_id, content, visibility, pinned, likes_count, comments_count, category_id, created_at)
VALUES
  ('post-0001-0001-0001-000000000007', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
   E'Quick poll! What topic should we cover in next week''s live call?',
   'members', false, 12, 5, 'cat-0001-0001-0001-000000000001', NOW() - INTERVAL '2 hours');

INSERT INTO polls (id, post_id, question, multiple_choice)
VALUES
  ('poll-0001-0001-0001-000000000001', 'post-0001-0001-0001-000000000007', 'What topic should we cover next?', false);

INSERT INTO poll_options (poll_id, option_text, votes_count, display_order)
VALUES
  ('poll-0001-0001-0001-000000000001', 'Community pricing strategies', 15, 0),
  ('poll-0001-0001-0001-000000000001', 'Member onboarding systems', 23, 1),
  ('poll-0001-0001-0001-000000000001', 'Content repurposing', 8, 2),
  ('poll-0001-0001-0001-000000000001', 'Building a launch waitlist', 11, 3);

-- Add some poll votes
INSERT INTO poll_votes (poll_id, option_id, profile_id)
SELECT 'poll-0001-0001-0001-000000000001',
       (SELECT id FROM poll_options WHERE poll_id = 'poll-0001-0001-0001-000000000001' ORDER BY votes_count DESC LIMIT 1),
       id
FROM profiles
WHERE community_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
AND clerk_user_id IN ('demo_user_1', 'demo_user_2', 'demo_user_3');
