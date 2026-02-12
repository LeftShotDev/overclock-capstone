-- Teaching Persona Quiz — Database Schema
-- 5 personas, 16 characters, message template types, quiz results

-- Personas: the 5 teaching persona archetypes
CREATE TABLE personas (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  result_message TEXT NOT NULL,
  mastery_threshold INTEGER NOT NULL DEFAULT 80,
  message_personality TEXT NOT NULL DEFAULT 'coach',
  send_auto_messages BOOLEAN NOT NULL DEFAULT true,
  enabled_auto_messages TEXT[] NOT NULL DEFAULT '{"help_hints"}',
  show_study_plan_rollup BOOLEAN NOT NULL DEFAULT true,
  graded_participation_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Characters: fictional teacher characters grouped by persona
CREATE TABLE characters (
  id TEXT PRIMARY KEY,
  persona_id TEXT NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  work TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  voice_profile JSONB NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_characters_persona ON characters(persona_id);

-- Message template types: categories of auto-generated messages
CREATE TABLE message_template_types (
  id TEXT PRIMARY KEY,
  trigger_description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Quiz results: stores completed quiz sessions
CREATE TABLE quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id TEXT NOT NULL REFERENCES personas(id),
  character_id TEXT REFERENCES characters(id),
  applied_settings JSONB NOT NULL DEFAULT '{}',
  quiz_answers JSONB NOT NULL DEFAULT '[]',
  constraint_answers JSONB NOT NULL DEFAULT '[]',
  syllabus_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quiz_results_persona ON quiz_results(persona_id);

-- Message templates: generated message variants (schema only, populated later)
CREATE TABLE message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_result_id UUID NOT NULL REFERENCES quiz_results(id) ON DELETE CASCADE,
  template_type TEXT NOT NULL REFERENCES message_template_types(id),
  character_id TEXT NOT NULL REFERENCES characters(id),
  variants TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_message_templates_quiz_result ON message_templates(quiz_result_id);
CREATE INDEX idx_message_templates_type ON message_templates(template_type);

-- Enable Row Level Security (permissive for now — anon can read)
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_template_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

-- Read-only public access for personas, characters, template types
CREATE POLICY "Public read personas" ON personas FOR SELECT USING (true);
CREATE POLICY "Public read characters" ON characters FOR SELECT USING (true);
CREATE POLICY "Public read template types" ON message_template_types FOR SELECT USING (true);

-- Quiz results: public insert and read (no auth required for capstone)
CREATE POLICY "Public insert quiz results" ON quiz_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read quiz results" ON quiz_results FOR SELECT USING (true);

-- Message templates: public insert and read
CREATE POLICY "Public insert message templates" ON message_templates FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read message templates" ON message_templates FOR SELECT USING (true);
