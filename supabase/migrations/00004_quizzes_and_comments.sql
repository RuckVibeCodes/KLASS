-- Quizzes for lessons
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  passing_score INTEGER NOT NULL DEFAULT 70, -- Percentage required to pass
  max_attempts INTEGER, -- NULL = unlimited
  randomize_questions BOOLEAN NOT NULL DEFAULT false,
  show_correct_answers BOOLEAN NOT NULL DEFAULT true, -- Show correct answers after submission
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Quiz questions
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'multiple_choice', -- 'multiple_choice', 'true_false', 'multi_select'
  order_index INTEGER NOT NULL DEFAULT 0,
  points INTEGER NOT NULL DEFAULT 1,
  explanation TEXT, -- Shown after answering
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Quiz answer options
CREATE TABLE quiz_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0
);

-- Quiz attempts (user submissions)
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL, -- Percentage score
  passed BOOLEAN NOT NULL,
  answers JSONB NOT NULL, -- Stores user's answers as JSON
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Lesson comments
CREATE TABLE lesson_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES lesson_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Lesson comment likes
CREATE TABLE lesson_comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES lesson_comments(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(comment_id, profile_id)
);

-- Indexes
CREATE INDEX idx_quizzes_lesson ON quizzes(lesson_id);
CREATE INDEX idx_quiz_questions_quiz ON quiz_questions(quiz_id, order_index);
CREATE INDEX idx_quiz_options_question ON quiz_options(question_id, order_index);
CREATE INDEX idx_quiz_attempts_user ON quiz_attempts(profile_id, quiz_id);
CREATE INDEX idx_quiz_attempts_quiz ON quiz_attempts(quiz_id, completed_at DESC);
CREATE INDEX idx_lesson_comments_lesson ON lesson_comments(lesson_id, created_at DESC);
CREATE INDEX idx_lesson_comments_parent ON lesson_comments(parent_comment_id);
CREATE INDEX idx_lesson_comment_likes_comment ON lesson_comment_likes(comment_id);

-- RLS Policies

-- Quizzes: Visible if lesson is accessible
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quizzes_select" ON quizzes FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM lessons l
    JOIN programs p ON l.program_id = p.id
    JOIN profiles pr ON pr.community_id = p.community_id
    WHERE l.id = quizzes.lesson_id
      AND l.published = true
      AND p.published = true
      AND pr.clerk_user_id = auth.uid()::text
      AND (
        l.visibility = 'public'
        OR l.visibility = 'members'
        OR (l.visibility = 'paid' AND (pr.tier = 'PAID' OR pr.role = 'ADMIN'))
      )
  )
  OR EXISTS (
    SELECT 1 FROM lessons l
    JOIN programs p ON l.program_id = p.id
    JOIN profiles pr ON pr.community_id = p.community_id
    WHERE l.id = quizzes.lesson_id
      AND pr.clerk_user_id = auth.uid()::text
      AND pr.role = 'ADMIN'
  )
);

CREATE POLICY "quizzes_admin" ON quizzes FOR ALL USING (
  EXISTS (
    SELECT 1 FROM lessons l
    JOIN programs p ON l.program_id = p.id
    JOIN profiles pr ON pr.community_id = p.community_id
    WHERE l.id = quizzes.lesson_id
      AND pr.clerk_user_id = auth.uid()::text
      AND pr.role = 'ADMIN'
  )
);

-- Quiz Questions: Same as quizzes
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_questions_select" ON quiz_questions FOR SELECT USING (
  EXISTS (SELECT 1 FROM quizzes q WHERE q.id = quiz_questions.quiz_id)
);

CREATE POLICY "quiz_questions_admin" ON quiz_questions FOR ALL USING (
  EXISTS (
    SELECT 1 FROM quizzes q
    JOIN lessons l ON q.lesson_id = l.id
    JOIN programs p ON l.program_id = p.id
    JOIN profiles pr ON pr.community_id = p.community_id
    WHERE q.id = quiz_questions.quiz_id
      AND pr.clerk_user_id = auth.uid()::text
      AND pr.role = 'ADMIN'
  )
);

