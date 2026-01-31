-- Add custom thumbnail support for resources
ALTER TABLE resources ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

COMMENT ON COLUMN resources.thumbnail_url IS 'Optional custom thumbnail image URL';
