-- Admin Section — Quiz Questions, Access Codes, and Admin Policies
-- Adds admin-managed quiz questions (replacing static TypeScript files),
-- access codes for gating quiz entry, and RLS policies for admin writes.

-- ============================================================
-- 1. Quiz Questions table (replaces lib/data/quiz-questions.ts
--    and lib/data/constraint-questions.ts)
-- ============================================================
CREATE TABLE quiz_questions (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'persona',  -- 'persona' | 'constraint'
  constraint_key TEXT,                             -- only used when question_type='constraint'
  options JSONB NOT NULL DEFAULT '[]',             -- [{label: string, value: string}]
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quiz_questions_type ON quiz_questions(question_type);
CREATE INDEX idx_quiz_questions_sort ON quiz_questions(sort_order);

-- ============================================================
-- 2. Access Codes table — gate quiz access for demos
-- ============================================================
CREATE TABLE access_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  label TEXT,                       -- e.g. "Spring 2025 Demo"
  is_active BOOLEAN NOT NULL DEFAULT true,
  max_uses INTEGER,                 -- null = unlimited
  use_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,           -- null = no expiry
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_access_codes_code ON access_codes(code);

-- ============================================================
-- 3. Add access_code column to quiz_results
-- ============================================================
ALTER TABLE quiz_results ADD COLUMN access_code TEXT;

-- ============================================================
-- 4. Seed quiz_questions from existing static data
-- ============================================================

-- Persona questions (4)
INSERT INTO quiz_questions (id, question, question_type, constraint_key, options, sort_order) VALUES
(
  'mastery-philosophy',
  'When a student scores 75% on an assessment, your gut reaction is closest to:',
  'persona',
  NULL,
  '[{"label": "They explored the material and that''s a solid start — time to move on.", "value": "70"}, {"label": "They''re building a good foundation — let''s keep growing from here.", "value": "80"}, {"label": "They need to go deeper before they''re ready for what''s next.", "value": "90"}]'::jsonb,
  0
),
(
  'communication-tone',
  'When a student is struggling, you''re more likely to say:',
  'persona',
  NULL,
  '[{"label": "\"I believe in you — let''s figure this out together.\"", "value": "coach"}, {"label": "\"Here''s exactly what you need to focus on to improve.\"", "value": "advisor"}]'::jsonb,
  1
),
(
  'classroom-structure',
  'Your ideal classroom feels most like:',
  'persona',
  NULL,
  '[{"label": "An open workshop — students find their own path through the material.", "value": "open"}, {"label": "A guided journey — I set the milestones, they set the pace.", "value": "guided"}, {"label": "A well-run operation — clear expectations, visible progress for everyone.", "value": "structured"}]'::jsonb,
  2
),
(
  'automated-messaging',
  'When it comes to automated encouragement and nudges for students:',
  'persona',
  NULL,
  '[{"label": "Keep it minimal — I want them to develop independence.", "value": "minimal"}, {"label": "Yes — celebrate their wins and offer help when they''re stuck.", "value": "full"}]'::jsonb,
  3
);

-- Constraint questions (2)
INSERT INTO quiz_questions (id, question, question_type, constraint_key, options, sort_order) VALUES
(
  'cq1',
  'When does your course start?',
  'constraint',
  'courseStartDate',
  '[{"label": "Within 2 weeks", "value": "imminent"}, {"label": "1–2 months away", "value": "soon"}, {"label": "3+ months away", "value": "later"}, {"label": "It''s already in progress", "value": "ongoing"}]'::jsonb,
  4
),
(
  'cq2',
  'How much time do you have to customize your courseware?',
  'constraint',
  'customizationTime',
  '[{"label": "Very little — just the essentials", "value": "minimal"}, {"label": "A few hours to tweak things", "value": "moderate"}, {"label": "Plenty of time to get it just right", "value": "extensive"}]'::jsonb,
  5
);

-- ============================================================
-- 5. RLS Policies
-- ============================================================

-- Quiz Questions: public read (active only), authenticated full CRUD
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active questions"
  ON quiz_questions FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated insert questions"
  ON quiz_questions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated update questions"
  ON quiz_questions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated delete questions"
  ON quiz_questions FOR DELETE
  TO authenticated
  USING (true);

-- Access Codes: public read (for validation), authenticated full CRUD
ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active codes"
  ON access_codes FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public update code use count"
  ON access_codes FOR UPDATE
  USING (is_active = true)
  WITH CHECK (is_active = true);

CREATE POLICY "Authenticated insert codes"
  ON access_codes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated update codes"
  ON access_codes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated delete codes"
  ON access_codes FOR DELETE
  TO authenticated
  USING (true);

-- Add admin write policies to existing tables
CREATE POLICY "Authenticated update personas"
  ON personas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated update characters"
  ON characters FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated insert characters"
  ON characters FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated delete characters"
  ON characters FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated delete quiz results"
  ON quiz_results FOR DELETE
  TO authenticated
  USING (true);