-- Quiz Options: Same as questions
ALTER TABLE quiz_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_options_select" ON quiz_options FOR SELECT USING (
  EXISTS (SELECT 1 FROM quiz_questions qq WHERE qq.id = quiz_options.question_id)
);

CREATE POLICY "quiz_options_admin" ON quiz_options FOR ALL USING (
  EXISTS (
    SELECT 1 FROM quiz_questions qq
    JOIN quizzes q ON qq.quiz_id = q.id
    JOIN lessons l ON q.lesson_id = l.id
    JOIN programs p ON l.program_id = p.id
    JOIN profiles pr ON pr.community_id = p.community_id
    WHERE qq.id = quiz_options.question_id
      AND pr.clerk_user_id = auth.uid()::text
      AND pr.role = 'ADMIN'
  )
);

-- Quiz Attempts: Users can see their own, admins can see all in their community
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_attempts_own" ON quiz_attempts FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles pr
    WHERE pr.id = quiz_attempts.profile_id
      AND pr.clerk_user_id = auth.uid()::text
  )
);

CREATE POLICY "quiz_attempts_admin_select" ON quiz_attempts FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM quizzes q
    JOIN lessons l ON q.lesson_id = l.id
    JOIN programs p ON l.program_id = p.id
    JOIN profiles pr ON pr.community_id = p.community_id
    WHERE q.id = quiz_attempts.quiz_id
      AND pr.clerk_user_id = auth.uid()::text
      AND pr.role = 'ADMIN'
  )
);

-- Lesson Comments: Visible if lesson is accessible
ALTER TABLE lesson_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lesson_comments_select" ON lesson_comments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM lessons l
    JOIN programs p ON l.program_id = p.id
    JOIN profiles pr ON pr.community_id = p.community_id
    WHERE l.id = lesson_comments.lesson_id
      AND l.published = true
      AND p.published = true
      AND pr.clerk_user_id = auth.uid()::text
  )
);

CREATE POLICY "lesson_comments_insert" ON lesson_comments FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles pr
    WHERE pr.id = lesson_comments.profile_id
      AND pr.clerk_user_id = auth.uid()::text
  )
);

CREATE POLICY "lesson_comments_update_own" ON lesson_comments FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles pr
    WHERE pr.id = lesson_comments.profile_id
      AND pr.clerk_user_id = auth.uid()::text
  )
);

CREATE POLICY "lesson_comments_delete" ON lesson_comments FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM profiles pr
    WHERE pr.id = lesson_comments.profile_id
      AND pr.clerk_user_id = auth.uid()::text
  )
  OR EXISTS (
    SELECT 1 FROM lessons l
    JOIN programs p ON l.program_id = p.id
    JOIN profiles pr ON pr.community_id = p.community_id
    WHERE l.id = lesson_comments.lesson_id
      AND pr.clerk_user_id = auth.uid()::text
      AND pr.role = 'ADMIN'
  )
);

-- Lesson Comment Likes
ALTER TABLE lesson_comment_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lesson_comment_likes_select" ON lesson_comment_likes FOR SELECT USING (
  EXISTS (SELECT 1 FROM lesson_comments lc WHERE lc.id = lesson_comment_likes.comment_id)
);

CREATE POLICY "lesson_comment_likes_own" ON lesson_comment_likes FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles pr
    WHERE pr.id = lesson_comment_likes.profile_id
      AND pr.clerk_user_id = auth.uid()::text
  )
);

-- Triggers to update updated_at
CREATE TRIGGER update_quizzes_updated_at
  BEFORE UPDATE ON quizzes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lesson_comments_updated_at
  BEFORE UPDATE ON lesson_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
