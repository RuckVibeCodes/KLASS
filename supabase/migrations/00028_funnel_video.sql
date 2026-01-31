-- Add optional video URL to funnels
ALTER TABLE funnels ADD COLUMN IF NOT EXISTS video_url TEXT;

COMMENT ON COLUMN funnels.video_url IS 'Optional video URL (YouTube, Vimeo, Loom, etc.)';
