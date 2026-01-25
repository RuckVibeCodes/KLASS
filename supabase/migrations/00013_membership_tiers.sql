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
