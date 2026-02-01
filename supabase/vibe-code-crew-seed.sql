-- ============================================
-- VIBE CODE CREW - Course Seed Data
-- Run this in Supabase SQL Editor
-- ============================================

-- First, get or create the Vibe Code Crew community
-- (Update this ID if you already have one)
DO $$
DECLARE
  vcc_community_id UUID;
BEGIN
  -- Check if Vibe Code Crew exists
  SELECT id INTO vcc_community_id 
  FROM communities 
  WHERE slug = 'vibe-code-crew' OR name ILIKE '%vibe code%'
  LIMIT 1;
  
  -- If not found, we'll use a generated ID (update after running)
  IF vcc_community_id IS NULL THEN
    RAISE NOTICE 'Community not found. Please create Vibe Code Crew first or update the community_id below.';
  ELSE
    RAISE NOTICE 'Found community: %', vcc_community_id;
  END IF;
END $$;

-- ============================================
-- PROGRAMS
-- ============================================
-- NOTE: Replace 'YOUR_COMMUNITY_ID' with your actual Vibe Code Crew community UUID

-- You can find your community ID by running:
-- SELECT id, name, slug FROM communities;

-- Program 1: Shipped in a Weekend (FREE)
INSERT INTO programs (id, community_id, title, description, thumbnail_url, visibility, published, order_index)
VALUES (
  'c1000000-0001-0001-0001-000000000001',
  'YOUR_COMMUNITY_ID',  -- Replace with actual community ID
  'Shipped in a Weekend',
  'Your first app, live on the internet. No coding experience needed. Go from zero to deployed in one weekend.',
  NULL,
  'members',  -- Free for all members
  true,
  0
);

-- Program 2: Full Stack in a Flash
INSERT INTO programs (id, community_id, title, description, thumbnail_url, visibility, published, order_index)
VALUES (
  'c1000000-0001-0001-0001-000000000002',
  'YOUR_COMMUNITY_ID',
  'Full Stack in a Flash',
  'Apps that remember things. Add databases, user accounts, and APIs to build real apps with real users.',
  NULL,
  'paid',
  true,
  1
);

-- Program 3: From Code to Cash
INSERT INTO programs (id, community_id, title, description, thumbnail_url, visibility, published, order_index)
VALUES (
  'c1000000-0001-0001-0001-000000000003',
  'YOUR_COMMUNITY_ID',
  'From Code to Cash',
  'Turn your app into income. Add payments, subscriptions, and launch strategies to get your first paying customers.',
  NULL,
  'paid',
  true,
  2
);

-- Program 4: Ship Like a Pro
INSERT INTO programs (id, community_id, title, description, thumbnail_url, visibility, published, order_index)
VALUES (
  'c1000000-0001-0001-0001-000000000004',
  'YOUR_COMMUNITY_ID',
  'Ship Like a Pro',
  'Polish, scale, repeat. Make your app faster, handle more users, and build a portfolio you''re proud of.',
  NULL,
  'paid',
  true,
  3
);

-- Program 5: OpenClaw Mastery
INSERT INTO programs (id, community_id, title, description, thumbnail_url, visibility, published, order_index)
VALUES (
  'c1000000-0001-0001-0001-000000000005',
  'YOUR_COMMUNITY_ID',
  'OpenClaw Mastery',
  'Your AI coding butler. Build an autonomous assistant that works while you sleep. The future of vibe coding.',
  NULL,
  'paid',
  true,
  4
);

-- ============================================
-- LESSONS - Shipped in a Weekend (FREE)
-- ============================================

-- Module 1: Setup
INSERT INTO lessons (program_id, title, content, video_url, order_index, visibility, published) VALUES
('c1000000-0001-0001-0001-000000000001', 'Welcome & What We''re Building', '<p>Quick intro and preview of what you''ll build this weekend.</p>', NULL, 0, 'members', true),
('c1000000-0001-0001-0001-000000000001', 'Installing Cursor', '<p>Download, install, and quick tour of the interface.</p>', NULL, 1, 'members', true),
('c1000000-0001-0001-0001-000000000001', 'Setting Up Claude', '<p>API key setup and testing that everything works.</p>', NULL, 2, 'members', true);

