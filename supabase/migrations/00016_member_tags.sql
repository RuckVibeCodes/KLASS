-- Member Tags System
-- Allows creators to manually tag members for organization and filtering

-- Tag definitions (per community)
CREATE TABLE IF NOT EXISTS member_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                      -- 'vip', 'needs-onboarding', etc.
  color TEXT DEFAULT '#6366f1',            -- hex color for UI
  description TEXT,                        -- optional description of the tag
  is_system BOOLEAN NOT NULL DEFAULT false, -- system tags are read-only
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(community_id, name)
);

-- Tag assignments to profiles
CREATE TABLE IF NOT EXISTS profile_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES member_tags(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES profiles(id), -- who assigned (null for system)
  UNIQUE(profile_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_member_tags_community ON member_tags(community_id);
CREATE INDEX IF NOT EXISTS idx_profile_tags_profile ON profile_tags(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_tags_tag ON profile_tags(tag_id);

-- RLS for member_tags
ALTER TABLE member_tags ENABLE ROW LEVEL SECURITY;

-- Anyone in the community can view tags
CREATE POLICY "Community members can view tags" ON member_tags
  FOR SELECT USING (
    community_id IN (
      SELECT community_id FROM profiles WHERE clerk_user_id = requesting_user_id()
    )
  );

-- Only admins can create/update/delete non-system tags
CREATE POLICY "Admins can manage non-system tags" ON member_tags
  FOR ALL USING (
    is_system = false AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE clerk_user_id = requesting_user_id()
      AND community_id = member_tags.community_id
      AND role = 'ADMIN'
    )
  );

-- RLS for profile_tags
ALTER TABLE profile_tags ENABLE ROW LEVEL SECURITY;

-- Admins can view all profile tags in their community
CREATE POLICY "Admins can view profile tags" ON profile_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles admin
      JOIN profiles tagged ON tagged.id = profile_tags.profile_id
      WHERE admin.clerk_user_id = requesting_user_id()
      AND admin.community_id = tagged.community_id
      AND admin.role = 'ADMIN'
    )
  );

-- Admins can manage profile tags
CREATE POLICY "Admins can manage profile tags" ON profile_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles admin
      JOIN profiles tagged ON tagged.id = profile_tags.profile_id
      WHERE admin.clerk_user_id = requesting_user_id()
      AND admin.community_id = tagged.community_id
      AND admin.role = 'ADMIN'
    )
  );
