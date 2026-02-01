-- ==============================================
-- KLASS - Complete Database Schema
-- All 19 migrations combined into one file
-- Generated: 2026-01-26 08:18
-- Paste this entire file into Supabase SQL Editor
-- ==============================================


-- ==============================================================================
-- MIGRATION: 00001_initial_schema.sql
-- ==============================================================================

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


-- ==============================================================================
-- MIGRATION: 00002_post_likes.sql
-- ==============================================================================

-- Create post_likes table for tracking user likes on posts
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, profile_id)
);

-- Create index for faster lookups
CREATE INDEX idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX idx_post_likes_profile_id ON post_likes(profile_id);

-- RLS policies for post_likes
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "post_likes_select" ON post_likes
  FOR SELECT USING (true);

CREATE POLICY "post_likes_insert" ON post_likes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "post_likes_delete" ON post_likes
  FOR DELETE USING (true);

-- Function to toggle like and update count
CREATE OR REPLACE FUNCTION toggle_post_like(p_post_id UUID, p_profile_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  liked BOOLEAN;
BEGIN
  -- Check if already liked
  IF EXISTS (SELECT 1 FROM post_likes WHERE post_id = p_post_id AND profile_id = p_profile_id) THEN
    -- Unlike: remove the like
    DELETE FROM post_likes WHERE post_id = p_post_id AND profile_id = p_profile_id;
    UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = p_post_id;
    liked := FALSE;
  ELSE
    -- Like: add the like
    INSERT INTO post_likes (post_id, profile_id) VALUES (p_post_id, p_profile_id);
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = p_post_id;
    liked := TRUE;
  END IF;

  RETURN liked;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==============================================================================
-- MIGRATION: 00003_categories_and_polls.sql
-- ==============================================================================

-- ============================================
-- POST CATEGORIES
-- ============================================

CREATE TABLE post_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) NOT NULL,
  color VARCHAR(7) DEFAULT '#6366f1',
  icon VARCHAR(50) DEFAULT 'hash',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(community_id, slug)
);

CREATE INDEX idx_post_categories_community ON post_categories(community_id);

-- Add category_id to posts
ALTER TABLE posts ADD COLUMN category_id UUID REFERENCES post_categories(id) ON DELETE SET NULL;
CREATE INDEX idx_posts_category ON posts(category_id);

-- ============================================
-- POLLS
-- ============================================

CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  ends_at TIMESTAMPTZ,
  multiple_choice BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_polls_post ON polls(post_id);

CREATE TABLE poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_text VARCHAR(200) NOT NULL,
  display_order INTEGER DEFAULT 0,
  votes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_poll_options_poll ON poll_options(poll_id);

CREATE TABLE poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(poll_id, profile_id, option_id)
);

CREATE INDEX idx_poll_votes_poll ON poll_votes(poll_id);
CREATE INDEX idx_poll_votes_profile ON poll_votes(profile_id);

-- Function to vote on a poll
CREATE OR REPLACE FUNCTION vote_on_poll(
  p_poll_id UUID,
  p_option_id UUID,
  p_profile_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  is_multiple_choice BOOLEAN;
  already_voted BOOLEAN;
BEGIN
  -- Check if poll allows multiple choice
  SELECT multiple_choice INTO is_multiple_choice FROM polls WHERE id = p_poll_id;

  -- Check if user already voted for this specific option
  SELECT EXISTS(
    SELECT 1 FROM poll_votes
    WHERE poll_id = p_poll_id AND option_id = p_option_id AND profile_id = p_profile_id
  ) INTO already_voted;

  IF already_voted THEN
    -- Remove vote
    DELETE FROM poll_votes WHERE poll_id = p_poll_id AND option_id = p_option_id AND profile_id = p_profile_id;
    UPDATE poll_options SET votes_count = GREATEST(votes_count - 1, 0) WHERE id = p_option_id;
    RETURN FALSE;
  ELSE
    -- If not multiple choice, remove any existing votes first
    IF NOT is_multiple_choice THEN
      -- Decrement counts for existing votes
      UPDATE poll_options SET votes_count = GREATEST(votes_count - 1, 0)
      WHERE id IN (SELECT option_id FROM poll_votes WHERE poll_id = p_poll_id AND profile_id = p_profile_id);
      -- Delete existing votes
      DELETE FROM poll_votes WHERE poll_id = p_poll_id AND profile_id = p_profile_id;
    END IF;

    -- Add new vote
    INSERT INTO poll_votes (poll_id, option_id, profile_id) VALUES (p_poll_id, p_option_id, p_profile_id);
    UPDATE poll_options SET votes_count = votes_count + 1 WHERE id = p_option_id;
    RETURN TRUE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies
ALTER TABLE post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

-- Categories: viewable by community members
CREATE POLICY "Categories viewable by community members" ON post_categories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.community_id = post_categories.community_id
      AND p.clerk_user_id = auth.uid()::text
    )
  );

-- Polls: viewable by community members
CREATE POLICY "Polls viewable by community members" ON polls
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts p
      JOIN profiles pr ON pr.community_id = p.community_id
      WHERE p.id = polls.post_id
      AND pr.clerk_user_id = auth.uid()::text
    )
  );

-- Poll options: viewable by community members
CREATE POLICY "Poll options viewable by community members" ON poll_options
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM polls pl
      JOIN posts p ON p.id = pl.post_id
      JOIN profiles pr ON pr.community_id = p.community_id
      WHERE pl.id = poll_options.poll_id
      AND pr.clerk_user_id = auth.uid()::text
    )
  );

