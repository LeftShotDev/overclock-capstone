-- Add two new persona questions for character style matching
-- These determine communication energy and approach, used to auto-match
-- the best-fit character within the scored persona.

INSERT INTO quiz_questions (id, question, question_type, options, is_active, sort_order)
VALUES
  (
    'teaching-energy',
    'When a student nails a tough concept, how do you react?',
    'persona',
    '[
      {"label": "Big energy — I want them to feel how exciting this is!", "value": "high"},
      {"label": "A genuine smile and a thoughtful acknowledgment — I let the moment land.", "value": "calm"},
      {"label": "I keep it real — quick props, then on to what''s next.", "value": "direct"}
    ]'::jsonb,
    true,
    5
  ),
  (
    'communication-approach',
    'Your go-to way of helping a stuck student:',
    'persona',
    '[
      {"label": "Make it fun — reframe the problem, use humor, lighten the mood.", "value": "playful"},
      {"label": "Get personal — share your own experience, connect on a human level.", "value": "personal"},
      {"label": "Cut to it — identify the gap, give clear steps, trust them to execute.", "value": "analytical"}
    ]'::jsonb,
    true,
    6
  );
