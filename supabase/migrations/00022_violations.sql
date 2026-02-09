-- Violation Tracking System (Strike System)
-- Run with: supabase db push

-- Violations table (tracks strikes against users)
CREATE TABLE IF NOT EXISTS public.violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  report_id UUID REFERENCES public.reports(id) ON DELETE SET NULL,
  
  -- Violation details
  violation_type TEXT NOT NULL CHECK (violation_type IN (
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
  severity TEXT NOT NULL CHECK (severity IN ('minor', 'moderate', 'severe', 'critical')),
  description TEXT,
  
  -- Strike info
  strike_number INTEGER NOT NULL DEFAULT 1,
  
  -- Action taken
  action_taken TEXT NOT NULL CHECK (action_taken IN (
    'warning',
    'content_removed',
    'suspension_7_days',
    'suspension_30_days',
    'permanent_ban'
  )),
  
  -- Suspension tracking
  suspension_starts_at TIMESTAMPTZ,
  suspension_ends_at TIMESTAMPTZ,
  
  -- Who issued it
  issued_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Appeal tracking
  appeal_status TEXT CHECK (appeal_status IN ('none', 'pending', 'approved', 'denied')) DEFAULT 'none',
  appeal_reason TEXT,
  appeal_submitted_at TIMESTAMPTZ,
  appeal_reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  appeal_reviewed_at TIMESTAMPTZ,
  appeal_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User enforcement status (current state)
CREATE TABLE IF NOT EXISTS public.user_enforcement_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Current status
  status TEXT NOT NULL DEFAULT 'good_standing' CHECK (status IN (
    'good_standing',
    'warned',
    'suspended',
    'banned'
  )),
  
  -- Strike count
  total_strikes INTEGER DEFAULT 0,
  
  -- Suspension info
  suspended_until TIMESTAMPTZ,
  
  -- Ban info
  banned_at TIMESTAMPTZ,
  ban_reason TEXT,
  
  -- Metadata
  last_violation_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(community_id, profile_id)
);

-- Indexes
CREATE INDEX idx_violations_community ON public.violations(community_id);
CREATE INDEX idx_violations_profile ON public.violations(profile_id);
CREATE INDEX idx_violations_created ON public.violations(created_at DESC);
CREATE INDEX idx_violations_appeal ON public.violations(appeal_status) WHERE appeal_status = 'pending';

CREATE INDEX idx_enforcement_community ON public.user_enforcement_status(community_id);
CREATE INDEX idx_enforcement_profile ON public.user_enforcement_status(profile_id);
CREATE INDEX idx_enforcement_status ON public.user_enforcement_status(status);
CREATE INDEX idx_enforcement_suspended ON public.user_enforcement_status(suspended_until) WHERE suspended_until IS NOT NULL;

-- RLS
ALTER TABLE public.violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_enforcement_status ENABLE ROW LEVEL SECURITY;

-- Users can view their own violations
CREATE POLICY "Users can view own violations" ON public.violations
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM public.profiles WHERE clerk_user_id = auth.uid()::text
    )
  );

-- Admins can view all violations in their community
CREATE POLICY "Admins can view community violations" ON public.violations
  FOR SELECT USING (
    community_id IN (
      SELECT community_id FROM public.profiles 
      WHERE clerk_user_id = auth.uid()::text AND role = 'ADMIN'
    )
  );

-- Admins can create violations
CREATE POLICY "Admins can create violations" ON public.violations
  FOR INSERT WITH CHECK (
    community_id IN (
      SELECT community_id FROM public.profiles 
      WHERE clerk_user_id = auth.uid()::text AND role = 'ADMIN'
    )
  );

-- Admins can update violations (for appeals)
CREATE POLICY "Admins can update violations" ON public.violations
  FOR UPDATE USING (
    community_id IN (
      SELECT community_id FROM public.profiles 
      WHERE clerk_user_id = auth.uid()::text AND role = 'ADMIN'
    )
  );

