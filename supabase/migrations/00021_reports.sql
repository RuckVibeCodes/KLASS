-- Content Reports System
-- Run with: supabase db push

-- Reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  reporter_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- What's being reported
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'comment', 'profile', 'message', 'event', 'resource')),
  content_id UUID NOT NULL,
  reported_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Report details
  reason TEXT NOT NULL CHECK (reason IN (
    'spam',
    'harassment',
    'hate_speech',
    'violence',
    'adult_content',
    'copyright',
    'misinformation',
    'illegal_activity',
    'other'
  )),
  description TEXT,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  severity TEXT CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  
  -- Resolution
  action_taken TEXT CHECK (action_taken IN (
    'no_action',
    'content_removed', 
    'warning_issued',
    'user_suspended',
    'user_banned',
    'reported_to_authorities'
  )),
  resolution_notes TEXT,
  resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_reports_community ON public.reports(community_id);
CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_reports_content ON public.reports(content_type, content_id);
CREATE INDEX idx_reports_reporter ON public.reports(reporter_profile_id);
CREATE INDEX idx_reports_reported ON public.reports(reported_profile_id);
CREATE INDEX idx_reports_created ON public.reports(created_at DESC);

-- RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Users can create reports
CREATE POLICY "Users can create reports" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users can view their own reports
CREATE POLICY "Users can view own reports" ON public.reports
  FOR SELECT USING (
    reporter_profile_id IN (
      SELECT id FROM public.profiles WHERE clerk_user_id = auth.uid()::text::text
    )
  );

-- Admins can view all reports in their community
CREATE POLICY "Admins can view community reports" ON public.reports
  FOR SELECT USING (
    community_id IN (
      SELECT community_id FROM public.profiles 
      WHERE clerk_user_id = auth.uid()::text AND role = 'ADMIN'
    )
  );

-- Admins can update reports in their community
CREATE POLICY "Admins can update community reports" ON public.reports
  FOR UPDATE USING (
    community_id IN (
      SELECT community_id FROM public.profiles 
      WHERE clerk_user_id = auth.uid()::text AND role = 'ADMIN'
    )
  );

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION update_reports_updated_at();
