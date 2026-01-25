-- ============================================
-- POST CATEGORIES
-- ============================================

CREATE TABLE post_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) NOT NULL,
  color VARCHAR(7) DEFAULT '#6366f1',
  icon VARCHAR(50) DEFAULT 'hash',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(community_id, slug)
);

CREATE INDEX idx_post_categories_community ON post_categories(community_id);

-- Add category_id to posts
ALTER TABLE posts ADD COLUMN category_id UUID REFERENCES post_categories(id) ON DELETE SET NULL;
CREATE INDEX idx_posts_category ON posts(category_id);

-- ============================================
-- POLLS
-- ============================================

CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  ends_at TIMESTAMPTZ,
  multiple_choice BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_polls_post ON polls(post_id);

CREATE TABLE poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_text VARCHAR(200) NOT NULL,
  display_order INTEGER DEFAULT 0,
  votes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_poll_options_poll ON poll_options(poll_id);

CREATE TABLE poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(poll_id, profile_id, option_id)
);

CREATE INDEX idx_poll_votes_poll ON poll_votes(poll_id);
CREATE INDEX idx_poll_votes_profile ON poll_votes(profile_id);

-- Function to vote on a poll
CREATE OR REPLACE FUNCTION vote_on_poll(
  p_poll_id UUID,
  p_option_id UUID,
  p_profile_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  is_multiple_choice BOOLEAN;
  already_voted BOOLEAN;
BEGIN
  -- Check if poll allows multiple choice
  SELECT multiple_choice INTO is_multiple_choice FROM polls WHERE id = p_poll_id;

  -- Check if user already voted for this specific option
  SELECT EXISTS(
    SELECT 1 FROM poll_votes
    WHERE poll_id = p_poll_id AND option_id = p_option_id AND profile_id = p_profile_id
  ) INTO already_voted;

  IF already_voted THEN
    -- Remove vote
    DELETE FROM poll_votes WHERE poll_id = p_poll_id AND option_id = p_option_id AND profile_id = p_profile_id;
    UPDATE poll_options SET votes_count = GREATEST(votes_count - 1, 0) WHERE id = p_option_id;
    RETURN FALSE;
  ELSE
    -- If not multiple choice, remove any existing votes first
    IF NOT is_multiple_choice THEN
      -- Decrement counts for existing votes
      UPDATE poll_options SET votes_count = GREATEST(votes_count - 1, 0)
      WHERE id IN (SELECT option_id FROM poll_votes WHERE poll_id = p_poll_id AND profile_id = p_profile_id);
      -- Delete existing votes
      DELETE FROM poll_votes WHERE poll_id = p_poll_id AND profile_id = p_profile_id;
    END IF;

    -- Add new vote
    INSERT INTO poll_votes (poll_id, option_id, profile_id) VALUES (p_poll_id, p_option_id, p_profile_id);
    UPDATE poll_options SET votes_count = votes_count + 1 WHERE id = p_option_id;
    RETURN TRUE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies
ALTER TABLE post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

-- Categories: viewable by community members
CREATE POLICY "Categories viewable by community members" ON post_categories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.community_id = post_categories.community_id
      AND p.clerk_user_id = auth.uid()::text
    )
  );

-- Polls: viewable by community members
CREATE POLICY "Polls viewable by community members" ON polls
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts p
      JOIN profiles pr ON pr.community_id = p.community_id
      WHERE p.id = polls.post_id
      AND pr.clerk_user_id = auth.uid()::text
    )
  );

-- Poll options: viewable by community members
CREATE POLICY "Poll options viewable by community members" ON poll_options
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM polls pl
      JOIN posts p ON p.id = pl.post_id
      JOIN profiles pr ON pr.community_id = p.community_id
      WHERE pl.id = poll_options.poll_id
      AND pr.clerk_user_id = auth.uid()::text
    )
  );

-- Poll votes: users can manage their own votes
CREATE POLICY "Users can vote" ON poll_votes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = poll_votes.profile_id
      AND p.clerk_user_id = auth.uid()::text
    )
  );