-- Poll votes: users can manage their own votes
CREATE POLICY "Users can vote" ON poll_votes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = poll_votes.profile_id
      AND p.clerk_user_id = auth.uid()::text
    )
  );


-- ==============================================================================
-- MIGRATION: 00004_quizzes_and_comments.sql
-- ==============================================================================

-- Quizzes for lessons
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  passing_score INTEGER NOT NULL DEFAULT 70, -- Percentage required to pass
  max_attempts INTEGER, -- NULL = unlimited
  randomize_questions BOOLEAN NOT NULL DEFAULT false,
  show_correct_answers BOOLEAN NOT NULL DEFAULT true, -- Show correct answers after submission
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Quiz questions
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'multiple_choice', -- 'multiple_choice', 'true_false', 'multi_select'
  order_index INTEGER NOT NULL DEFAULT 0,
  points INTEGER NOT NULL DEFAULT 1,
  explanation TEXT, -- Shown after answering
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Quiz answer options
CREATE TABLE quiz_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0
);

-- Quiz attempts (user submissions)
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL, -- Percentage score
  passed BOOLEAN NOT NULL,
  answers JSONB NOT NULL, -- Stores user's answers as JSON
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Lesson comments
CREATE TABLE lesson_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES lesson_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Lesson comment likes
CREATE TABLE lesson_comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES lesson_comments(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(comment_id, profile_id)
);

-- Indexes
CREATE INDEX idx_quizzes_lesson ON quizzes(lesson_id);
CREATE INDEX idx_quiz_questions_quiz ON quiz_questions(quiz_id, order_index);
CREATE INDEX idx_quiz_options_question ON quiz_options(question_id, order_index);
CREATE INDEX idx_quiz_attempts_user ON quiz_attempts(profile_id, quiz_id);
CREATE INDEX idx_quiz_attempts_quiz ON quiz_attempts(quiz_id, completed_at DESC);
CREATE INDEX idx_lesson_comments_lesson ON lesson_comments(lesson_id, created_at DESC);
CREATE INDEX idx_lesson_comments_parent ON lesson_comments(parent_comment_id);
CREATE INDEX idx_lesson_comment_likes_comment ON lesson_comment_likes(comment_id);

-- RLS Policies

-- Quizzes: Visible if lesson is accessible
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quizzes_select" ON quizzes FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM lessons l
    JOIN programs p ON l.program_id = p.id
    JOIN profiles pr ON pr.community_id = p.community_id
    WHERE l.id = quizzes.lesson_id
      AND l.published = true
      AND p.published = true
      AND pr.clerk_user_id = auth.uid()::text
      AND (
        l.visibility = 'public'
        OR l.visibility = 'members'
        OR (l.visibility = 'paid' AND (pr.tier = 'PAID' OR pr.role = 'ADMIN'))
      )
  )
  OR EXISTS (
    SELECT 1 FROM lessons l
    JOIN programs p ON l.program_id = p.id
    JOIN profiles pr ON pr.community_id = p.community_id
    WHERE l.id = quizzes.lesson_id
      AND pr.clerk_user_id = auth.uid()::text
      AND pr.role = 'ADMIN'
  )
);

CREATE POLICY "quizzes_admin" ON quizzes FOR ALL USING (
  EXISTS (
    SELECT 1 FROM lessons l
    JOIN programs p ON l.program_id = p.id
    JOIN profiles pr ON pr.community_id = p.community_id
    WHERE l.id = quizzes.lesson_id
      AND pr.clerk_user_id = auth.uid()::text
      AND pr.role = 'ADMIN'
  )
);

-- Quiz Questions: Same as quizzes
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_questions_select" ON quiz_questions FOR SELECT USING (
  EXISTS (SELECT 1 FROM quizzes q WHERE q.id = quiz_questions.quiz_id)
);

CREATE POLICY "quiz_questions_admin" ON quiz_questions FOR ALL USING (
  EXISTS (
    SELECT 1 FROM quizzes q
    JOIN lessons l ON q.lesson_id = l.id
    JOIN programs p ON l.program_id = p.id
    JOIN profiles pr ON pr.community_id = p.community_id
    WHERE q.id = quiz_questions.quiz_id
      AND pr.clerk_user_id = auth.uid()::text
      AND pr.role = 'ADMIN'
  )
);

-- Quiz Options: Same as questions
ALTER TABLE quiz_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_options_select" ON quiz_options FOR SELECT USING (
  EXISTS (SELECT 1 FROM quiz_questions qq WHERE qq.id = quiz_options.question_id)
);

CREATE POLICY "quiz_options_admin" ON quiz_options FOR ALL USING (
  EXISTS (
    SELECT 1 FROM quiz_questions qq
    JOIN quizzes q ON qq.quiz_id = q.id
    JOIN lessons l ON q.lesson_id = l.id
    JOIN programs p ON l.program_id = p.id
    JOIN profiles pr ON pr.community_id = p.community_id
    WHERE qq.id = quiz_options.question_id
      AND pr.clerk_user_id = auth.uid()::text
      AND pr.role = 'ADMIN'
  )
);

-- Quiz Attempts: Users can see their own, admins can see all in their community
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_attempts_own" ON quiz_attempts FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles pr
    WHERE pr.id = quiz_attempts.profile_id
      AND pr.clerk_user_id = auth.uid()::text
  )
);

