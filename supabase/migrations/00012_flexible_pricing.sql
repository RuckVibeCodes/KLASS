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
