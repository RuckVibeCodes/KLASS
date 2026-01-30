-- Add creator profile fields to communities table
-- These are used to display the creator's name and avatar on landing pages and sidebars

ALTER TABLE communities
ADD COLUMN IF NOT EXISTS creator_display_name TEXT,
ADD COLUMN IF NOT EXISTS creator_avatar_url TEXT;

-- Add helpful comments
COMMENT ON COLUMN communities.creator_display_name IS 'Creator display name shown on landing pages and sidebars';
COMMENT ON COLUMN communities.creator_avatar_url IS 'Creator avatar URL shown on landing pages and sidebars';