CREATE POLICY "quiz_attempts_admin_select" ON quiz_attempts FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM quizzes q
    JOIN lessons l ON q.lesson_id = l.id
    JOIN programs p ON l.program_id = p.id
    JOIN profiles pr ON pr.community_id = p.community_id
    WHERE q.id = quiz_attempts.quiz_id
      AND pr.clerk_user_id = auth.uid()::text
      AND pr.role = 'ADMIN'
  )
);

-- Lesson Comments: Visible if lesson is accessible
ALTER TABLE lesson_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lesson_comments_select" ON lesson_comments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM lessons l
    JOIN programs p ON l.program_id = p.id
    JOIN profiles pr ON pr.community_id = p.community_id
    WHERE l.id = lesson_comments.lesson_id
      AND l.published = true
      AND p.published = true
      AND pr.clerk_user_id = auth.uid()::text
  )
);

CREATE POLICY "lesson_comments_insert" ON lesson_comments FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles pr
    WHERE pr.id = lesson_comments.profile_id
      AND pr.clerk_user_id = auth.uid()::text
  )
);

CREATE POLICY "lesson_comments_update_own" ON lesson_comments FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles pr
    WHERE pr.id = lesson_comments.profile_id
      AND pr.clerk_user_id = auth.uid()::text
  )
);

CREATE POLICY "lesson_comments_delete" ON lesson_comments FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM profiles pr
    WHERE pr.id = lesson_comments.profile_id
      AND pr.clerk_user_id = auth.uid()::text
  )
  OR EXISTS (
    SELECT 1 FROM lessons l
    JOIN programs p ON l.program_id = p.id
    JOIN profiles pr ON pr.community_id = p.community_id
    WHERE l.id = lesson_comments.lesson_id
      AND pr.clerk_user_id = auth.uid()::text
      AND pr.role = 'ADMIN'
  )
);

-- Lesson Comment Likes
ALTER TABLE lesson_comment_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lesson_comment_likes_select" ON lesson_comment_likes FOR SELECT USING (
  EXISTS (SELECT 1 FROM lesson_comments lc WHERE lc.id = lesson_comment_likes.comment_id)
);

CREATE POLICY "lesson_comment_likes_own" ON lesson_comment_likes FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles pr
    WHERE pr.id = lesson_comment_likes.profile_id
      AND pr.clerk_user_id = auth.uid()::text
  )
);

-- Triggers to update updated_at
CREATE TRIGGER update_quizzes_updated_at
  BEFORE UPDATE ON quizzes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lesson_comments_updated_at
  BEFORE UPDATE ON lesson_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ==============================================================================
-- MIGRATION: 00005_comment_likes_functions.sql
-- ==============================================================================

-- Functions to increment/decrement comment likes count

CREATE OR REPLACE FUNCTION increment_comment_likes(comment_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE lesson_comments
  SET likes_count = likes_count + 1
  WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_comment_likes(comment_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE lesson_comments
  SET likes_count = GREATEST(0, likes_count - 1)
  WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==============================================================================
-- MIGRATION: 00006_storage_buckets.sql
-- ==============================================================================

-- Create storage buckets for file uploads

-- Avatars bucket (profile pictures)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Community assets bucket (logos, thumbnails, banners)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'community-assets',
  'community-assets',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Lesson content bucket (quiz images, lesson attachments)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lesson-content',
  'lesson-content',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies

-- Avatars: Anyone can view, authenticated users can upload their own
CREATE POLICY "avatars_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "avatars_authenticated_upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "avatars_owner_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);

-- Community assets: Anyone can view, admins can upload/delete
CREATE POLICY "community_assets_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'community-assets');

CREATE POLICY "community_assets_authenticated_upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'community-assets'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "community_assets_authenticated_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'community-assets'
  AND auth.role() = 'authenticated'
);

-- Lesson content: Anyone can view, admins can upload/delete
CREATE POLICY "lesson_content_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'lesson-content');

CREATE POLICY "lesson_content_authenticated_upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'lesson-content'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "lesson_content_authenticated_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'lesson-content'
  AND auth.role() = 'authenticated'
);


-- ==============================================================================
-- MIGRATION: 00007_quiz_images.sql
-- ==============================================================================

-- Add image support to quiz questions and options

-- Add image_url to questions
ALTER TABLE quiz_questions
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add image_url to options (for visual answer choices)
ALTER TABLE quiz_options
ADD COLUMN IF NOT EXISTS image_url TEXT;


-- ==============================================================================
-- MIGRATION: 00008_feature_flags.sql
-- ==============================================================================

-- Feature Flag System
-- Enables gradual rollouts, premium tiers, and safe testing
-- System defaults are conservative (OFF), per-community overrides enable features

-- System-wide feature flag defaults
CREATE TABLE feature_flags (
  key TEXT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Per-community overrides (null = use system default)
CREATE TABLE community_feature_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL REFERENCES feature_flags(key) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(community_id, feature_key)
);

CREATE INDEX idx_community_feature_overrides_community
  ON community_feature_overrides(community_id);

-- Initial feature flags (system defaults conservative - OFF for new features)
INSERT INTO feature_flags (key, enabled, description) VALUES
  ('ai_enabled', false, 'AI-assisted content generation'),
  ('dm_enabled', false, 'Creator-to-member direct messaging'),
  ('chat_enabled', false, 'External chat link-out (Discord/Telegram)'),
  ('playbooks_enabled', false, 'Guided playbook workflows'),
  ('affiliate_enabled', false, 'Affiliate/referral tracking system'),
  ('quizzes_enabled', true, 'Quiz assessments on lessons'),
  ('events_enabled', true, 'Community events module'),
  ('resources_enabled', true, 'Resource vault module');

