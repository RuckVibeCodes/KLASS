-- Seed demo categories for demo-community
-- Run this after running the migration 00003_categories_and_polls.sql

-- First, get the demo community ID
DO $$
DECLARE
  v_community_id UUID;
BEGIN
  SELECT id INTO v_community_id FROM communities WHERE slug = 'demo-community';

  IF v_community_id IS NOT NULL THEN
    -- Delete existing categories for this community
    DELETE FROM post_categories WHERE community_id = v_community_id;

    -- Insert demo categories
    INSERT INTO post_categories (community_id, name, slug, color, icon, display_order) VALUES
      (v_community_id, 'General', 'general', '#6366f1', 'message-circle', 1),
      (v_community_id, 'Introductions', 'introductions', '#10b981', 'hand-wave', 2),
      (v_community_id, 'Q&A', 'qa', '#f59e0b', 'help-circle', 3),
      (v_community_id, 'Wins & Celebrations', 'wins', '#ec4899', 'trophy', 4),
      (v_community_id, 'Resources', 'resources', '#8b5cf6', 'folder', 5),
      (v_community_id, 'Feedback', 'feedback', '#06b6d4', 'message-square', 6);
  END IF;
END $$;
