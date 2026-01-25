-- Create post_likes table for tracking user likes on posts
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, profile_id)
);

-- Create index for faster lookups
CREATE INDEX idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX idx_post_likes_profile_id ON post_likes(profile_id);

-- RLS policies for post_likes
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "post_likes_select" ON post_likes
  FOR SELECT USING (true);

CREATE POLICY "post_likes_insert" ON post_likes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "post_likes_delete" ON post_likes
  FOR DELETE USING (true);

-- Function to toggle like and update count
CREATE OR REPLACE FUNCTION toggle_post_like(p_post_id UUID, p_profile_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  liked BOOLEAN;
BEGIN
  -- Check if already liked
  IF EXISTS (SELECT 1 FROM post_likes WHERE post_id = p_post_id AND profile_id = p_profile_id) THEN
    -- Unlike: remove the like
    DELETE FROM post_likes WHERE post_id = p_post_id AND profile_id = p_profile_id;
    UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = p_post_id;
    liked := FALSE;
  ELSE
    -- Like: add the like
    INSERT INTO post_likes (post_id, profile_id) VALUES (p_post_id, p_profile_id);
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = p_post_id;
    liked := TRUE;
  END IF;

  RETURN liked;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
