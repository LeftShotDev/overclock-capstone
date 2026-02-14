-- ============================================================
-- Migration 005: Seed Default Quiz
-- Creates a quiz from the existing courseware settings and links
-- the pre-existing persona + constraint questions to it.
-- ============================================================

-- 1. Insert the default quiz with the 6 courseware settings as its schema
INSERT INTO quizzes (id, name, description, slug, settings_schema, is_active) VALUES
(
  'a0000000-0000-0000-0000-000000000001',
  'Teaching Persona Quiz',
  'The original teaching persona quiz. Helps college instructors discover their teaching style based on courseware settings like mastery threshold, messaging preferences, and participation tracking.',
  'teaching-persona',
  '[
    {
      "id": "mastery_threshold",
      "name": "Mastery Threshold",
      "description": "The minimum score a student needs to demonstrate mastery on an assessment.",
      "type": "select",
      "options": [
        { "label": "70%", "value": "70" },
        { "label": "80%", "value": "80" },
        { "label": "90%", "value": "90" }
      ]
    },
    {
      "id": "message_personality",
      "name": "Message Personality",
      "description": "The tone of automated messages sent to students — coach (warm, encouraging) or advisor (direct, analytical).",
      "type": "select",
      "options": [
        { "label": "Coach", "value": "coach" },
        { "label": "Advisor", "value": "advisor" }
      ]
    },
    {
      "id": "send_auto_messages",
      "name": "Send Auto Messages",
      "description": "Whether the platform sends automated messages to students based on their progress.",
      "type": "toggle",
      "options": []
    },
    {
      "id": "enabled_auto_messages",
      "name": "Enabled Auto Messages",
      "description": "Which types of automated messages are active — help hints (when struggling) and good game (when achieving mastery).",
      "type": "multi-select",
      "options": [
        { "label": "Help Hints", "value": "help_hints" },
        { "label": "Good Game", "value": "good_game" }
      ]
    },
    {
      "id": "show_study_plan_rollup",
      "name": "Show Study Plan Rollup",
      "description": "Whether students see a summary of their progress across all modules in a study plan view.",
      "type": "toggle",
      "options": []
    },
    {
      "id": "graded_participation_enabled",
      "name": "Graded Participation",
      "description": "Whether student participation (discussion posts, activity completion) counts toward their grade.",
      "type": "toggle",
      "options": []
    }
  ]'::jsonb,
  true
);

-- 2. Link existing questions to the default quiz
UPDATE quiz_questions
SET quiz_id = 'a0000000-0000-0000-0000-000000000001'
WHERE id IN (
  'mastery-philosophy',
  'communication-tone',
  'classroom-structure',
  'automated-messaging',
  'cq1',
  'cq2'
);
