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
