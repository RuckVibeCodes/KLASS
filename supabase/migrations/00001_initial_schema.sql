-- Klass Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CUSTOM TYPES
-- ============================================

CREATE TYPE user_role AS ENUM ('ADMIN', 'PAID_MEMBER', 'FREE_MEMBER');
CREATE TYPE user_tier AS ENUM ('FREE', 'PAID');
CREATE TYPE content_visibility AS ENUM ('public', 'members', 'paid');
CREATE TYPE resource_type AS ENUM ('file', 'link', 'embed');
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'canceled', 'incomplete', 'trialing');

-- ============================================
-- CUSTOM FUNCTIONS FOR CLERK INTEGRATION
-- ============================================

-- Get requesting user's Clerk ID from JWT
CREATE OR REPLACE FUNCTION requesting_user_id()
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
  SELECT NULLIF(
    current_setting('request.jwt.claims', true)::json->>'sub',
    ''
  )::text;
$$;

-- Check if user is admin of a community
CREATE OR REPLACE FUNCTION is_community_admin(community_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE clerk_user_id = requesting_user_id()
    AND community_id = community_uuid
    AND role = 'ADMIN'
  );
$$;

-- Get user's tier for a community
CREATE OR REPLACE FUNCTION user_tier(community_uuid UUID)
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
  SELECT tier::text FROM profiles
  WHERE clerk_user_id = requesting_user_id()
  AND community_id = community_uuid;
$$;

-- Check if user can view content based on visibility
CREATE OR REPLACE FUNCTION can_view_content(
  content_visibility content_visibility,
  community_uuid UUID
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT CASE
    WHEN content_visibility = 'public' THEN true
    WHEN content_visibility = 'members' THEN
      EXISTS (
        SELECT 1 FROM profiles
        WHERE clerk_user_id = requesting_user_id()
        AND community_id = community_uuid
      )
    WHEN content_visibility = 'paid' THEN
      EXISTS (
        SELECT 1 FROM profiles
        WHERE clerk_user_id = requesting_user_id()
        AND community_id = community_uuid
        AND (tier = 'PAID' OR role = 'ADMIN')
      )
    ELSE false
  END;
$$;

-- ============================================
-- COMMUNITIES
-- ============================================

CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT DEFAULT '#000000',
  accent_color TEXT DEFAULT '#6366f1',
  settings_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_communities_slug ON communities(slug);

-- ============================================
-- COMMUNITY MODULES
-- ============================================

CREATE TABLE community_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  label TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(community_id, key)
);

CREATE INDEX idx_community_modules_community ON community_modules(community_id);

-- ============================================
-- PROFILES
-- ============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT NOT NULL,
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  role user_role DEFAULT 'FREE_MEMBER',
  tier user_tier DEFAULT 'FREE',
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(clerk_user_id, community_id)
);

CREATE INDEX idx_profiles_clerk_user ON profiles(clerk_user_id);
CREATE INDEX idx_profiles_community ON profiles(community_id);
CREATE INDEX idx_profiles_community_role ON profiles(community_id, role);

-- ============================================
-- POSTS
-- ============================================

CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  author_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  visibility content_visibility DEFAULT 'members',
  pinned BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_posts_community ON posts(community_id);
CREATE INDEX idx_posts_community_created ON posts(community_id, created_at DESC);
CREATE INDEX idx_posts_author ON posts(author_profile_id);
CREATE INDEX idx_posts_pinned ON posts(community_id, pinned DESC, created_at DESC);

-- ============================================
-- COMMENTS
-- ============================================

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);
CREATE INDEX idx_comments_author ON comments(author_profile_id);

-- ============================================
-- PROGRAMS
-- ============================================

CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  visibility content_visibility DEFAULT 'paid',
  published BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_programs_community ON programs(community_id);
CREATE INDEX idx_programs_visibility ON programs(community_id, visibility, published);

-- ============================================
-- LESSONS
-- ============================================

CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  video_url TEXT,
  video_duration_seconds INTEGER,
  attachment_urls TEXT[] DEFAULT '{}',
  order_index INTEGER DEFAULT 0,
  visibility content_visibility DEFAULT 'paid',
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lessons_program ON lessons(program_id);
CREATE INDEX idx_lessons_order ON lessons(program_id, order_index);

-- ============================================
-- LESSON PROGRESS
-- ============================================

CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lesson_id, profile_id)
);

CREATE INDEX idx_lesson_progress_lesson ON lesson_progress(lesson_id);
CREATE INDEX idx_lesson_progress_profile ON lesson_progress(profile_id);

-- ============================================
-- RESOURCES
-- ============================================

CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type resource_type NOT NULL,
  url TEXT NOT NULL,
  file_size_bytes BIGINT,
  mime_type TEXT,
  folder TEXT DEFAULT 'root',
  visibility content_visibility DEFAULT 'members',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_resources_community ON resources(community_id);
CREATE INDEX idx_resources_folder ON resources(community_id, folder);
CREATE INDEX idx_resources_visibility ON resources(community_id, visibility);

-- ============================================
-- EVENTS
-- ============================================

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  location TEXT,
  external_url TEXT,
  visibility content_visibility DEFAULT 'members',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_community ON events(community_id);
CREATE INDEX idx_events_starts ON events(community_id, starts_at);

