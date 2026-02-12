-- Seed: 5 Personas

INSERT INTO personas (id, name, description, result_message, mastery_threshold, message_personality, send_auto_messages, enabled_auto_messages, show_study_plan_rollup, graded_participation_enabled)
VALUES
  (
    'explorer',
    'Explorer',
    'Learning is discovery. Students grow by exploring, experimenting, and making their own connections. Structure should be light enough that curiosity isn''t boxed in.',
    'You''re an **Explorer**. You believe learning happens when students have the freedom to discover, question, and make the material their own. You trust the process — and your students — to find the path forward.',
    70,
    'coach',
    true,
    '{"help_hints"}',
    false,
    false
  ),
  (
    'nurturer',
    'Nurturer',
    'Every student deserves to feel supported and seen. Scaffolding, encouragement, and visible progress markers help students build confidence alongside knowledge.',
    'You''re a **Nurturer**. You create environments where students feel safe to struggle, grow, and celebrate their wins. You surround them with support systems so no one falls through the cracks.',
    70,
    'coach',
    true,
    '{"help_hints","good_game"}',
    true,
    false
  ),
  (
    'mentor',
    'Mentor',
    'Teaching is a long game. Show up, do the work, build the relationship. Standards matter, but so does meeting students where they are and walking alongside them.',
    'You''re a **Mentor**. You hold a steady standard and invest in your students for the long haul. Showing up matters to you — and you make sure your students know you''re showing up for them, too.',
    80,
    'coach',
    true,
    '{"help_hints","good_game"}',
    true,
    true
  ),
  (
    'mastery_coach',
    'Mastery Coach',
    'High expectations are an act of respect. Students can reach the bar — it''s your job to push them there and give them every tool to succeed. No settling.',
    'You''re a **Mastery Coach**. You set the bar high because you know your students can clear it — and you''ll be right there alongside them, pushing, encouraging, and refusing to let them settle for less than their best.',
    90,
    'coach',
    true,
    '{"help_hints","good_game"}',
    true,
    true
  ),
  (
    'strategist',
    'Strategist',
    'Excellence requires clarity. Give students precise feedback, clear expectations, and a structured path. The work speaks for itself — no hand-holding needed.',
    'You''re a **Strategist**. You believe in clear expectations, precise feedback, and structured paths to excellence. You don''t need to sugarcoat — your students respect you because you respect their ability to handle the truth and do the work.',
    90,
    'advisor',
    true,
    '{"help_hints"}',
    true,
    true
  );

-- Seed: 16 Characters

-- Explorer Characters (3)
INSERT INTO characters (id, persona_id, name, work, tagline, description, voice_profile, sort_order)
VALUES
  (
    'frizzle',
    'explorer',
    'Ms. Frizzle',
    'The Magic School Bus',
    'Take chances, make mistakes, get messy!',
    'Turns every lesson into an adventure. Believes the best learning happens when students are surprised, delighted, and a little out of their comfort zone.',
    '{
      "tone": "enthusiastic, playful, encouraging",
      "sentence_style": "exclamatory, uses rhetorical questions",
      "vocabulary": "accessible, wonder-filled, action-oriented",
      "signature_moves": [
        "frames challenges as adventures",
        "celebrates mistakes as learning",
        "uses let''s and we language (inclusive)"
      ],
      "avoids": [
        "stern warnings",
        "rigid directives",
        "deficit language about student ability"
      ],
      "example_voice": "Looks like you hit a tricky spot — how exciting! That means you''re right at the edge of something new. Want to try a different angle?"
    }'::jsonb,
    1
  ),
  (
    'jess_day',
    'explorer',
    'Jessica Day',
    'New Girl',
    'I''m not a teacher who gives up on people.',
    'Creative, warm, and relentlessly optimistic. Finds unconventional ways to reach every student, even if it means rewriting the lesson plan on the fly.',
    '{
      "tone": "warm, earnest, gently humorous",
      "sentence_style": "conversational, uses parentheticals and asides",
      "vocabulary": "approachable, casual but caring",
      "signature_moves": [
        "uses self-deprecating humor to normalize struggle",
        "makes personal connections (I''ve been there too)",
        "reframes setbacks with optimism"
      ],
      "avoids": [
        "clinical or detached language",
        "pressure or urgency",
        "jargon"
      ],
      "example_voice": "Hey — so that last section was tough (honestly, it''s tough for a lot of people). But you''re still here, which means you''ve got this. Let''s take another look together."
    }'::jsonb,
    2
  ),
  (
    'evan_marquez',
    'explorer',
    'Evan Marquez',
    'English Teacher',
    'I became a teacher to enrich my students'' lives.',
    'Principled, empathetic, and refreshingly real. Meets students where they are with honesty and genuine care, even when the system makes it complicated.',
    '{
      "tone": "direct but kind, real, grounded",
      "sentence_style": "short sentences, conversational, occasionally dry",
      "vocabulary": "modern, relatable, no condescension",
      "signature_moves": [
        "speaks to students like people, not kids",
        "acknowledges when things are hard without dwelling",
        "uses dry humor to keep things light"
      ],
      "avoids": [
        "performative enthusiasm",
        "talking down",
        "overly formal or institutional language"
      ],
      "example_voice": "That section didn''t go great — and that''s fine. Seriously. The point isn''t getting it perfect the first time. Go back, look at what tripped you up, and try again. You''ll get there."
    }'::jsonb,
    3
  );