-- Module 2: Building
INSERT INTO lessons (program_id, title, content, video_url, order_index, visibility, published) VALUES
('c1000000-0001-0001-0001-000000000001', 'Describing What You Want', '<p>How to talk to AI - prompting basics.</p>', NULL, 3, 'members', true),
('c1000000-0001-0001-0001-000000000001', 'Your First Prompt', '<p>Write the prompt together and watch Claude build it.</p>', NULL, 4, 'members', true),
('c1000000-0001-0001-0001-000000000001', 'Making Changes', '<p>Iterating with AI - "make the button blue"</p>', NULL, 5, 'members', true),
('c1000000-0001-0001-0001-000000000001', 'Fixing When It Breaks', '<p>The debug loop - copy error, paste to Claude.</p>', NULL, 6, 'members', true);

-- Module 3: Shipping
INSERT INTO lessons (program_id, title, content, video_url, order_index, visibility, published) VALUES
('c1000000-0001-0001-0001-000000000001', 'What is Deployment?', '<p>Localhost vs the real internet. Why Vercel.</p>', NULL, 7, 'members', true),
('c1000000-0001-0001-0001-000000000001', 'Deploying to Vercel', '<p>Connect GitHub, push, and watch it go live.</p>', NULL, 8, 'members', true),
('c1000000-0001-0001-0001-000000000001', 'Sharing Your Creation', '<p>Custom domains and getting feedback.</p>', NULL, 9, 'members', true);

-- Module 4: What's Next
INSERT INTO lessons (program_id, title, content, video_url, order_index, visibility, published) VALUES
('c1000000-0001-0001-0001-000000000001', 'You Did It!', '<p>Celebrate the win. Ideas for next projects. Intro to paid courses.</p>', NULL, 10, 'members', true);

-- ============================================
-- LESSONS - Full Stack in a Flash
-- ============================================

-- Module 1: Why Full Stack?
INSERT INTO lessons (program_id, title, content, video_url, order_index, visibility, published) VALUES
('c1000000-0001-0001-0001-000000000002', 'What We''re Building', '<p>Preview the finished app. Databases explained simply.</p>', NULL, 0, 'paid', true),
('c1000000-0001-0001-0001-000000000002', 'The Stack', '<p>Frontend, backend, and how they talk.</p>', NULL, 1, 'paid', true);

-- Module 2: Database Basics
INSERT INTO lessons (program_id, title, content, video_url, order_index, visibility, published) VALUES
('c1000000-0001-0001-0001-000000000002', 'Setting Up Supabase', '<p>Create account and new project walkthrough.</p>', NULL, 2, 'paid', true),
('c1000000-0001-0001-0001-000000000002', 'Creating Tables', '<p>Tables, rows, columns - build your first table.</p>', NULL, 3, 'paid', true),
('c1000000-0001-0001-0001-000000000002', 'Connecting Your App', '<p>Install client and environment variables.</p>', NULL, 4, 'paid', true),
('c1000000-0001-0001-0001-000000000002', 'Save & Load Data', '<p>Create, Read, Update, Delete - the basics.</p>', NULL, 5, 'paid', true);

-- Module 3: User Accounts
INSERT INTO lessons (program_id, title, content, video_url, order_index, visibility, published) VALUES
('c1000000-0001-0001-0001-000000000002', 'Why Authentication?', '<p>Users need their own data. Supabase Auth overview.</p>', NULL, 6, 'paid', true),
('c1000000-0001-0001-0001-000000000002', 'Sign Up Flow', '<p>Email/password signup and confirmation.</p>', NULL, 7, 'paid', true),
('c1000000-0001-0001-0001-000000000002', 'Login & Logout', '<p>Login form, sessions, logout button.</p>', NULL, 8, 'paid', true),
('c1000000-0001-0001-0001-000000000002', 'Protected Pages', '<p>Checking login status and redirects.</p>', NULL, 9, 'paid', true);

-- Module 4: Connecting to the World
INSERT INTO lessons (program_id, title, content, video_url, order_index, visibility, published) VALUES
('c1000000-0001-0001-0001-000000000002', 'What Are APIs?', '<p>Using other people''s data and services.</p>', NULL, 10, 'paid', true),
('c1000000-0001-0001-0001-000000000002', 'Your First API Call', '<p>Fetch and display data from a fun API.</p>', NULL, 11, 'paid', true),
('c1000000-0001-0001-0001-000000000002', 'API Keys & Secrets', '<p>Why they''re secret and environment variables.</p>', NULL, 12, 'paid', true);