-- ============================================
-- SUBSCRIPTIONS
-- ============================================

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  status subscription_status DEFAULT 'incomplete',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_profile ON subscriptions(profile_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_sub ON subscriptions(stripe_subscription_id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER communities_updated_at BEFORE UPDATE ON communities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER programs_updated_at BEFORE UPDATE ON programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER lessons_updated_at BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER resources_updated_at BEFORE UPDATE ON resources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- COMMUNITIES POLICIES
CREATE POLICY "communities_select_all" ON communities
  FOR SELECT USING (true);

CREATE POLICY "communities_update_admin" ON communities
  FOR UPDATE USING (is_community_admin(id));

CREATE POLICY "communities_insert_authenticated" ON communities
  FOR INSERT WITH CHECK (requesting_user_id() IS NOT NULL);

-- COMMUNITY MODULES POLICIES
CREATE POLICY "modules_select_all" ON community_modules
  FOR SELECT USING (true);

CREATE POLICY "modules_all_admin" ON community_modules
  FOR ALL USING (is_community_admin(community_id));

-- PROFILES POLICIES
CREATE POLICY "profiles_select_community" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.clerk_user_id = requesting_user_id()
      AND p.community_id = profiles.community_id
    )
    OR clerk_user_id = requesting_user_id()
  );

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (clerk_user_id = requesting_user_id());

CREATE POLICY "profiles_update_admin" ON profiles
  FOR UPDATE USING (is_community_admin(community_id));

CREATE POLICY "profiles_insert_self" ON profiles
  FOR INSERT WITH CHECK (clerk_user_id = requesting_user_id());

-- POSTS POLICIES
CREATE POLICY "posts_select_visible" ON posts
  FOR SELECT USING (can_view_content(visibility, community_id));

CREATE POLICY "posts_update_own" ON posts
  FOR UPDATE USING (
    author_profile_id IN (
      SELECT id FROM profiles WHERE clerk_user_id = requesting_user_id()
    )
  );

CREATE POLICY "posts_update_admin" ON posts
  FOR UPDATE USING (is_community_admin(community_id));

CREATE POLICY "posts_insert_member" ON posts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE clerk_user_id = requesting_user_id()
      AND community_id = posts.community_id
    )
  );

CREATE POLICY "posts_delete" ON posts
  FOR DELETE USING (
    author_profile_id IN (
      SELECT id FROM profiles WHERE clerk_user_id = requesting_user_id()
    )
    OR is_community_admin(community_id)
  );

-- COMMENTS POLICIES
CREATE POLICY "comments_select" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = comments.post_id
      AND can_view_content(posts.visibility, posts.community_id)
    )
  );

CREATE POLICY "comments_insert" ON comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = comments.post_id
      AND can_view_content(posts.visibility, posts.community_id)
    )
  );

CREATE POLICY "comments_update_own" ON comments
  FOR UPDATE USING (
    author_profile_id IN (
      SELECT id FROM profiles WHERE clerk_user_id = requesting_user_id()
    )
  );

CREATE POLICY "comments_delete" ON comments
  FOR DELETE USING (
    author_profile_id IN (
      SELECT id FROM profiles WHERE clerk_user_id = requesting_user_id()
    )
    OR EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = comments.post_id
      AND is_community_admin(posts.community_id)
    )
  );

-- PROGRAMS POLICIES
CREATE POLICY "programs_select" ON programs
  FOR SELECT USING (
    (published = true AND can_view_content(visibility, community_id))
    OR is_community_admin(community_id)
  );

CREATE POLICY "programs_all_admin" ON programs
  FOR ALL USING (is_community_admin(community_id));

-- LESSONS POLICIES
CREATE POLICY "lessons_select" ON lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM programs
      WHERE programs.id = lessons.program_id
      AND (
        (programs.published = true AND lessons.published = true AND can_view_content(lessons.visibility, programs.community_id))
        OR is_community_admin(programs.community_id)
      )
    )
  );

CREATE POLICY "lessons_all_admin" ON lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM programs
      WHERE programs.id = lessons.program_id
      AND is_community_admin(programs.community_id)
    )
  );

-- LESSON PROGRESS POLICIES
CREATE POLICY "progress_own" ON lesson_progress
  FOR ALL USING (
    profile_id IN (
      SELECT id FROM profiles WHERE clerk_user_id = requesting_user_id()
    )
  );

CREATE POLICY "progress_admin_select" ON lesson_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lessons
      JOIN programs ON programs.id = lessons.program_id
      WHERE lessons.id = lesson_progress.lesson_id
      AND is_community_admin(programs.community_id)
    )
  );

-- RESOURCES POLICIES
CREATE POLICY "resources_select" ON resources
  FOR SELECT USING (
    can_view_content(visibility, community_id)
    OR is_community_admin(community_id)
  );

CREATE POLICY "resources_all_admin" ON resources
  FOR ALL USING (is_community_admin(community_id));

-- EVENTS POLICIES
CREATE POLICY "events_select" ON events
  FOR SELECT USING (
    can_view_content(visibility, community_id)
    OR is_community_admin(community_id)
  );

CREATE POLICY "events_all_admin" ON events
  FOR ALL USING (is_community_admin(community_id));

-- SUBSCRIPTIONS POLICIES
CREATE POLICY "subscriptions_select_own" ON subscriptions
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM profiles WHERE clerk_user_id = requesting_user_id()
    )
  );

CREATE POLICY "subscriptions_select_admin" ON subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = subscriptions.profile_id
      AND is_community_admin(profiles.community_id)
    )
  );
