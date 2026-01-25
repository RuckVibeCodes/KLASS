-- Master Admin Support
-- Adds community status management and billing placeholder fields

-- Add status to communities for pause/reactivate
ALTER TABLE communities
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'paused', 'suspended'));

-- Add billing_status placeholder (expand later)
ALTER TABLE communities
  ADD COLUMN IF NOT EXISTS billing_status TEXT DEFAULT 'active'
  CHECK (billing_status IN ('active', 'past_due', 'canceled', 'trialing'));

-- Add created_by to track which master admin provisioned
ALTER TABLE communities
  ADD COLUMN IF NOT EXISTS created_by_clerk_id TEXT;

-- Index for quick lookups by status
CREATE INDEX IF NOT EXISTS idx_communities_status ON communities(status);
CREATE INDEX IF NOT EXISTS idx_communities_billing_status ON communities(billing_status);
