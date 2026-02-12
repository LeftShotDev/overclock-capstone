# Teaching Persona Quiz — Progress & Future Tasks

## Project Summary

A Next.js 16 web app that helps college instructors discover their teaching persona through a BuzzFeed-style quiz, then guides them through personalized courseware settings. Deployed on Vercel.

**Repo:** `git@github.com:LeftShotDev/overclock-capstone.git`

---

## Current Architecture

```
app/
  page.tsx                     Landing page
  quiz/page.tsx                Multi-step quiz (persona, constraints, syllabus)
  results/page.tsx             Persona reveal + AI-streamed blurb
  settings/page.tsx            Setting cards + chat panel
  api/
    persona/route.ts           Claude streamText (one-shot persona blurb)
    chat/route.ts              LangGraph courseware agent (Gemini)
    syllabus/route.ts          Syllabus upload + LangGraph analysis (Claude)
components/
  quiz-option-card.tsx         Clickable quiz option
  constraint-question-step.tsx Constraint question renderer
  syllabus-upload-step.tsx     Drag-and-drop upload with status
  persona-card.tsx             Persona reveal card
  setting-card.tsx             Setting with select dropdown
  chat.tsx                     Chat container (useChat)
  chat-message.tsx             Message bubble
  chat-input.tsx               Input form
lib/
  types.ts                     Zod schemas + TypeScript types
  quiz-context.tsx             React Context + localStorage
  quiz-scoring.ts              Weighted persona scoring
  recommendation-engine.ts     Pure function: persona + constraints + syllabus → setting values
  data/
    quiz-questions.ts          5 persona questions with 4 weighted options each
    constraint-questions.ts    2 constraint questions (course start, customization time)
    quiz-steps.ts              Ordered QuizStep[] (5 persona → 2 constraint → 1 syllabus)
    personas.ts                4 personas: Architect, Coach, Explorer, Sage
    courseware-settings.ts     5 mock settings (due-dates, grading, late-submission, etc.)
  agents/
    index.ts                   Lazy-initialized graph exports
    courseware-agent.ts        Gemini 2.0 Flash ReAct agent for settings chat
    syllabus-analyzer.ts       Claude Sonnet ReAct agent for syllabus extraction
    tools/
      courseware-tools.ts      get_courseware_settings, update_courseware_setting
      syllabus-tools.ts        extract_course_structure, extract_assignments_and_grading, extract_schedule_and_dates
```

### Quiz Flow (Current)

```
/quiz steps 1–5   → Persona questions (pure web form, no AI)
/quiz steps 6–7   → Constraint questions (pure web form, no AI)
/quiz step 8       → Syllabus upload (optional, calls Claude agent)
/results           → Static persona card + AI-streamed blurb (Claude)
/settings          → Dynamic setting recommendations + chat assistant (Gemini)
```

### Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router, Turbopack) |
| AI SDK | Vercel AI SDK v6, LangGraph.js |
| LLMs | Claude Sonnet 4.5 (syllabus + blurb), Gemini 2.0 Flash (chat) |
| UI | Tailwind CSS v4, shadcn/ui |
| State | React Context + localStorage |
| File parsing | pdf-parse v2, mammoth |
| Validation | Zod v4 |
| Package manager | pnpm |

### Current Types (`lib/types.ts`)

```typescript
QuizQuestion       { id, question, options: { label, value, personaWeights }[] }
QuizAnswer         { questionId, selectedValue }
TeachingPersona    { id, name, description, traits, communicationStyle }
CoursewareSetting  { id, name, description, currentValue, recommendedValue, options? }
QuizResult         { topPersonaId, scores, ranking }
ConstraintQuestion { id, question, type: "constraint", constraintKey, options }
ConstraintAnswer   { constraintKey, selectedValue }
SyllabusData       { courseDuration?, assignmentTypes?, gradingPolicies?, discussionExpectations?, keyDates?, moduleCount?, additionalNotes? }
QuizStep           = { type: "persona" } | { type: "constraint" } | { type: "syllabus-upload" }
```

### Current Personas (4)

| ID | Name | Style |
|----|------|-------|
| the-architect | The Architect | Methodical, structured, foundations |
| the-coach | The Coach | Empathetic, supportive, individual potential |
| the-explorer | The Explorer | Discovery, experimentation, flexible |
| the-sage | The Sage | Analytical, intellectual rigor, mastery |

### Environment Variables

```
ANTHROPIC_API_KEY              — Claude (persona blurb + syllabus agent)
GOOGLE_GENERATIVE_AI_API_KEY   — Gemini (settings chat assistant)
```

---

## What Was Built (Completed)

1. **Web-first quiz UI** — Refactored from chat-only to card-based multi-step quiz
2. **Persona scoring** — Weighted scoring across 5 questions mapping to 4 personas
3. **Persona reveal** — AI-streamed personalized blurb from Claude
4. **Settings page** — Courseware setting cards with dropdowns + LangGraph chat assistant
5. **Course constraint questions** — Timeline and customization time questions
6. **Syllabus upload** — Optional drag-and-drop PDF/DOCX upload with dedicated Claude agent
7. **Recommendation engine** — Deterministic function: persona + constraints + syllabus → setting values