-- Module 5: Project Time
INSERT INTO lessons (program_id, title, content, video_url, order_index, visibility, published) VALUES
('c1000000-0001-0001-0001-000000000002', 'Project Kickoff', '<p>Choose your project and plan with AI.</p>', NULL, 13, 'paid', true),
('c1000000-0001-0001-0001-000000000002', 'Build Session', '<p>Guided build-along with common gotchas.</p>', NULL, 14, 'paid', true),
('c1000000-0001-0001-0001-000000000002', 'Deploy & Share', '<p>Push to Vercel and share in community.</p>', NULL, 15, 'paid', true);

-- ============================================
-- LESSONS - From Code to Cash
-- ============================================

-- Module 1: Money Mindset
INSERT INTO lessons (program_id, title, content, video_url, order_index, visibility, published) VALUES
('c1000000-0001-0001-0001-000000000003', 'What We''re Building', '<p>Working SaaS example. The goal: recurring revenue.</p>', NULL, 0, 'paid', true),
('c1000000-0001-0001-0001-000000000003', 'What to Charge For', '<p>Features vs tiers. Pricing psychology basics.</p>', NULL, 1, 'paid', true);

-- Module 2: Stripe Setup
INSERT INTO lessons (program_id, title, content, video_url, order_index, visibility, published) VALUES
('c1000000-0001-0001-0001-000000000003', 'Creating Your Stripe Account', '<p>Sign up, verification, test vs live mode.</p>', NULL, 2, 'paid', true),
('c1000000-0001-0001-0001-000000000003', 'Products & Prices', '<p>Creating products. One-time vs subscription.</p>', NULL, 3, 'paid', true),
('c1000000-0001-0001-0001-000000000003', 'Connecting to Your App', '<p>API keys and Stripe client setup.</p>', NULL, 4, 'paid', true);

-- Module 3: Payment Flows
INSERT INTO lessons (program_id, title, content, video_url, order_index, visibility, published) VALUES
('c1000000-0001-0001-0001-000000000003', 'Checkout Session', '<p>Send user to Stripe. Handle success/cancel.</p>', NULL, 5, 'paid', true),
('c1000000-0001-0001-0001-000000000003', 'Webhooks', '<p>Stripe calls YOU. Setting up the endpoint.</p>', NULL, 6, 'paid', true),
('c1000000-0001-0001-0001-000000000003', 'Subscription Management', '<p>Customer portal, cancellations, plan changes.</p>', NULL, 7, 'paid', true);

-- Module 4: Gating Features
INSERT INTO lessons (program_id, title, content, video_url, order_index, visibility, published) VALUES
('c1000000-0001-0001-0001-000000000003', 'Who Paid?', '<p>Checking subscription status in your database.</p>', NULL, 8, 'paid', true),
('c1000000-0001-0001-0001-000000000003', 'Showing/Hiding Features', '<p>Free vs paid UI. Upgrade prompts.</p>', NULL, 9, 'paid', true),
('c1000000-0001-0001-0001-000000000003', 'Usage Limits', '<p>Counting usage. Soft vs hard limits.</p>', NULL, 10, 'paid', true);

-- Module 5: Launch Prep
INSERT INTO lessons (program_id, title, content, video_url, order_index, visibility, published) VALUES
('c1000000-0001-0001-0001-000000000003', 'Landing Page Essentials', '<p>What makes people buy. Copy that converts.</p>', NULL, 11, 'paid', true),
('c1000000-0001-0001-0001-000000000003', 'Pre-Launch Checklist', '<p>Test payments, error handling, notifications.</p>', NULL, 12, 'paid', true),
('c1000000-0001-0001-0001-000000000003', 'Launch Day', '<p>Where to post. Launch tweet template.</p>', NULL, 13, 'paid', true);

-- ============================================
-- LESSONS - Ship Like a Pro
-- ============================================

