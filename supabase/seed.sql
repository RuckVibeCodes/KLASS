-- Seed Data for Klass Demo
-- Run this after the initial schema migration

-- Insert demo community
INSERT INTO communities (id, name, slug, description, primary_color, accent_color, settings_json)
VALUES (
  'demo-community-0001-0001-000000000001',
  'Creator Academy',
  'demo',
  'Learn how to build and monetize your online community. Join thousands of creators on their journey.',
  '#000000',
  '#6366f1',
  '{}'
);

-- Insert community modules
INSERT INTO community_modules (community_id, key, label, enabled, order_index) VALUES
  ('demo-community-0001-0001-000000000001', 'feed', 'Community', true, 0),
  ('demo-community-0001-0001-000000000001', 'programs', 'Programs', true, 1),
  ('demo-community-0001-0001-000000000001', 'resources', 'Resources', true, 2),
  ('demo-community-0001-0001-000000000001', 'events', 'Events', true, 3),
  ('demo-community-0001-0001-000000000001', 'members', 'Members', true, 4);

-- Note: Profiles need to be created when users sign in with Clerk
-- The first user to visit /demo will be prompted to create a profile

-- Insert demo programs
INSERT INTO programs (id, community_id, title, description, visibility, published, order_index) VALUES
  (
    'prog-0001-0001-0001-000000000001',
    'demo-community-0001-0001-000000000001',
    'Community Building 101',
    'Learn the fundamentals of building an engaged online community from scratch.',
    'members',
    true,
    0
  ),
  (
    'prog-0001-0001-0001-000000000002',
    'demo-community-0001-0001-000000000001',
    'Content Strategy Masterclass',
    'Create content that converts visitors into loyal community members.',
    'paid',
    true,
    1
  ),
  (
    'prog-0001-0001-0001-000000000003',
    'demo-community-0001-0001-000000000001',
    'Monetization Playbook',
    'Turn your community into a sustainable business with proven monetization strategies.',
    'paid',
    true,
    2
  );

-- Insert demo lessons for Community Building 101
INSERT INTO lessons (program_id, title, content, video_url, order_index, visibility, published) VALUES
  (
    'prog-0001-0001-0001-000000000001',
    'Welcome to Community Building',
    '<p>In this lesson, we''ll cover the basics of what makes a community successful.</p><p>Key topics:</p><ul><li>What is a community?</li><li>Why build a community?</li><li>The community flywheel</li></ul>',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    0,
    'members',
    true
  ),
  (
    'prog-0001-0001-0001-000000000001',
    'Finding Your Niche',
    '<p>Discover how to identify and validate your community niche.</p>',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    1,
    'members',
    true
  ),
  (
    'prog-0001-0001-0001-000000000001',
    'Attracting Your First Members',
    '<p>Strategies for getting your first 100 community members.</p>',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    2,
    'members',
    true
  );

-- Insert demo lessons for Content Strategy Masterclass (paid)
INSERT INTO lessons (program_id, title, content, video_url, order_index, visibility, published) VALUES
  (
    'prog-0001-0001-0001-000000000002',
    'Content Foundations',
    '<p>Build a content strategy that attracts and retains members.</p>',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    0,
    'paid',
    true
  ),
  (
    'prog-0001-0001-0001-000000000002',
    'The Content Calendar',
    '<p>Create a sustainable content calendar for your community.</p>',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    1,
    'paid',
    true
  );

-- Insert demo resources
INSERT INTO resources (community_id, title, description, type, url, folder, visibility, order_index) VALUES
  (
    'demo-community-0001-0001-000000000001',
    'Community Launch Checklist',
    'A comprehensive checklist for launching your community.',
    'file',
    'https://example.com/checklist.pdf',
    'root',
    'members',
    0
  ),
  (
    'demo-community-0001-0001-000000000001',
    'Content Templates Pack',
    'Ready-to-use templates for posts, announcements, and more.',
    'file',
    'https://example.com/templates.zip',
    'Templates',
    'paid',
    1
  ),
  (
    'demo-community-0001-0001-000000000001',
    'Recommended Tools',
    'Our curated list of the best tools for community builders.',
    'link',
    'https://example.com/tools',
    'root',
    'members',
    2
  );

-- Insert demo events
INSERT INTO events (community_id, title, description, starts_at, external_url, visibility) VALUES
  (
    'demo-community-0001-0001-000000000001',
    'Weekly Community Call',
    'Join us every Thursday for our live community call. Ask questions, share wins, and connect with fellow creators.',
    NOW() + INTERVAL '3 days',
    'https://zoom.us/j/123456789',
    'members'
  ),
  (
    'demo-community-0001-0001-000000000001',
    'Monetization Workshop',
    'Deep dive into monetization strategies with our expert panel.',
    NOW() + INTERVAL '10 days',
    'https://zoom.us/j/123456789',
    'paid'
  ),
  (
    'demo-community-0001-0001-000000000001',
    'Community AMA',
    'Ask Me Anything session with successful community builders.',
    NOW() + INTERVAL '17 days',
    'https://zoom.us/j/123456789',
    'members'
  );

-- Note: Posts require a profile (author), so they should be created
-- after the first admin signs in. You can create seed posts manually
-- or implement auto-seeding on first admin login.
