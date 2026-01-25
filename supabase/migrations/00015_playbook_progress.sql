-- Playbook progress tracking
-- Stores completion state for hardcoded playbook templates

-- Playbook progress per admin per community
CREATE TABLE IF NOT EXISTS playbook_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  playbook_id TEXT NOT NULL,                    -- matches hardcoded template ID
  completed_step_ids JSONB NOT NULL DEFAULT '[]', -- array of step IDs
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(community_id, profile_id, playbook_id)
);

CREATE INDEX IF NOT EXISTS idx_playbook_progress_community ON playbook_progress(community_id);
CREATE INDEX IF NOT EXISTS idx_playbook_progress_profile ON playbook_progress(profile_id);

-- RLS for playbook_progress
ALTER TABLE playbook_progress ENABLE ROW LEVEL SECURITY;

-- Users can view their own progress
CREATE POLICY "Users can view own playbook progress" ON playbook_progress
  FOR SELECT USING (
    profile_id IN (SELECT id FROM profiles WHERE clerk_user_id = requesting_user_id())
  );

-- Admins can insert/update their own progress
CREATE POLICY "Admins can manage own playbook progress" ON playbook_progress
  FOR ALL USING (
    profile_id IN (
      SELECT id FROM profiles
      WHERE clerk_user_id = requesting_user_id()
      AND role = 'ADMIN'
    )
  );