-- Module 1: Polish
INSERT INTO lessons (program_id, title, content, video_url, order_index, visibility, published) VALUES
('c1000000-0001-0001-0001-000000000004', 'Performance Basics', '<p>Why speed matters. Lighthouse audit walkthrough.</p>', NULL, 0, 'paid', true),
('c1000000-0001-0001-0001-000000000004', 'Quick Wins', '<p>Image optimization, lazy loading, caching.</p>', NULL, 1, 'paid', true),
('c1000000-0001-0001-0001-000000000004', 'Mobile Responsive', '<p>Testing on mobile and common fixes.</p>', NULL, 2, 'paid', true);

-- Module 2: Stability
INSERT INTO lessons (program_id, title, content, video_url, order_index, visibility, published) VALUES
('c1000000-0001-0001-0001-000000000004', 'Error Tracking', '<p>What breaks in production. Setting up Sentry.</p>', NULL, 3, 'paid', true),
('c1000000-0001-0001-0001-000000000004', 'Monitoring', '<p>Uptime monitoring and alerts.</p>', NULL, 4, 'paid', true),
('c1000000-0001-0001-0001-000000000004', 'Backups', '<p>Database backups. Sleep better at night.</p>', NULL, 5, 'paid', true);

-- Module 3: Growth
INSERT INTO lessons (program_id, title, content, video_url, order_index, visibility, published) VALUES
('c1000000-0001-0001-0001-000000000004', 'Analytics', '<p>What to track. Setting up Plausible/Posthog.</p>', NULL, 6, 'paid', true),
('c1000000-0001-0001-0001-000000000004', 'User Feedback', '<p>Feedback widgets. Talking to users.</p>', NULL, 7, 'paid', true),
('c1000000-0001-0001-0001-000000000004', 'Iteration', '<p>Prioritizing features. Ship fast vs ship right.</p>', NULL, 8, 'paid', true);

-- Module 4: Your Portfolio
INSERT INTO lessons (program_id, title, content, video_url, order_index, visibility, published) VALUES
('c1000000-0001-0001-0001-000000000004', 'Documenting Your Work', '<p>Screenshots, demos, case studies.</p>', NULL, 9, 'paid', true),
('c1000000-0001-0001-0001-000000000004', 'Portfolio Site', '<p>Simple portfolio template and showcasing.</p>', NULL, 10, 'paid', true),
('c1000000-0001-0001-0001-000000000004', 'Sharing Your Journey', '<p>Building in public. Content from process.</p>', NULL, 11, 'paid', true);

-- Module 5: What's Next
INSERT INTO lessons (program_id, title, content, video_url, order_index, visibility, published) VALUES
('c1000000-0001-0001-0001-000000000004', 'Career Paths', '<p>Freelancing, indie hacking, getting hired.</p>', NULL, 12, 'paid', true),
('c1000000-0001-0001-0001-000000000004', 'Keep Building', '<p>Project ideas and staying motivated.</p>', NULL, 13, 'paid', true);

-- ============================================
-- LESSONS - OpenClaw Mastery
-- ============================================

-- Module 1: What is OpenClaw?
INSERT INTO lessons (program_id, title, content, video_url, order_index, visibility, published) VALUES
('c1000000-0001-0001-0001-000000000005', 'The Vision', '<p>AI that works while you sleep. What''s possible.</p>', NULL, 0, 'paid', true),
('c1000000-0001-0001-0001-000000000005', 'Architecture Overview', '<p>Gateway, sessions, channels - how it fits together.</p>', NULL, 1, 'paid', true);

-- Module 2: Installation & Setup
INSERT INTO lessons (program_id, title, content, video_url, order_index, visibility, published) VALUES
('c1000000-0001-0001-0001-000000000005', 'Prerequisites', '<p>Node.js, API keys, platform considerations.</p>', NULL, 2, 'paid', true),
('c1000000-0001-0001-0001-000000000005', 'Installing OpenClaw', '<p>npm install and initial configuration.</p>', NULL, 3, 'paid', true),
('c1000000-0001-0001-0001-000000000005', 'First Conversation', '<p>Starting the gateway. Talking to your agent.</p>', NULL, 4, 'paid', true);

