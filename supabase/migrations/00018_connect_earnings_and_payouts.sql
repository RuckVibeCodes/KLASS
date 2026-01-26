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