-- RLS Policies

-- feature_flags: Anyone authenticated can read system defaults
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read feature flags"
  ON feature_flags FOR SELECT
  TO authenticated
  USING (true);

-- Only master admin can modify (enforced via server actions, not RLS)
-- We don't create INSERT/UPDATE/DELETE policies - all changes go through server actions

-- community_feature_overrides: Community admins can read their own overrides
ALTER TABLE community_feature_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Community admins can read their overrides"
  ON community_feature_overrides FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.community_id = community_feature_overrides.community_id
        AND profiles.clerk_user_id = auth.jwt()->>'sub'
        AND profiles.role = 'ADMIN'
    )
  );

-- INSERT/UPDATE/DELETE only via master admin server actions (no direct RLS policies)

-- Helper function to check if a feature is enabled for a community
CREATE OR REPLACE FUNCTION is_feature_enabled(p_community_id UUID, p_feature_key TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_override BOOLEAN;
  v_default BOOLEAN;
BEGIN
  -- Check for community override first
  SELECT enabled INTO v_override
  FROM community_feature_overrides
  WHERE community_id = p_community_id AND feature_key = p_feature_key;

  IF FOUND THEN
    RETURN v_override;
  END IF;

  -- Fall back to system default
  SELECT enabled INTO v_default
  FROM feature_flags
  WHERE key = p_feature_key;

  -- Return false if flag doesn't exist
  RETURN COALESCE(v_default, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==============================================================================
-- MIGRATION: 00009_master_admin.sql
-- ==============================================================================

-- Master Admin Support
-- Adds community status management and billing placeholder fields

-- Add status to communities for pause/reactivate
ALTER TABLE communities
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'paused', 'suspended'));

-- Add billing_status placeholder (expand later)
ALTER TABLE communities
  ADD COLUMN IF NOT EXISTS billing_status TEXT DEFAULT 'active'
  CHECK (billing_status IN ('active', 'past_due', 'canceled', 'trialing'));

-- Add created_by to track which master admin provisioned
ALTER TABLE communities
  ADD COLUMN IF NOT EXISTS created_by_clerk_id TEXT;

-- Index for quick lookups by status
CREATE INDEX IF NOT EXISTS idx_communities_status ON communities(status);
CREATE INDEX IF NOT EXISTS idx_communities_billing_status ON communities(billing_status);


-- ==============================================================================
-- MIGRATION: 00011_affiliates.sql
-- ==============================================================================

-- Affiliate/Referral System
-- Enables members to share referral links and earn commissions

-- Add referral columns to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS referred_by_profile_id UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS referral_code TEXT;

-- Ensure referral codes are unique per community (not globally)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_referral_code_community
  ON profiles(community_id, referral_code)
  WHERE referral_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_referred_by
  ON profiles(referred_by_profile_id)
  WHERE referred_by_profile_id IS NOT NULL;

-- Affiliate settings per community
CREATE TABLE affiliate_settings (
  community_id UUID PRIMARY KEY REFERENCES communities(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  commission_rate DECIMAL(5,2) NOT NULL DEFAULT 20.00,
  paid_only BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referral events (signup, conversion, etc.)
CREATE TABLE referral_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  referrer_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('signup', 'paid_conversion')),
  amount_cents INTEGER,
  commission_cents INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_referral_events_referrer ON referral_events(referrer_profile_id);
CREATE INDEX idx_referral_events_community ON referral_events(community_id);
CREATE INDEX idx_referral_events_referred ON referral_events(referred_profile_id);

-- RLS Policies

-- affiliate_settings: Community members can read (to check if enabled)
ALTER TABLE affiliate_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Community members can read affiliate settings"
  ON affiliate_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.community_id = affiliate_settings.community_id
        AND profiles.clerk_user_id = auth.jwt()->>'sub'
    )
  );

-- INSERT/UPDATE via admin only (enforced in server actions)

-- referral_events: Users can read their own referral events
ALTER TABLE referral_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own referral events"
  ON referral_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = referral_events.referrer_profile_id
        AND profiles.clerk_user_id = auth.jwt()->>'sub'
    )
  );

CREATE POLICY "Community admins can read all referral events"
  ON referral_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.community_id = referral_events.community_id
        AND profiles.clerk_user_id = auth.jwt()->>'sub'
        AND profiles.role = 'ADMIN'
    )
  );

-- INSERT only via server actions (no direct policy)


-- ==============================================================================
-- MIGRATION: 00012_flexible_pricing.sql
-- ==============================================================================

-- Flexible Pricing System
-- Allows admins to set prices on community access, programs, and resources
-- with grandfathering for existing members

-- Content types for access grants
CREATE TYPE content_type AS ENUM ('community', 'program', 'resource');
CREATE TYPE grant_source AS ENUM ('purchase', 'manual', 'subscription');

-- Add pricing columns to communities
ALTER TABLE communities
  ADD COLUMN IF NOT EXISTS membership_price_cents INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stripe_product_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- Add pricing columns to programs
ALTER TABLE programs
  ADD COLUMN IF NOT EXISTS price_cents INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stripe_product_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- Add pricing columns to resources
