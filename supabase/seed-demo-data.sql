-- Seed Demo Data for Klass
-- Run this after the initial schema migration

-- Get the demo community ID
DO $$
DECLARE
  demo_community_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  admin_profile_id UUID;
  program1_id UUID;
  program2_id UUID;
  lesson1_id UUID;
  lesson2_id UUID;
  lesson3_id UUID;
  lesson4_id UUID;
BEGIN

-- Create admin profile (you'll need to update the clerk_user_id with your actual Clerk user ID)
INSERT INTO profiles (id, clerk_user_id, community_id, role, tier, display_name, avatar_url, bio)
VALUES (
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'demo_admin_user',
  demo_community_id,
  'ADMIN',
  'PAID',
  'Alex Creator',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  'Community founder and course creator. Passionate about helping others grow.'
) ON CONFLICT (clerk_user_id, community_id) DO UPDATE SET
  role = 'ADMIN',
  tier = 'PAID',
  display_name = 'Alex Creator';

SELECT id INTO admin_profile_id FROM profiles WHERE clerk_user_id = 'demo_admin_user' AND community_id = demo_community_id;

-- ============================================
-- PROGRAMS & LESSONS
-- ============================================

-- Program 1: Getting Started
INSERT INTO programs (id, community_id, title, description, thumbnail_url, visibility, published, order_index)
VALUES (
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  demo_community_id,
  'Getting Started Guide',
  'Everything you need to know to get the most out of this community. Learn the basics and hit the ground running.',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
  'members',
  true,
  0
) ON CONFLICT (id) DO NOTHING;
program1_id := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33';

-- Program 1 Lessons
INSERT INTO lessons (id, program_id, title, content, video_url, order_index, visibility, published)
VALUES
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', program1_id, 'Welcome to the Community',
   E'# Welcome!\n\nWe''re thrilled to have you here. In this lesson, you''ll learn:\n\n- How to navigate the platform\n- Where to find resources\n- How to connect with other members\n\nLet''s get started!',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 0, 'members', true),
  ('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a45', program1_id, 'Setting Up Your Profile',
   E'# Your Profile\n\nA complete profile helps you connect with others.\n\n## What to include:\n- Professional photo\n- Short bio\n- Your goals\n\nComplete profiles get 3x more engagement!',
   null, 1, 'members', true),
  ('d2eebc99-9c0b-4ef8-bb6d-6bb9bd380a46', program1_id, 'Community Guidelines',
   E'# Community Guidelines\n\nWe want everyone to feel welcome.\n\n## Our Values:\n1. **Be respectful** - Treat others how you want to be treated\n2. **Share knowledge** - Help others learn and grow\n3. **Stay positive** - Constructive feedback only\n4. **No spam** - Quality over quantity',
   null, 2, 'members', true)
ON CONFLICT (id) DO NOTHING;

-- Program 2: Advanced Strategies (Paid)
INSERT INTO programs (id, community_id, title, description, thumbnail_url, visibility, published, order_index)
VALUES (
  'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a34',
  demo_community_id,
  'Advanced Growth Strategies',
  'Take your skills to the next level with proven strategies used by top performers. Exclusive content for Pro members.',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
  'paid',
  true,
  1
) ON CONFLICT (id) DO NOTHING;
program2_id := 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a34';

