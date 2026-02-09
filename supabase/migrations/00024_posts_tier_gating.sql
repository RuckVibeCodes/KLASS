-- Posts Tier Gating
-- Migration: 00024_posts_tier_gating.sql
-- Allows posts to be gated behind membership tiers

-- Add tier gating columns to posts
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS min_tier_id UUID REFERENCES membership_tiers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS preview_content TEXT;

-- Index for efficient tier-filtered queries
CREATE INDEX IF NOT EXISTS idx_posts_min_tier ON posts(min_tier_id) WHERE min_tier_id IS NOT NULL;

-- Comment
COMMENT ON COLUMN posts.min_tier_id IS 'Minimum membership tier required to view full post content';
COMMENT ON COLUMN posts.preview_content IS 'Preview text shown to users below the required tier';
