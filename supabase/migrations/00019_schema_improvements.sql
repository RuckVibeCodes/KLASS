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