-- Program 2 Lessons
INSERT INTO lessons (id, program_id, title, content, video_url, order_index, visibility, published)
VALUES
  ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a47', program2_id, 'The Growth Mindset Framework',
   E'# Growth Mindset Framework\n\nThis proprietary framework has helped hundreds of members achieve their goals.\n\n## The 4 Pillars:\n1. Clarity\n2. Consistency\n3. Community\n4. Celebration',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 0, 'paid', true),
  ('d4eebc99-9c0b-4ef8-bb6d-6bb9bd380a48', program2_id, 'Leveraging Network Effects',
   E'# Network Effects\n\nLearn how to multiply your impact through strategic connections.',
   null, 1, 'paid', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- RESOURCES
-- ============================================

INSERT INTO resources (id, community_id, title, description, type, url, folder, visibility, order_index)
VALUES
  (gen_random_uuid(), demo_community_id, 'Quick Start Checklist', 'A simple checklist to get you started in the first week', 'file', 'https://example.com/checklist.pdf', 'Getting Started', 'members', 0),
  (gen_random_uuid(), demo_community_id, 'Goal Setting Template', 'Downloadable template to clarify your goals', 'file', 'https://example.com/goals.pdf', 'Getting Started', 'members', 1),
  (gen_random_uuid(), demo_community_id, 'Community Notion Template', 'Our recommended Notion setup for tracking progress', 'link', 'https://notion.so/template', 'Templates', 'members', 0),
  (gen_random_uuid(), demo_community_id, 'Advanced Strategy Playbook', 'The complete playbook for Pro members', 'file', 'https://example.com/playbook.pdf', 'Pro Resources', 'paid', 0),
  (gen_random_uuid(), demo_community_id, 'Weekly Planning Guide', 'How to plan your week for maximum productivity', 'file', 'https://example.com/weekly.pdf', 'Templates', 'members', 1),
  (gen_random_uuid(), demo_community_id, 'Recommended Tools List', 'Our favorite tools and apps', 'link', 'https://example.com/tools', 'root', 'public', 0)
ON CONFLICT DO NOTHING;

-- ============================================
-- EVENTS
-- ============================================

INSERT INTO events (id, community_id, title, description, starts_at, ends_at, location, external_url, visibility)
VALUES
  (gen_random_uuid(), demo_community_id,
   'Weekly Community Call',
   'Join us for our weekly community call where we discuss wins, challenges, and answer your questions live.',
   NOW() + INTERVAL '2 days' + TIME '18:00:00',
   NOW() + INTERVAL '2 days' + TIME '19:00:00',
   'Zoom',
   'https://zoom.us/j/123456789',
   'members'),
  (gen_random_uuid(), demo_community_id,
   'Pro Members Mastermind',
   'Exclusive mastermind session for Pro members. Deep dive into advanced strategies with Q&A.',
   NOW() + INTERVAL '5 days' + TIME '17:00:00',
   NOW() + INTERVAL '5 days' + TIME '18:30:00',
   'Zoom',
   'https://zoom.us/j/987654321',
   'paid'),
  (gen_random_uuid(), demo_community_id,
   'New Member Welcome Session',
   'Monthly session to welcome new members and help them get oriented.',
   NOW() + INTERVAL '7 days' + TIME '16:00:00',
   NOW() + INTERVAL '7 days' + TIME '17:00:00',
   'Zoom',
   'https://zoom.us/j/111222333',
   'members'),
  (gen_random_uuid(), demo_community_id,
   'Workshop: Building Your Brand',
   'Hands-on workshop on personal branding fundamentals.',
   NOW() + INTERVAL '14 days' + TIME '15:00:00',
   NOW() + INTERVAL '14 days' + TIME '17:00:00',
   'Zoom',
   'https://zoom.us/j/444555666',
   'paid')
ON CONFLICT DO NOTHING;

-- ============================================
-- POSTS
-- ============================================

INSERT INTO posts (id, community_id, author_profile_id, content, visibility, pinned, likes_count, comments_count, created_at)
VALUES
  (gen_random_uuid(), demo_community_id, admin_profile_id,
   E'Welcome to our community! We''re so excited to have you here.\n\nHere''s what you can expect:\n- Weekly live calls every Thursday\n- Exclusive resources and templates\n- A supportive community of like-minded people\n\nDrop a comment below and introduce yourself!',
   'members', true, 42, 18, NOW() - INTERVAL '7 days'),
  (gen_random_uuid(), demo_community_id, admin_profile_id,
   E'Just dropped a new lesson in the Advanced Strategies program: "Leveraging Network Effects"\n\nThis is one of the most requested topics, and I''m really proud of how it turned out.\n\nPro members, go check it out and let me know what you think!',
   'members', false, 28, 7, NOW() - INTERVAL '3 days'),
  (gen_random_uuid(), demo_community_id, admin_profile_id,
   E'Quick tip for the week:\n\nThe most successful members in this community share one thing in common: they show up consistently.\n\nIt doesn''t have to be perfect. It just has to be regular.\n\nWhat''s one small action you can commit to doing every day this week?',
   'members', false, 35, 12, NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), demo_community_id, admin_profile_id,
   E'Reminder: Our weekly community call is tomorrow at 6 PM!\n\nTopics we''ll cover:\n- Q&A session\n- Member spotlight\n- Sneak peek at upcoming content\n\nSee you there!',
   'members', false, 15, 4, NOW() - INTERVAL '6 hours')
ON CONFLICT DO NOTHING;

-- ============================================
-- COMMUNITY MODULES (Enable all)
-- ============================================

INSERT INTO community_modules (community_id, key, label, enabled, order_index)
VALUES
  (demo_community_id, 'feed', 'Community', true, 0),
  (demo_community_id, 'programs', 'Programs', true, 1),
  (demo_community_id, 'resources', 'Resources', true, 2),
  (demo_community_id, 'events', 'Events', true, 3),
  (demo_community_id, 'members', 'Members', true, 4)
ON CONFLICT (community_id, key) DO UPDATE SET enabled = true;

END $$;