-- Users can view their own enforcement status
CREATE POLICY "Users can view own enforcement status" ON public.user_enforcement_status
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM public.profiles WHERE clerk_user_id = auth.uid()::text
    )
  );

-- Admins can view all enforcement statuses in their community
CREATE POLICY "Admins can view community enforcement" ON public.user_enforcement_status
  FOR SELECT USING (
    community_id IN (
      SELECT community_id FROM public.profiles 
      WHERE clerk_user_id = auth.uid()::text AND role = 'ADMIN'
    )
  );

-- Admins can manage enforcement statuses
CREATE POLICY "Admins can manage enforcement" ON public.user_enforcement_status
  FOR ALL USING (
    community_id IN (
      SELECT community_id FROM public.profiles 
      WHERE clerk_user_id = auth.uid()::text AND role = 'ADMIN'
    )
  );

-- Function to calculate strike action
CREATE OR REPLACE FUNCTION get_strike_action(strike_count INTEGER, severity TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Critical severity = immediate ban
  IF severity = 'critical' THEN
    RETURN 'permanent_ban';
  END IF;
  
  -- Progressive discipline based on strike count
  CASE strike_count
    WHEN 1 THEN RETURN 'warning';
    WHEN 2 THEN RETURN 'suspension_7_days';
    WHEN 3 THEN RETURN 'suspension_30_days';
    ELSE RETURN 'permanent_ban';
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to update enforcement status after violation
CREATE OR REPLACE FUNCTION update_enforcement_status()
RETURNS TRIGGER AS $$
DECLARE
  current_strikes INTEGER;
  new_status TEXT;
BEGIN
  -- Get or create enforcement status
  INSERT INTO public.user_enforcement_status (community_id, profile_id, status, total_strikes)
  VALUES (NEW.community_id, NEW.profile_id, 'good_standing', 0)
  ON CONFLICT (community_id, profile_id) DO NOTHING;
  
  -- Get current strike count
  SELECT total_strikes INTO current_strikes
  FROM public.user_enforcement_status
  WHERE community_id = NEW.community_id AND profile_id = NEW.profile_id;
  
  -- Determine new status based on action
  CASE NEW.action_taken
    WHEN 'warning' THEN new_status := 'warned';
    WHEN 'content_removed' THEN new_status := 'warned';
    WHEN 'suspension_7_days' THEN new_status := 'suspended';
    WHEN 'suspension_30_days' THEN new_status := 'suspended';
    WHEN 'permanent_ban' THEN new_status := 'banned';
    ELSE new_status := 'warned';
  END CASE;
  
  -- Update enforcement status
  UPDATE public.user_enforcement_status
  SET 
    status = new_status,
    total_strikes = current_strikes + 1,
    last_violation_at = NOW(),
    suspended_until = CASE 
      WHEN NEW.action_taken = 'suspension_7_days' THEN NOW() + INTERVAL '7 days'
      WHEN NEW.action_taken = 'suspension_30_days' THEN NOW() + INTERVAL '30 days'
      ELSE suspended_until
    END,
    banned_at = CASE WHEN NEW.action_taken = 'permanent_ban' THEN NOW() ELSE banned_at END,
    ban_reason = CASE WHEN NEW.action_taken = 'permanent_ban' THEN NEW.description ELSE ban_reason END,
    updated_at = NOW()
  WHERE community_id = NEW.community_id AND profile_id = NEW.profile_id;
  
  -- Update the violation with the strike number
  NEW.strike_number := current_strikes + 1;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER violation_created
  BEFORE INSERT ON public.violations
  FOR EACH ROW
  EXECUTE FUNCTION update_enforcement_status();

-- Updated at trigger for violations
CREATE OR REPLACE FUNCTION update_violations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER violations_updated_at
  BEFORE UPDATE ON public.violations
  FOR EACH ROW
  EXECUTE FUNCTION update_violations_updated_at();

-- Updated at trigger for enforcement status
CREATE TRIGGER enforcement_updated_at
  BEFORE UPDATE ON public.user_enforcement_status
  FOR EACH ROW
  EXECUTE FUNCTION update_violations_updated_at();