ALTER TABLE resources
  ADD COLUMN IF NOT EXISTS price_cents INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stripe_product_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- Content access grants (tracks purchases + manual grants, enables grandfathering)
CREATE TABLE content_access_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_type content_type NOT NULL,
  content_id UUID NOT NULL,
  source grant_source NOT NULL DEFAULT 'manual',
  stripe_payment_id TEXT,
  granted_by_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, content_type, content_id)
);

CREATE INDEX idx_grants_profile ON content_access_grants(profile_id);
CREATE INDEX idx_grants_content ON content_access_grants(content_type, content_id);
CREATE INDEX idx_grants_active ON content_access_grants(profile_id) WHERE revoked_at IS NULL;

-- RLS for access grants
ALTER TABLE content_access_grants ENABLE ROW LEVEL SECURITY;

-- Users can view their own grants
CREATE POLICY "Users can view own grants" ON content_access_grants
  FOR SELECT USING (
    profile_id IN (SELECT id FROM profiles WHERE clerk_user_id = requesting_user_id())
  );

-- Admins can view all grants in their community
CREATE POLICY "Admins can view community grants" ON content_access_grants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = content_access_grants.profile_id
      AND is_community_admin(p.community_id)
    )
  );

-- INSERT/UPDATE/DELETE via admin only (enforced in server actions)


-- ==============================================================================
-- MIGRATION: 00013_membership_tiers.sql
-- ==============================================================================

-- Expanded Tier-Based Pricing System
-- Supports multiple named tiers with monthly/annual billing, cumulative access

-- Named membership tiers per community
CREATE TABLE membership_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                          -- "Free", "Starter", "Pro", "Enterprise"
  slug TEXT NOT NULL,                          -- "free", "starter", "pro", "enterprise"
  description TEXT,

  -- Pricing (0 = free tier)
  price_cents_monthly INTEGER NOT NULL DEFAULT 0,
  price_cents_yearly INTEGER NOT NULL DEFAULT 0,

  -- Stripe integration
  stripe_product_id TEXT,
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,

  -- Hierarchy for cumulative access (lower = more basic)
  tier_level INTEGER NOT NULL DEFAULT 0,       -- 0=Free, 1=Starter, 2=Pro, 3=Enterprise

  -- Features (optional JSON for tier-specific perks)
  features JSONB DEFAULT '{}',

  -- Status
  is_default BOOLEAN DEFAULT false,            -- Default tier for new members
  active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(community_id, slug)
);

CREATE INDEX idx_membership_tiers_community ON membership_tiers(community_id);
CREATE INDEX idx_membership_tiers_level ON membership_tiers(community_id, tier_level);

-- Update profiles to reference tier
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS membership_tier_id UUID REFERENCES membership_tiers(id),
  ADD COLUMN IF NOT EXISTS tier_changed_at TIMESTAMPTZ;

-- Update subscriptions to track tier
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS membership_tier_id UUID REFERENCES membership_tiers(id),
  ADD COLUMN IF NOT EXISTS billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly'));

-- Add events pricing
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS price_cents INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stripe_product_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
  ADD COLUMN IF NOT EXISTS min_tier_id UUID REFERENCES membership_tiers(id),
  ADD COLUMN IF NOT EXISTS max_attendees INTEGER;

-- Update content_type enum to include events (if not already)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'event' AND enumtypid = 'content_type'::regtype) THEN
    ALTER TYPE content_type ADD VALUE 'event';
  END IF;
END$$;

-- Content tier requirements (for tier-gated content)
CREATE TABLE content_tier_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type content_type NOT NULL,          -- program | resource | event
  content_id UUID NOT NULL,
  min_tier_id UUID NOT NULL REFERENCES membership_tiers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(content_type, content_id)             -- One tier requirement per content
);

CREATE INDEX idx_content_tier_requirements ON content_tier_requirements(content_type, content_id);

-- RLS for membership_tiers
ALTER TABLE membership_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active tiers" ON membership_tiers
  FOR SELECT USING (active = true);

CREATE POLICY "Admins can manage tiers" ON membership_tiers
  FOR ALL USING (is_community_admin(community_id));

-- RLS for content_tier_requirements
ALTER TABLE content_tier_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tier requirements" ON content_tier_requirements
  FOR SELECT USING (true);

-- Admin policy for content tier requirements
CREATE POLICY "Admins can manage tier requirements" ON content_tier_requirements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM programs p WHERE p.id = content_id AND is_community_admin(p.community_id)
    )
    OR EXISTS (
      SELECT 1 FROM resources r WHERE r.id = content_id AND is_community_admin(r.community_id)
    )
    OR EXISTS (
      SELECT 1 FROM events e WHERE e.id = content_id AND is_community_admin(e.community_id)
    )
  );


-- ==============================================================================
-- MIGRATION: 00014_migrate_existing_tiers.sql
-- ==============================================================================

-- Auto-migration script for existing communities and members
-- Creates default Free/Pro tiers and migrates existing tier column data

-- Create default tiers for existing communities
INSERT INTO membership_tiers (community_id, name, slug, tier_level, is_default, price_cents_monthly, price_cents_yearly, description)
SELECT
  id,
  'Free',
  'free',
  0,
  true,
  0,
  0,
  'Free community access with basic features'
FROM communities
ON CONFLICT (community_id, slug) DO NOTHING;