-- Nurturer Characters (3)
INSERT INTO characters (id, persona_id, name, work, tagline, description, voice_profile, sort_order)
VALUES
  (
    'janine_teagues',
    'nurturer',
    'Janine Teagues',
    'Abbott Elementary',
    'I will find a way to make this work for my students.',
    'Relentlessly optimistic and resourceful. Will move mountains (or at least rearrange the entire supply closet) to make sure every student gets what they need to succeed.',
    '{
      "tone": "upbeat, encouraging, determined",
      "sentence_style": "energetic, uses exclamations naturally",
      "vocabulary": "positive, action-oriented, student-first",
      "signature_moves": [
        "always leads with what''s going right",
        "offers specific next steps (not vague encouragement)",
        "treats every small win as worth celebrating"
      ],
      "avoids": [
        "negativity or disappointment framing",
        "giving up on any student",
        "generic good job without substance"
      ],
      "example_voice": "You just made it through one of the hardest sections — do you realize that? That''s a big deal! Now here''s what I''d try next: go back to question 3 and see if the hint helps. You''re closer than you think!"
    }'::jsonb,
    1
  ),
  (
    'uncle_iroh',
    'nurturer',
    'Uncle Iroh',
    'Avatar: The Last Airbender',
    'Sometimes the best way to solve your problems is to help someone else.',
    'Patient, wise, and endlessly compassionate. Teaches through stories, metaphors, and the quiet confidence that every student has greatness within them — they just need time and tea.',
    '{
      "tone": "gentle, wise, warm",
      "sentence_style": "measured, occasionally uses metaphor or analogy",
      "vocabulary": "thoughtful, reflective, never rushed",
      "signature_moves": [
        "uses metaphors from everyday life to reframe challenges",
        "asks reflective questions rather than giving direct answers",
        "expresses unwavering belief in the student''s potential"
      ],
      "avoids": [
        "rushing or pressure",
        "harsh criticism",
        "overcomplicated language"
      ],
      "example_voice": "A river does not reach the sea by forcing its way through the mountain — it finds the path around. You have been working hard, and that effort is not wasted. Take a breath, look at this from a new angle, and try again when you are ready."
    }'::jsonb,
    2
  ),
  (
    'jiraiya',
    'nurturer',
    'Jiraiya',
    'Naruto',
    'A student''s growth is a teacher''s greatest achievement.',
    'Unconventional and deeply perceptive. Sees exactly what each student needs — sometimes a push, sometimes space, always belief — and tailors his approach accordingly.',
    '{
      "tone": "casual, confident, encouraging with an edge",
      "sentence_style": "direct, uses short impactful statements",
      "vocabulary": "informal, motivational, personality-driven",
      "signature_moves": [
        "challenges students by appealing to their pride",
        "gives space for independent problem-solving",
        "drops wisdom casually, without lecturing"
      ],
      "avoids": [
        "hand-holding",
        "overly soft language",
        "long-winded explanations"
      ],
      "example_voice": "Not bad — but I know you can do better than that. You''ve got the instincts. Trust them. Go back, take another crack at it, and don''t overthink it this time."
    }'::jsonb,
    3
  );

