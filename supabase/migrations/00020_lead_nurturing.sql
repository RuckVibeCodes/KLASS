-- Lead Nurturing System
-- Migration: 00020_lead_nurturing.sql
-- Created: 2026-02-02

-- Leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  creator_type TEXT, -- courses, coaching, content, community, other
  current_platform TEXT,
  community_size TEXT,
  
  -- Status tracking
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'nurturing', 'hot', 'converted', 'dead', 'unsubscribed')),
  lead_score INTEGER DEFAULT 0,
  
  -- Source tracking
  source TEXT, -- founders_page, popup, demo, waitlist, ads
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
CREATE TABLE IF NOT EXISTS public.lead_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  sequence_id TEXT NOT NULL, -- 'founders_nurture', 're_engagement', etc.
  email_number INTEGER NOT NULL,
  email_key TEXT NOT NULL, -- 'welcome', 'day1_value', etc.
  
  -- Delivery tracking
  scheduled_for TIMESTAMPTZ,
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
CREATE TABLE IF NOT EXISTS public.lead_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'page_view', 'email_open', 'email_click', 'checkout_start', etc.
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lead scoring rules (configurable)
CREATE TABLE IF NOT EXISTS public.lead_score_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  event_filter JSONB,
  points INTEGER NOT NULL,
  max_per_day INTEGER DEFAULT 1,
  description TEXT,
  active BOOLEAN DEFAULT true
);

-- Insert default scoring rules
INSERT INTO public.lead_score_rules (event_type, event_filter, points, max_per_day, description) VALUES
  ('page_view', '{"page": "/founders"}', 10, 3, 'Viewed founders page'),
  ('page_view', '{"page": "/demo"}', 5, 2, 'Viewed demo'),
  ('email_open', NULL, 2, 5, 'Opened email'),
  ('email_click', NULL, 5, 5, 'Clicked email link'),
  ('checkout_start', NULL, 25, 1, 'Started checkout'),
  ('demo_start', NULL, 15, 1, 'Started using demo'),
  ('pricing_view', NULL, 8, 2, 'Viewed pricing section');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created ON public.leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_score ON public.leads(lead_score DESC);
CREATE INDEX IF NOT EXISTS idx_lead_emails_lead_sent ON public.lead_emails(lead_id, sent_at);
CREATE INDEX IF NOT EXISTS idx_lead_emails_scheduled ON public.lead_emails(scheduled_for) WHERE sent_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_lead_events_lead_type ON public.lead_events(lead_id, event_type);
CREATE INDEX IF NOT EXISTS idx_lead_events_created ON public.lead_events(created_at);

-- Lead funnel view
CREATE OR REPLACE VIEW public.lead_funnel AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  source,
  COUNT(*) as total_leads,
  COUNT(*) FILTER (WHERE status = 'nurturing') as nurturing,
  COUNT(*) FILTER (WHERE status = 'hot') as hot,
  COUNT(*) FILTER (WHERE status = 'converted') as converted,
  COUNT(*) FILTER (WHERE status = 'dead') as dead
FROM public.leads
GROUP BY DATE_TRUNC('day', created_at), source;

-- Email performance view
CREATE OR REPLACE VIEW public.email_performance AS
SELECT 
  email_key,
  COUNT(*) as sent,
  COUNT(*) FILTER (WHERE opened_at IS NOT NULL) as opened,
  COUNT(*) FILTER (WHERE clicked_at IS NOT NULL) as clicked,
  ROUND(100.0 * COUNT(*) FILTER (WHERE opened_at IS NOT NULL) / NULLIF(COUNT(*), 0), 1) as open_rate,
  ROUND(100.0 * COUNT(*) FILTER (WHERE clicked_at IS NOT NULL) / NULLIF(COUNT(*), 0), 1) as click_rate
FROM public.lead_emails
WHERE sent_at IS NOT NULL
GROUP BY email_key;

-- RLS Policies (admin only access)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_score_rules ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (for API routes)
CREATE POLICY "Service role full access to leads" ON public.leads
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to lead_emails" ON public.lead_emails
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to lead_events" ON public.lead_events
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to lead_score_rules" ON public.lead_score_rules
  FOR ALL USING (auth.role() = 'service_role');

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_lead_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lead_updated_at();

-- Function to increment lead score
CREATE OR REPLACE FUNCTION public.increment_lead_score(p_lead_id UUID, p_points INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE public.leads
  SET lead_score = lead_score + p_points,
      last_activity_at = NOW()
  WHERE id = p_lead_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
