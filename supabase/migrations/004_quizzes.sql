-- ============================================================
-- Migration 004: Quizzes
-- Adds support for individual quizzes with custom settings schemas
-- and AI-generated draft questions.
-- ============================================================

-- New table: quizzes
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  settings_schema JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quizzes_slug ON quizzes (slug);
CREATE INDEX idx_quizzes_active ON quizzes (is_active);

-- Extend quiz_questions: link to a specific quiz + draft status
ALTER TABLE quiz_questions ADD COLUMN quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE;
ALTER TABLE quiz_questions ADD COLUMN is_draft BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions (quiz_id);

-- RLS for quizzes
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active quizzes"
  ON quizzes FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admin insert quizzes"
  ON quizzes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admin update quizzes"
  ON quizzes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin delete quizzes"
  ON quizzes FOR DELETE
  TO authenticated
  USING (true);
