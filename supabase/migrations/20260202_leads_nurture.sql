-- Migration: Lead nurturing system tables
-- Date: 2026-02-02

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  creator_type TEXT,
  current_platform TEXT,
  community_size TEXT,
  
  -- Status tracking
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'nurturing', 'hot', 'converted', 'dead', 'unsubscribed')),
  lead_score INTEGER DEFAULT 0,
  
  -- Source tracking
  source TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  referrer TEXT,
  landing_page TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  converted_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email sequence tracking
CREATE TABLE IF NOT EXISTS lead_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  sequence_id TEXT NOT NULL,
  email_number INTEGER NOT NULL,
  email_key TEXT NOT NULL,
  
  -- Delivery tracking
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  
  -- Resend tracking
  resend_id TEXT,
  
  UNIQUE(lead_id, sequence_id, email_number)
);

-- Behavioral events
CREATE TABLE IF NOT EXISTS lead_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lead scoring rules (configurable)
CREATE TABLE IF NOT EXISTS lead_score_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  event_filter JSONB,
  points INTEGER NOT NULL,
  max_per_day INTEGER DEFAULT 1,
  description TEXT,
  active BOOLEAN DEFAULT true
);

-- Insert default scoring rules
INSERT INTO lead_score_rules (event_type, event_filter, points, max_per_day, description) VALUES
  ('page_view', '{"page": "/founders"}', 10, 3, 'Viewed founders page'),
  ('page_view', '{"page": "/demo"}', 5, 2, 'Viewed demo'),
  ('email_open', NULL, 2, 5, 'Opened email'),
  ('email_click', NULL, 5, 5, 'Clicked email link'),
  ('checkout_start', NULL, 25, 1, 'Started checkout'),
  ('demo_start', NULL, 15, 1, 'Started using demo'),
  ('pricing_view', NULL, 8, 2, 'Viewed pricing section')
ON CONFLICT DO NOTHING;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_lead_emails_lead_sent ON lead_emails(lead_id, sent_at);
CREATE INDEX IF NOT EXISTS idx_lead_events_lead_type ON lead_events(lead_id, event_type);
CREATE INDEX IF NOT EXISTS idx_lead_events_created ON lead_events(created_at);

-- RPC function to increment lead score safely
CREATE OR REPLACE FUNCTION increment_lead_score(
  lead_id_input UUID,
  points_input INTEGER
)
RETURNS void AS $$
BEGIN
  UPDATE leads
  SET 
    lead_score = lead_score + points_input,
    last_activity_at = NOW(),
    updated_at = NOW()
  WHERE id = lead_id_input;
END;
$$ LANGUAGE plpgsql;

-- View for lead funnel analytics
CREATE OR REPLACE VIEW lead_funnel AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  source,
  COUNT(*) as total_leads,
  COUNT(*) FILTER (WHERE status = 'nurturing') as nurturing,
  COUNT(*) FILTER (WHERE status = 'hot') as hot,
  COUNT(*) FILTER (WHERE status = 'converted') as converted,
  COUNT(*) FILTER (WHERE status = 'dead') as dead
FROM leads
GROUP BY DATE_TRUNC('day', created_at), source;

-- View for email performance
CREATE OR REPLACE VIEW email_performance AS
SELECT 
  email_key,
  COUNT(*) as sent,
  COUNT(*) FILTER (WHERE opened_at IS NOT NULL) as opened,
  COUNT(*) FILTER (WHERE clicked_at IS NOT NULL) as clicked,
  ROUND(100.0 * COUNT(*) FILTER (WHERE opened_at IS NOT NULL) / NULLIF(COUNT(*), 0), 1) as open_rate,
  ROUND(100.0 * COUNT(*) FILTER (WHERE clicked_at IS NOT NULL) / NULLIF(COUNT(*), 0), 1) as click_rate
FROM lead_emails
WHERE sent_at IS NOT NULL
GROUP BY email_key;