-- Module 3: Channels & Communication
INSERT INTO lessons (program_id, title, content, video_url, order_index, visibility, published) VALUES
('c1000000-0001-0001-0001-000000000005', 'Telegram Setup', '<p>Creating a bot. Connecting to OpenClaw.</p>', NULL, 5, 'paid', true),
('c1000000-0001-0001-0001-000000000005', 'Discord Setup', '<p>Bot application and server configuration.</p>', NULL, 6, 'paid', true),
('c1000000-0001-0001-0001-000000000005', 'Other Channels', '<p>Slack, Signal, multi-channel setup.</p>', NULL, 7, 'paid', true);

-- Module 4: Memory & Personality
INSERT INTO lessons (program_id, title, content, video_url, order_index, visibility, published) VALUES
('c1000000-0001-0001-0001-000000000005', 'SOUL.md - Who Is Your Agent?', '<p>Crafting personality, voice, and tone.</p>', NULL, 8, 'paid', true),
('c1000000-0001-0001-0001-000000000005', 'MEMORY.md - What It Remembers', '<p>Long-term memory and daily logs.</p>', NULL, 9, 'paid', true),
('c1000000-0001-0001-0001-000000000005', 'AGENTS.md - How It Behaves', '<p>Rules, boundaries, workspace conventions.</p>', NULL, 10, 'paid', true);

-- Module 5: Skills & Tools
INSERT INTO lessons (program_id, title, content, video_url, order_index, visibility, published) VALUES
('c1000000-0001-0001-0001-000000000005', 'Built-in Skills', '<p>What comes out of the box. Configuration.</p>', NULL, 11, 'paid', true),
('c1000000-0001-0001-0001-000000000005', 'Installing Skills', '<p>ClawdHub overview. Adding capabilities.</p>', NULL, 12, 'paid', true),
('c1000000-0001-0001-0001-000000000005', 'Creating Custom Skills', '<p>Skill structure, SKILL.md format, scripts.</p>', NULL, 13, 'paid', true);

-- Module 6: Autonomous Workflows
INSERT INTO lessons (program_id, title, content, video_url, order_index, visibility, published) VALUES
('c1000000-0001-0001-0001-000000000005', 'Heartbeats', '<p>Scheduled check-ins. HEARTBEAT.md configuration.</p>', NULL, 14, 'paid', true),
('c1000000-0001-0001-0001-000000000005', 'Cron Jobs', '<p>Scheduled tasks, reminders, alerts.</p>', NULL, 15, 'paid', true),
('c1000000-0001-0001-0001-000000000005', 'Proactive Work', '<p>PROACTIVE.md, night shift, background agents.</p>', NULL, 16, 'paid', true);

-- Module 7: Advanced Patterns
INSERT INTO lessons (program_id, title, content, video_url, order_index, visibility, published) VALUES
('c1000000-0001-0001-0001-000000000005', 'Multi-Session', '<p>Spawning sub-agents. Session coordination.</p>', NULL, 17, 'paid', true),
('c1000000-0001-0001-0001-000000000005', 'Browser Automation', '<p>Browser tool and web scraping.</p>', NULL, 18, 'paid', true),
('c1000000-0001-0001-0001-000000000005', 'Node Pairing', '<p>Mobile devices and remote machines.</p>', NULL, 19, 'paid', true);

-- Module 8: Your Butler (Project)
INSERT INTO lessons (program_id, title, content, video_url, order_index, visibility, published) VALUES
('c1000000-0001-0001-0001-000000000005', 'Planning Your Setup', '<p>What do you want automated? Design your workflow.</p>', NULL, 20, 'paid', true),
('c1000000-0001-0001-0001-000000000005', 'Building It Out', '<p>Guided setup session. Custom skills for your needs.</p>', NULL, 21, 'paid', true),
('c1000000-0001-0001-0001-000000000005', 'Going Live', '<p>Production deployment. Monitoring your agent.</p>', NULL, 22, 'paid', true);

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this after to verify:
-- SELECT p.title, COUNT(l.id) as lessons 
-- FROM programs p 
-- LEFT JOIN lessons l ON l.program_id = p.id 
-- WHERE p.community_id = 'YOUR_COMMUNITY_ID'
-- GROUP BY p.id, p.title 
-- ORDER BY p.order_index;