INSERT INTO membership_tiers (community_id, name, slug, tier_level, price_cents_monthly, price_cents_yearly, description)
SELECT
  id,
  'Pro',
  'pro',
  1,
  COALESCE(membership_price_cents, 0),  -- Use existing community price for monthly
  COALESCE(membership_price_cents * 10, 0),  -- ~17% discount for yearly (10 months)
  'Full access to all premium content and features'
FROM communities
ON CONFLICT (community_id, slug) DO NOTHING;

-- Migrate existing profiles to appropriate tier based on old tier column
UPDATE profiles p
SET membership_tier_id = (
  SELECT mt.id FROM membership_tiers mt
  WHERE mt.community_id = p.community_id
  AND mt.slug = CASE WHEN p.tier = 'PAID' THEN 'pro' ELSE 'free' END
)
WHERE membership_tier_id IS NULL;

-- Migrate existing active subscriptions to Pro tier
UPDATE subscriptions s
SET
  membership_tier_id = (
    SELECT mt.id FROM membership_tiers mt
    JOIN profiles p ON p.id = s.profile_id
    WHERE mt.community_id = p.community_id AND mt.slug = 'pro'
  ),
  billing_cycle = 'monthly'
WHERE membership_tier_id IS NULL AND status = 'active';

-- Note: We keep the old 'tier' column on profiles for now
-- It can be dropped in a future migration after confirming everything works
-- ALTER TABLE profiles DROP COLUMN tier;


-- ==============================================================================
-- MIGRATION: 00015_playbook_progress.sql
-- ==============================================================================

-- Playbook progress tracking
-- Stores completion state for hardcoded playbook templates

-- Playbook progress per admin per community
CREATE TABLE IF NOT EXISTS playbook_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  playbook_id TEXT NOT NULL,                    -- matches hardcoded template ID
  completed_step_ids JSONB NOT NULL DEFAULT '[]', -- array of step IDs
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(community_id, profile_id, playbook_id)
);

CREATE INDEX IF NOT EXISTS idx_playbook_progress_community ON playbook_progress(community_id);
CREATE INDEX IF NOT EXISTS idx_playbook_progress_profile ON playbook_progress(profile_id);

-- RLS for playbook_progress
ALTER TABLE playbook_progress ENABLE ROW LEVEL SECURITY;

-- Users can view their own progress
CREATE POLICY "Users can view own playbook progress" ON playbook_progress
  FOR SELECT USING (
    profile_id IN (SELECT id FROM profiles WHERE clerk_user_id = requesting_user_id())
  );

-- Admins can insert/update their own progress
CREATE POLICY "Admins can manage own playbook progress" ON playbook_progress
  FOR ALL USING (
    profile_id IN (
      SELECT id FROM profiles
      WHERE clerk_user_id = requesting_user_id()
      AND role = 'ADMIN'
    )
  );


-- ==============================================================================
-- MIGRATION: 00016_member_tags.sql
-- ==============================================================================

-- Member Tags System
-- Allows creators to manually tag members for organization and filtering

-- Tag definitions (per community)
CREATE TABLE IF NOT EXISTS member_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                      -- 'vip', 'needs-onboarding', etc.
  color TEXT DEFAULT '#6366f1',            -- hex color for UI
  description TEXT,                        -- optional description of the tag
  is_system BOOLEAN NOT NULL DEFAULT false, -- system tags are read-only
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(community_id, name)
);

-- Tag assignments to profiles
CREATE TABLE IF NOT EXISTS profile_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES member_tags(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES profiles(id), -- who assigned (null for system)
  UNIQUE(profile_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_member_tags_community ON member_tags(community_id);
CREATE INDEX IF NOT EXISTS idx_profile_tags_profile ON profile_tags(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_tags_tag ON profile_tags(tag_id);

-- RLS for member_tags
ALTER TABLE member_tags ENABLE ROW LEVEL SECURITY;

-- Anyone in the community can view tags
CREATE POLICY "Community members can view tags" ON member_tags
  FOR SELECT USING (
    community_id IN (
      SELECT community_id FROM profiles WHERE clerk_user_id = requesting_user_id()
    )
  );

-- Only admins can create/update/delete non-system tags
CREATE POLICY "Admins can manage non-system tags" ON member_tags
  FOR ALL USING (
    is_system = false AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE clerk_user_id = requesting_user_id()
      AND community_id = member_tags.community_id
      AND role = 'ADMIN'
    )
  );

-- RLS for profile_tags
ALTER TABLE profile_tags ENABLE ROW LEVEL SECURITY;

-- Admins can view all profile tags in their community
CREATE POLICY "Admins can view profile tags" ON profile_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles admin
      JOIN profiles tagged ON tagged.id = profile_tags.profile_id
      WHERE admin.clerk_user_id = requesting_user_id()
      AND admin.community_id = tagged.community_id
      AND admin.role = 'ADMIN'
    )
  );

-- Admins can manage profile tags
CREATE POLICY "Admins can manage profile tags" ON profile_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles admin
      JOIN profiles tagged ON tagged.id = profile_tags.profile_id
      WHERE admin.clerk_user_id = requesting_user_id()
      AND admin.community_id = tagged.community_id
      AND admin.role = 'ADMIN'
    )
  );


-- ==============================================================================
-- MIGRATION: 00017_platform_billing_and_connect.sql
-- ==============================================================================

-- Platform Billing & Stripe Connect
-- Supports KLASS platform subscriptions for community creators
-- and Stripe Connect for community creators to accept member payments

