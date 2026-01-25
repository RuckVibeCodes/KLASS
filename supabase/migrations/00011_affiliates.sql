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