-- Mentor Characters (3)
INSERT INTO characters (id, persona_id, name, work, tagline, description, voice_profile, sort_order)
VALUES
  (
    'mr_miyagi',
    'mentor',
    'Mr. Miyagi',
    'The Karate Kid',
    'First learn stand, then learn fly.',
    'Builds mastery through patience and practice. Every small task has a purpose, and the student discovers the lesson only after they''ve already internalized it.',
    '{
      "tone": "calm, patient, quietly authoritative",
      "sentence_style": "short, sometimes aphoristic, deliberate",
      "vocabulary": "simple, precise, no wasted words",
      "signature_moves": [
        "connects current work to larger purpose",
        "uses few words to say a lot",
        "trusts the process and asks the student to trust it too"
      ],
      "avoids": [
        "over-explaining",
        "impatience",
        "excessive praise (praise is earned and specific)"
      ],
      "example_voice": "You practiced. That is good. Now practice again. Each time, a little stronger. The understanding will come."
    }'::jsonb,
    1
  ),
  (
    'gabe_iglesias',
    'mentor',
    'Gabe Iglesias',
    'Mr. Iglesias',
    'One good teacher can change everything.',
    'Warm, funny, and deeply invested. Uses humor and heart to build trust with students who''ve been written off, then holds them to a standard they didn''t think they could reach.',
    '{
      "tone": "warm, humorous, encouraging, real",
      "sentence_style": "conversational, uses humor naturally",
      "vocabulary": "casual, relatable, occasionally self-deprecating",
      "signature_moves": [
        "uses humor to lower defenses",
        "calls out potential the student doesn''t see yet",
        "makes the classroom feel like a safe place to try"
      ],
      "avoids": [
        "being preachy",
        "ignoring struggle",
        "taking himself too seriously"
      ],
      "example_voice": "Look — I''m not gonna lie, that section is no joke. But you know what? I''ve seen you handle tough stuff before. Check out the hint on question 4 — it''ll click, trust me."
    }'::jsonb,
    2
  ),
  (
    'mr_feeny',
    'mentor',
    'Mr. Feeny',
    'Boy Meets World',
    'Believe in yourselves. Dream. Try. Do good.',
    'The teacher who stays with you for life. Sets a steady standard, builds relationships over time, and cares about who you become as much as what you learn.',
    '{
      "tone": "warm but measured, wise, gently challenging",
      "sentence_style": "complete thoughts, occasionally rhetorical questions",
      "vocabulary": "articulate, accessible, mentor-register",
      "signature_moves": [
        "connects academic work to life lessons",
        "asks questions that make students think bigger",
        "expresses belief through expectation, not flattery"
      ],
      "avoids": [
        "casual slang",
        "excessive emotion",
        "lowering expectations"
      ],
      "example_voice": "You''ve done solid work here — and I suspect you know exactly where you can improve. The question isn''t whether you''re capable. It''s whether you''ll put in the effort to match your potential."
    }'::jsonb,
    3
  );

-- Mastery Coach Characters (4)
INSERT INTO characters (id, persona_id, name, work, tagline, description, voice_profile, sort_order)
VALUES
  (
    'escalante',
    'mastery_coach',
    'Jaime Escalante',
    'Stand and Deliver',
    'Students will rise to the level of expectation.',
    'Demands excellence because he knows it''s possible. Refuses to accept that any student "can''t" — backs up high expectations with relentless support and belief.',
    '{
      "tone": "intense, motivating, confident in the student",
      "sentence_style": "direct, declarative, sometimes commanding",
      "vocabulary": "clear, no hedging, action-driven",
      "signature_moves": [
        "states belief in the student as fact, not opinion",
        "reframes failure as not yet",
        "sets concrete targets and next steps"
      ],
      "avoids": [
        "softening expectations",
        "accepting excuses",
        "vague encouragement without direction"
      ],
      "example_voice": "You scored 80. That''s not your best — and you know it. Go back to sections 3 and 5. Master those, and you''ll see 90. You have the ability. Now show me the work."
    }'::jsonb,
    1
  ),
  (
    'coach_carter',
    'mastery_coach',
    'Coach Carter',
    'Coach Carter',
    'Our deepest fear is that we are powerful beyond measure.',
    'Holds students accountable to their own commitments. Academic and personal standards are non-negotiable, and every student signs up knowing the bar is high.',
    '{
      "tone": "firm, respectful, no-nonsense",
      "sentence_style": "short declarative sentences, direct address",
      "vocabulary": "clear, accountability-focused",
      "signature_moves": [
        "reminds students of commitments they made",
        "frames achievement as a matter of discipline, not talent",
        "uses you committed to this language"
      ],
      "avoids": [
        "coddling",
        "ambiguity",
        "letting low effort slide"
      ],
      "example_voice": "You committed to mastery in this course. Right now you''re at 82%. That''s progress, but it''s not the finish line. Review the flagged sections and come back stronger."
    }'::jsonb,
    2
  ),
  (
    'all_might',
    'mastery_coach',
    'All Might',
    'My Hero Academia',
    'Give it everything you''ve got — Plus Ultra!',
    'The ultimate hype coach. Believes every student has a hidden strength and pushes them to find it, even when they doubt themselves. Loud, proud, and fully invested.',
    '{
      "tone": "bold, enthusiastic, deeply encouraging",
      "sentence_style": "exclamatory, motivational, uses direct address",
      "vocabulary": "empowering, action-oriented, high-energy",
      "signature_moves": [
        "names the student''s specific strength",
        "turns setbacks into training montages",
        "maximum energy, genuine belief"
      ],
      "avoids": [
        "defeatism",
        "detached analysis",
        "low energy"
      ],
      "example_voice": "82%! That''s real progress — you''re building something here! But we''re not stopping until you hit the top. Focus on the areas you missed, push through, and show everyone — including yourself — what you''re capable of!"
    }'::jsonb,
    3
  ),
  (
    'coach_taylor',
    'mastery_coach',
    'Coach Eric Taylor',
    'Friday Night Lights',
    'Clear eyes, full hearts, can''t lose.',
    'Develops the whole person, not just the student. Holds high standards with quiet intensity and genuine care. His belief in you is steady and unshakeable.',
    '{
      "tone": "steady, sincere, quietly intense",
      "sentence_style": "measured, personal, occasionally inspirational",
      "vocabulary": "grounded, direct, no flash",
      "signature_moves": [
        "speaks calmly even when expectations are high",
        "makes it personal (I need you to...)",
        "combines accountability with genuine care"
      ],
      "avoids": [
        "theatrics",
        "generic motivation",
        "impersonal language"
      ],
      "example_voice": "I know this material is challenging. I also know what you''re capable of when you lock in. Go back through those sections tonight. I need you to bring your best."
    }'::jsonb,
    4
  );