---

## Proposed Supabase Schema (Designed, NOT Implemented)

Based on `teacher-persona-agent.md`, the schema stores personas, characters (fictional teachers with voice profiles), quiz results, and AI-generated message templates.

### Table: `personas`

Stores the 5 teaching persona definitions and their default platform settings.

```sql
CREATE TABLE personas (
  id TEXT PRIMARY KEY,                          -- 'explorer', 'nurturer', 'mentor', 'mastery_coach', 'strategist'
  name TEXT NOT NULL,
  description TEXT NOT NULL,                    -- Philosophy blurb
  result_message TEXT NOT NULL,                 -- Reveal message shown after quiz
  mastery_threshold INTEGER NOT NULL,           -- 70, 80, or 90
  message_personality TEXT NOT NULL,            -- 'coach' or 'advisor'
  send_auto_messages BOOLEAN NOT NULL DEFAULT true,
  enabled_auto_messages TEXT[] NOT NULL,        -- {'help_hints'} or {'help_hints','good_game'}
  show_study_plan_rollup BOOLEAN NOT NULL,
  graded_participation_enabled BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Table: `characters`

16 fictional teacher characters grouped by persona. Each has a `voice_profile` JSONB blob used by the template generation agent.

```sql
CREATE TABLE characters (
  id TEXT PRIMARY KEY,                          -- 'frizzle', 'uncle_iroh', etc.
  persona_id TEXT NOT NULL REFERENCES personas(id),
  name TEXT NOT NULL,
  work TEXT NOT NULL,                           -- Source franchise
  tagline TEXT NOT NULL,                        -- One-liner quote (max ~15 words)
  description TEXT NOT NULL,                    -- 2-sentence teaching energy
  voice_profile JSONB NOT NULL,                 -- { tone, sentence_style, vocabulary, signature_moves[], avoids[], example_voice }
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_characters_persona ON characters(persona_id);
```

**voice_profile structure:**
```json
{
  "tone": "enthusiastic, playful, encouraging",
  "sentence_style": "exclamatory, uses rhetorical questions",
  "vocabulary": "accessible, wonder-filled, action-oriented",
  "signature_moves": ["frames challenges as adventures", "celebrates mistakes as learning"],
  "avoids": ["stern warnings", "rigid directives", "deficit language"],
  "example_voice": "Looks like you hit a tricky spot — how exciting! ..."
}
```

### Table: `message_template_types`

Lookup table for automated message categories.

```sql
CREATE TABLE message_template_types (
  id TEXT PRIMARY KEY,                          -- 'help_hints', 'good_game'
  name TEXT NOT NULL,
  trigger_description TEXT NOT NULL,            -- When this message fires
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Table: `quiz_results`

Each completed quiz session — persona, character choice, applied settings, and full context.

```sql
CREATE TABLE quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id TEXT NOT NULL REFERENCES personas(id),
  character_id TEXT NOT NULL REFERENCES characters(id),
  applied_settings JSONB NOT NULL,             -- Snapshot of settings (may differ from defaults)
  quiz_answers JSONB,                           -- Raw persona question answers
  constraint_answers JSONB,                     -- Course constraint answers
  syllabus_data JSONB,                          -- Extracted syllabus data (nullable)
  persona_scores JSONB,                         -- { explorer: 5, nurturer: 3, ... }
  templates_generated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quiz_results_persona ON quiz_results(persona_id);
CREATE INDEX idx_quiz_results_character ON quiz_results(character_id);
```

### Table: `message_templates`

AI-generated message templates — 3 variants per type per quiz result, in the selected character's voice.

```sql
CREATE TABLE message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_result_id UUID NOT NULL REFERENCES quiz_results(id) ON DELETE CASCADE,
  character_id TEXT NOT NULL REFERENCES characters(id),
  template_type TEXT NOT NULL REFERENCES message_template_types(id),
  variant_index INTEGER NOT NULL,               -- 0, 1, 2
  content TEXT NOT NULL,                        -- Message text (may include {score}, {assessment_name}, etc.)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (quiz_result_id, template_type, variant_index)
);

CREATE INDEX idx_templates_quiz_result ON message_templates(quiz_result_id);
CREATE INDEX idx_templates_type ON message_templates(template_type);
```

### Relationships

```
personas (5 rows)
  ├── characters (16 rows, each with voice_profile JSONB)
  │     └── message_templates (3 variants per type per quiz result)
  │           └── message_template_types (2 rows: help_hints, good_game)
  └── quiz_results (one per completed quiz)
        ├── applied_settings JSONB
        ├── quiz_answers JSONB
        ├── constraint_answers JSONB
        └── syllabus_data JSONB
```

### Template Variables (interpolated at delivery time)

| Variable | Description |
|----------|-------------|
| `{score}` | Student's assessment score |
| `{assessment_name}` | Name of the assessment |
| `{missed_sections}` | Topics the student missed |
| `{mastery_threshold}` | Course mastery threshold |
| `{attempts}` | Number of attempts |

### Key Design Decisions

- **voice_profile as JSONB** — flexible schema evolution, read as a whole blob by template agent
- **applied_settings as JSONB** — captures what was actually applied (user may adjust after quiz)
- **No user/auth table** — app has no authentication; quiz_results is the top-level entity. Add user_id FK later if needed
- **Template variables stored raw** — `{score}` etc. kept as literal strings, interpolated at send time
- **Separate message_templates table** — normalized for independent querying, rotation, and regeneration

---

## Persona Alignment Gap

The current codebase has **4 personas** (Architect, Coach, Explorer, Sage) from the original quiz design. The `teacher-persona-agent.md` defines **5 personas** (Explorer, Nurturer, Mentor, Mastery Coach, Strategist) with different scoring logic and settings mappings.

**Decision needed:** Align the quiz to use the 5 personas from the agent doc, or keep the existing 4 and map them to the character pool. The 5-persona model is more nuanced and directly maps to the platform settings described in the agent doc.

If aligning to 5 personas:
- Replace `lib/data/personas.ts` content
- Rewrite `lib/data/quiz-questions.ts` to use the 4 philosophy questions from the agent doc
- Rewrite `lib/quiz-scoring.ts` to use the deterministic decision tree instead of weighted scoring
- Update `lib/recommendation-engine.ts` for the new persona IDs and settings
- Update `lib/data/courseware-settings.ts` to match the platform settings (mastery_threshold, message_personality, etc.)

---

## Future Tasks (Not Started)

### Phase 1: Supabase Integration

1. **Set up Supabase project** — Create project, get connection string
2. **Install Supabase client** — `pnpm add @supabase/supabase-js`
3. **Create migration files** — SQL for all 5 tables + seed data (personas, characters, template types)
4. **Add Supabase client lib** — `lib/supabase.ts` with server/client helpers
5. **Add environment variables** — `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_ANON_KEY`

### Phase 2: Persona & Character Alignment

6. **Align to 5 personas** — Replace 4 personas with Explorer, Nurturer, Mentor, Mastery Coach, Strategist
7. **Rewrite quiz questions** — 4 philosophy questions from agent doc (mastery philosophy, communication tone, classroom structure, automated messaging)
8. **Rewrite scoring logic** — Deterministic decision tree instead of weighted scoring
9. **Seed 16 characters** — All characters from the agent doc with full voice profiles
10. **Update recommendation engine** — Map new persona IDs to platform settings

### Phase 3: Character Selection Flow

11. **Add character selection step** — New quiz step after persona reveal (or on results page)
12. **Create character card component** — Name, work, tagline, description, select button
13. **Fetch characters by persona from Supabase** — API route or direct client query
14. **Store selected character in quiz context** — Add `characterId` to context + localStorage
15. **Update quiz_results write** — Save full result to Supabase on completion

### Phase 4: Message Template Generation Agent

16. **Create template generation agent** — New LangGraph ReAct agent (Claude) that:
    - Reads character's voice_profile from Supabase
    - Reads enabled message template types for the persona
    - Generates 3 variants per enabled type using the voice profile
    - Writes generated templates to Supabase `message_templates` table
17. **Create agent tools** — `fetch_character_voice`, `fetch_template_types`, `save_message_templates`
18. **Create API route** — `POST /api/templates` triggers generation after character selection
19. **Add generation status UI** — Show template generation progress on results/settings page

### Phase 5: Templates in Settings

20. **Display generated templates** — Show message templates on settings page grouped by type
21. **Allow template regeneration** — Button to regenerate templates with same character voice
22. **Include templates in chat context** — Settings chat agent aware of generated templates
23. **Export/apply templates** — Final output format for the courseware platform API

### Phase 6: Polish

24. **Wire all context to Supabase** — Replace localStorage-only persistence with DB writes
25. **Error handling** — Graceful fallbacks for Supabase connection failures
26. **Update README** — Document Supabase setup, new flow, new env vars

---

## Reference Document

The full character pool, voice profiles, scoring logic, and template generation prompts are in:
**`.context/teacher-persona-agent.md`**

This is the source of truth for personas, characters, settings mappings, and message template generation logic.

---

## Known Technical Notes

- **pdf-parse v2** uses class-based API: `new PDFParse({ data })` → `.getText()` → `.destroy()`
- **mammoth** has no TypeScript types; use `require("mammoth") as { extractRawText: ... }`
- **AI SDK v6 useChat** — `body` is passed per-message via `sendMessage({ text }, { body })`, not in hook options
- **LangGraph agents use lazy init** — avoids build-time API key errors (`getSyllabusGraph()`, `getCoursewareGraph()`)
- **serverExternalPackages** in next.config.ts — required for @langchain/core, @langchain/langgraph, pdf-parse, mammoth
