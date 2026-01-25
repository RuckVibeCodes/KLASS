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
