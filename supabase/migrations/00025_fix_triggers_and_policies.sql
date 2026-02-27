-- Migration: Fix incorrect trigger function references and policy typos
-- Fixes:
--   1. Triggers in 00004 reference non-existent update_updated_at_column()
--      instead of update_updated_at()
--   2. Double ::text::text cast in 00021 reports policy

-- ============================================================================
-- Fix 1: Recreate triggers with correct function name
-- ============================================================================

-- Drop triggers that reference the wrong function (safe - no data loss)
DROP TRIGGER IF EXISTS update_quizzes_updated_at ON quizzes;
DROP TRIGGER IF EXISTS update_lesson_comments_updated_at ON lesson_comments;

-- Recreate with correct function name
CREATE TRIGGER update_quizzes_updated_at
  BEFORE UPDATE ON quizzes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_lesson_comments_updated_at
  BEFORE UPDATE ON lesson_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- Fix 2: Recreate reports policy with correct single ::text cast
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own reports" ON public.reports;

CREATE POLICY "Users can view own reports" ON public.reports
  FOR SELECT USING (
    reporter_profile_id IN (
      SELECT id FROM public.profiles WHERE clerk_user_id = auth.uid()::text
    )
  );
