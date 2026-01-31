-- AI Usage Tracking for KLASS
-- Tracks AI feature usage per community with tier-based limits

-- ============================================
-- AI USAGE TRACKING TABLE
-- ============================================

CREATE TABLE ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  feature TEXT NOT NULL, -- 'lesson_outline', 'onboarding', 'chatbot', 'assistant', 'image_gen'
  tokens_input INTEGER DEFAULT 0,
  tokens_output INTEGER DEFAULT 0,
  cost_cents INTEGER DEFAULT 0, -- Track estimated cost in cents
  user_id TEXT, -- Clerk user ID who triggered the usage
  metadata JSONB DEFAULT '{}', -- Additional context (model used, etc)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_usage_community ON ai_usage(community_id);
CREATE INDEX idx_ai_usage_community_feature ON ai_usage(community_id, feature);
CREATE INDEX idx_ai_usage_community_created ON ai_usage(community_id, created_at DESC);
CREATE INDEX idx_ai_usage_created ON ai_usage(created_at DESC);

-- ============================================
-- AI TIER LIMITS TABLE
-- ============================================

CREATE TABLE ai_tier_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_key TEXT NOT NULL UNIQUE, -- 'free', 'pro', 'enterprise'
  display_name TEXT NOT NULL,
  monthly_tokens INTEGER NOT NULL DEFAULT 0, -- 0 = unlimited
  features JSONB NOT NULL DEFAULT '{}', -- Which features are enabled
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default tier limits
INSERT INTO ai_tier_limits (tier_key, display_name, monthly_tokens, features) VALUES
  ('free', 'Free', 10000, '{"lesson_outline": true, "onboarding": true, "chatbot": false, "assistant": false, "image_gen": false}'),
  ('pro', 'Pro', 100000, '{"lesson_outline": true, "onboarding": true, "chatbot": true, "assistant": true, "image_gen": true}'),
  ('enterprise', 'Enterprise', 0, '{"lesson_outline": true, "onboarding": true, "chatbot": true, "assistant": true, "image_gen": true}');

-- ============================================
-- COMMUNITY AI CONFIG
-- ============================================

-- Add AI tier to communities
ALTER TABLE communities 
ADD COLUMN IF NOT EXISTS ai_tier TEXT DEFAULT 'free' REFERENCES ai_tier_limits(tier_key);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get monthly token usage for a community
CREATE OR REPLACE FUNCTION get_monthly_ai_usage(community_uuid UUID)
RETURNS TABLE (
  total_tokens BIGINT,
  tokens_by_feature JSONB
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(tokens_input + tokens_output), 0)::BIGINT as total_tokens,
    COALESCE(
      jsonb_object_agg(
        feature,
        feature_tokens
      ),
      '{}'::jsonb
    ) as tokens_by_feature
  FROM (
    SELECT 
      feature,
      SUM(tokens_input + tokens_output) as feature_tokens
    FROM ai_usage
    WHERE community_id = community_uuid
      AND created_at >= date_trunc('month', NOW())
    GROUP BY feature
  ) subq;
END;
$$;

-- Check if community can use AI feature
CREATE OR REPLACE FUNCTION can_use_ai_feature(
  community_uuid UUID,
  feature_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  community_tier TEXT;
  tier_config RECORD;
  current_usage BIGINT;
BEGIN
  -- Get community's AI tier
  SELECT ai_tier INTO community_tier
  FROM communities
  WHERE id = community_uuid;

  IF community_tier IS NULL THEN
    community_tier := 'free';
  END IF;

  -- Get tier limits
  SELECT * INTO tier_config
  FROM ai_tier_limits
  WHERE tier_key = community_tier;

  -- Check if feature is enabled for this tier
  IF NOT (tier_config.features->>feature_name)::boolean THEN
    RETURN false;
  END IF;

  -- If unlimited (0), always allow
  IF tier_config.monthly_tokens = 0 THEN
    RETURN true;
  END IF;

  -- Check current usage
  SELECT COALESCE(SUM(tokens_input + tokens_output), 0) INTO current_usage
  FROM ai_usage
  WHERE community_id = community_uuid
    AND created_at >= date_trunc('month', NOW());

  RETURN current_usage < tier_config.monthly_tokens;
END;
$$;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tier_limits ENABLE ROW LEVEL SECURITY;

-- Admins can view their community's AI usage
CREATE POLICY "Community admins can view AI usage"
  ON ai_usage FOR SELECT
  USING (is_community_admin(community_id));

-- Service role can insert usage records
CREATE POLICY "Service role can insert AI usage"
  ON ai_usage FOR INSERT
  WITH CHECK (true);

-- Anyone can view tier limits (public info)
CREATE POLICY "Anyone can view tier limits"
  ON ai_tier_limits FOR SELECT
  USING (true);