-- ============================================
-- PLATFORM SUBSCRIPTION PLANS
-- ============================================
-- These are the plans community creators pay to KLASS
-- DIY ($79/mo), Done-With-You ($99/mo), Done-For-You ($149/mo)

CREATE TYPE platform_plan AS ENUM ('diy', 'done_with_you', 'done_for_you');

CREATE TABLE platform_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  clerk_user_id TEXT NOT NULL,                        -- The community owner

  -- Plan info
  plan platform_plan NOT NULL DEFAULT 'diy',

  -- Stripe billing
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,

  -- Status
  status subscription_status NOT NULL DEFAULT 'incomplete',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  trial_end TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_platform_subs_community ON platform_subscriptions(community_id);
CREATE INDEX idx_platform_subs_clerk_user ON platform_subscriptions(clerk_user_id);
CREATE INDEX idx_platform_subs_stripe_sub ON platform_subscriptions(stripe_subscription_id);
CREATE INDEX idx_platform_subs_stripe_customer ON platform_subscriptions(stripe_customer_id);

-- RLS
ALTER TABLE platform_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can view own platform subscription" ON platform_subscriptions
  FOR SELECT USING (clerk_user_id = requesting_user_id());

-- INSERT/UPDATE via server actions only (admin/webhook)

-- Add platform plan reference to communities
ALTER TABLE communities
  ADD COLUMN IF NOT EXISTS platform_plan platform_plan DEFAULT 'diy',
  ADD COLUMN IF NOT EXISTS platform_subscription_id UUID REFERENCES platform_subscriptions(id);

-- ============================================
-- STRIPE CONNECT (Creator Payouts)
-- ============================================
-- Tracks each community's connected Stripe account

CREATE TABLE stripe_connect_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE UNIQUE,
  stripe_account_id TEXT NOT NULL UNIQUE,             -- acct_xxx
  clerk_user_id TEXT NOT NULL,                        -- Owner who connected

  -- Onboarding status
  charges_enabled BOOLEAN DEFAULT false,
  payouts_enabled BOOLEAN DEFAULT false,
  details_submitted BOOLEAN DEFAULT false,
  onboarding_complete BOOLEAN DEFAULT false,

  -- Platform fee
  platform_fee_percent DECIMAL(5,2) NOT NULL DEFAULT 5.00,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_connect_accounts_community ON stripe_connect_accounts(community_id);
CREATE INDEX idx_connect_accounts_stripe ON stripe_connect_accounts(stripe_account_id);

-- RLS
ALTER TABLE stripe_connect_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Community admins can view their connect account" ON stripe_connect_accounts
  FOR SELECT USING (
    is_community_admin(community_id)
    OR clerk_user_id = requesting_user_id()
  );

-- ============================================
-- WHOP INTEGRATION
-- ============================================
-- Maps Whop products/purchases to KLASS communities

CREATE TABLE whop_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE UNIQUE,
  whop_company_id TEXT,                               -- Whop company/seller ID
  whop_product_id TEXT,                               -- Whop product ID
  whop_access_pass_id TEXT,                           -- Whop access pass ID
  api_key_encrypted TEXT,                             -- Encrypted Whop API key
  webhook_secret TEXT,                                -- Whop webhook secret
  enabled BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_whop_integrations_community ON whop_integrations(community_id);
CREATE INDEX idx_whop_integrations_product ON whop_integrations(whop_product_id);

-- Whop member mappings
CREATE TABLE whop_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  whop_user_id TEXT NOT NULL,
  whop_membership_id TEXT,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(community_id, whop_user_id)
);

CREATE INDEX idx_whop_members_community ON whop_members(community_id);
CREATE INDEX idx_whop_members_profile ON whop_members(profile_id);
CREATE INDEX idx_whop_members_whop_user ON whop_members(whop_user_id);

-- RLS
ALTER TABLE whop_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE whop_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Community admins can view whop integration" ON whop_integrations
  FOR SELECT USING (is_community_admin(community_id));

CREATE POLICY "Community admins can view whop members" ON whop_members
  FOR SELECT USING (is_community_admin(community_id));

-- Triggers
CREATE TRIGGER platform_subscriptions_updated_at BEFORE UPDATE ON platform_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER stripe_connect_accounts_updated_at BEFORE UPDATE ON stripe_connect_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER whop_integrations_updated_at BEFORE UPDATE ON whop_integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER whop_members_updated_at BEFORE UPDATE ON whop_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ==============================================================================
-- MIGRATION: 00017_program_sections.sql
-- ==============================================================================

-- ============================================
-- PROGRAM SECTIONS (Course Modules)
-- ============================================
-- Adds a middle layer: Program → Section → Lesson
-- Sections act as "modules" or "chapters" within a course/program

CREATE TABLE program_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_program_sections_program ON program_sections(program_id);
CREATE INDEX idx_program_sections_order ON program_sections(program_id, order_index);

-- Add section_id to lessons (nullable for backwards compatibility)
ALTER TABLE lessons ADD COLUMN section_id UUID REFERENCES program_sections(id) ON DELETE SET NULL;
CREATE INDEX idx_lessons_section ON lessons(section_id);

-- Trigger for updated_at
CREATE TRIGGER program_sections_updated_at BEFORE UPDATE ON program_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE program_sections ENABLE ROW LEVEL SECURITY;