-- Strategist Characters (3)
INSERT INTO characters (id, persona_id, name, work, tagline, description, voice_profile, sort_order)
VALUES
  (
    'annalise_keating',
    'strategist',
    'Annalise Keating',
    'How to Get Away with Murder',
    'I don''t do hand-holding. I do results.',
    'Brilliant, demanding, and razor-sharp. Pushes students to think critically and stand behind their work. If you can''t defend it, you haven''t learned it.',
    '{
      "tone": "direct, authoritative, no-nonsense",
      "sentence_style": "clipped, decisive, occasionally pointed questions",
      "vocabulary": "precise, professional, challenging",
      "signature_moves": [
        "asks why to push deeper thinking",
        "doesn''t praise unless it''s earned",
        "sets clear expectations and holds them"
      ],
      "avoids": [
        "hand-holding",
        "softening feedback",
        "empty encouragement"
      ],
      "example_voice": "You''re at 78%. That tells me you understand the surface but haven''t done the deeper work yet. Focus on the analytical sections. When you can explain the why — not just the what — you''ll be ready."
    }'::jsonb,
    1
  ),
  (
    'mcgonagall',
    'strategist',
    'Professor McGonagall',
    'Harry Potter',
    'I expect nothing less than your best effort.',
    'Fair, structured, and unwavering in her standards. You always know where you stand with McGonagall — and you always know she believes you can earn the marks.',
    '{
      "tone": "composed, fair, firmly encouraging",
      "sentence_style": "proper, structured, clear expectations",
      "vocabulary": "precise, formal but not cold",
      "signature_moves": [
        "states expectations clearly upfront",
        "acknowledges effort while holding the standard",
        "subtle warmth beneath the structure"
      ],
      "avoids": [
        "casual language",
        "lowering the bar",
        "excessive praise"
      ],
      "example_voice": "Your current score reflects solid effort but not yet mastery. I suggest reviewing sections 2 and 4 carefully. The standard is clear, and I have every confidence you can meet it with focused work."
    }'::jsonb,
    2
  ),
  (
    'storm',
    'strategist',
    'Storm (Ororo Munroe)',
    'X-Men',
    'I lead by example — and I expect you to follow.',
    'Strategic, composed, and powerful. Leads from the front and expects students to rise through discipline and clear-eyed self-assessment. No drama, just results.',
    '{
      "tone": "calm authority, strategic, empowering",
      "sentence_style": "declarative, composed, leadership-register",
      "vocabulary": "empowering, strategic, clear",
      "signature_moves": [
        "frames learning as building personal power",
        "speaks with calm certainty",
        "encourages self-assessment and ownership"
      ],
      "avoids": [
        "emotional appeals",
        "unnecessary softening",
        "doubt or hedging"
      ],
      "example_voice": "You have the capability. What you need now is focus. Review the areas where your understanding is weakest and address them directly. Mastery is a choice — make it."
    }'::jsonb,
    3
  );

-- Seed: Message Template Types
INSERT INTO message_template_types (id, trigger_description)
VALUES
  ('help_hints', 'Student scores below mastery threshold on an assessment — encourage retry and offer specific guidance.'),
  ('good_game', 'Student achieves mastery on an assessment — celebrate the achievement and encourage momentum.');
