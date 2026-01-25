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