-- Anyone can view sections for programs they can see
CREATE POLICY "sections_select" ON program_sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM programs
      WHERE programs.id = program_sections.program_id
      AND (
        (programs.published = true AND can_view_content(programs.visibility, programs.community_id))
        OR is_community_admin(programs.community_id)
      )
    )
  );

-- Admins can manage sections
CREATE POLICY "sections_all_admin" ON program_sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM programs
      WHERE programs.id = program_sections.program_id
      AND is_community_admin(programs.community_id)
    )
  );


-- ==============================================================================
-- MIGRATION: 00018_connect_earnings_and_payouts.sql
-- ==============================================================================

-- Connect Earnings & Payouts Tracking
-- Tracks individual payments and payouts for Stripe Connect accounts
-- Used by the earnings overview dashboard

-- ============================================
-- CONNECT EARNINGS (per-payment tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS connect_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  stripe_account_id TEXT NOT NULL,
  stripe_payment_intent_id TEXT,
  
  -- Amounts
  gross_amount_cents INTEGER NOT NULL DEFAULT 0,
  platform_fee_cents INTEGER NOT NULL DEFAULT 0,
  net_amount_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'usd',
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_connect_earnings_community ON connect_earnings(community_id);
CREATE INDEX idx_connect_earnings_account ON connect_earnings(stripe_account_id);
CREATE INDEX idx_connect_earnings_status ON connect_earnings(status);
CREATE INDEX idx_connect_earnings_created ON connect_earnings(created_at);

-- ============================================
-- CONNECT PAYOUTS (payout tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS connect_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  stripe_account_id TEXT NOT NULL,
  stripe_payout_id TEXT UNIQUE,
  
  -- Amounts
  amount_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'usd',
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'canceled')),
  arrival_date TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_connect_payouts_community ON connect_payouts(community_id);
CREATE INDEX idx_connect_payouts_account ON connect_payouts(stripe_account_id);
CREATE INDEX idx_connect_payouts_status ON connect_payouts(status);

-- Add total_earnings_cents to stripe_connect_accounts for quick aggregation
ALTER TABLE stripe_connect_accounts
  ADD COLUMN IF NOT EXISTS total_earnings_cents INTEGER DEFAULT 0;

-- Add billing_status to communities if not present
ALTER TABLE communities
  ADD COLUMN IF NOT EXISTS billing_status TEXT DEFAULT 'none'
    CHECK (billing_status IN ('none', 'active', 'past_due', 'canceled', 'trialing'));

-- RLS
ALTER TABLE connect_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE connect_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Community admins can view earnings" ON connect_earnings
  FOR SELECT USING (is_community_admin(community_id));

CREATE POLICY "Community admins can view payouts" ON connect_payouts
  FOR SELECT USING (is_community_admin(community_id));


-- ==============================================================================
-- MIGRATION: 00019_schema_improvements.sql
-- ==============================================================================

-- ============================================
-- SCHEMA IMPROVEMENTS
-- ============================================
-- Adds missing indexes, RLS policies, and small fixes
-- identified during schema audit

-- ============================================
-- 1. MISSING INDEXES
-- ============================================

-- Post likes: faster lookup by post + profile for checking if liked
CREATE INDEX IF NOT EXISTS idx_post_likes_post_profile ON post_likes(post_id, profile_id);

-- Comments: faster count by post_id
CREATE INDEX IF NOT EXISTS idx_comments_post_created ON comments(post_id, created_at DESC);

-- Lesson comments: index for profile lookup
CREATE INDEX IF NOT EXISTS idx_lesson_comments_profile ON lesson_comments(profile_id);

-- Quiz attempts: faster lookup for user's best score
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_score ON quiz_attempts(quiz_id, score DESC);

-- Connect earnings: date range queries for dashboard
CREATE INDEX IF NOT EXISTS idx_connect_earnings_community_created 
  ON connect_earnings(community_id, created_at DESC);

-- Referral events: date range queries
CREATE INDEX IF NOT EXISTS idx_referral_events_created ON referral_events(created_at DESC);

-- Platform subscriptions: status lookups
CREATE INDEX IF NOT EXISTS idx_platform_subs_status ON platform_subscriptions(status);

-- Profile membership tier: for tier-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_membership_tier ON profiles(membership_tier_id)
  WHERE membership_tier_id IS NOT NULL;

-- ============================================
-- 2. MISSING FUNCTIONS
-- ============================================

-- Increment comment count (referenced in post actions but may not exist)
CREATE OR REPLACE FUNCTION increment_comment_count(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts
  SET comments_count = comments_count + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrement comment count
CREATE OR REPLACE FUNCTION decrement_comment_count(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts
  SET comments_count = GREATEST(0, comments_count - 1)
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. RLS POLICY IMPROVEMENTS
-- ============================================

-- Ensure connect_earnings and connect_payouts INSERT is server-only
-- (Already covered by no INSERT policy = denied by default)

-- Add admin INSERT policies for post_categories (admins can create categories)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'admin_manage_categories' AND tablename = 'post_categories'
  ) THEN
    CREATE POLICY "admin_manage_categories" ON post_categories
      FOR ALL USING (is_community_admin(community_id));
  END IF;
END$$;

-- Add admin INSERT policy for polls (admins can manage polls)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'admin_manage_polls' AND tablename = 'polls'
  ) THEN
    CREATE POLICY "admin_manage_polls" ON polls
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM posts p
          WHERE p.id = polls.post_id
          AND is_community_admin(p.community_id)
        )
      );
  END IF;
END$$;

