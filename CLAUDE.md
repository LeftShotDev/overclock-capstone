# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Dev server with Turbopack (localhost:3000)
pnpm build        # Production build (use to verify before committing)
pnpm lint         # ESLint (next/core-web-vitals + next/typescript)
```

No test framework is configured. Use `pnpm build` as the primary verification step.

## Environment Variables

```
ANTHROPIC_API_KEY              # Claude — persona blurb + syllabus agent
GOOGLE_GENERATIVE_AI_API_KEY   # Gemini — settings chat assistant
NEXT_PUBLIC_SUPABASE_URL       # Supabase project URL (optional — app works without)
NEXT_PUBLIC_SUPABASE_ANON_KEY  # Supabase anon key (optional)
```

Copy `.env.example` to `.env.local` and fill in keys.

## Architecture

Next.js 16 App Router app with a sequential page flow: `/quiz` → `/results` → `/settings`.

### Data Flow

Quiz state lives in React Context (`lib/quiz-context.tsx`) backed by localStorage. The `QuizProvider` wraps the app in `layout.tsx`. All pages read from `useQuiz()`. The context uses a `hydrated` flag to prevent SSR/client mismatch — guard renders with `if (!hydrated)`.

When adding new fields to the context, provide backward-compatible defaults in the localStorage hydration block (existing users may have old shapes stored).

### Quiz Step System

The quiz uses a discriminated union type `QuizStep` (`lib/types.ts`) and an ordered `QUIZ_STEPS` array (`lib/data/quiz-steps.ts`). The quiz page iterates via `currentStepIndex` stored in context. Three step types exist: `"persona"`, `"constraint"`, `"syllabus-upload"` — each renders a different component. To add a new step type, extend the union in `types.ts`, add it to `quiz-steps.ts`, and add a rendering branch in `quiz/page.tsx`.

### AI / Agent Architecture

Two LLM providers with different roles:
- **Claude** (via `@ai-sdk/anthropic` and `@langchain/anthropic`) — persona blurb streaming (`api/persona/route.ts`) + syllabus analysis agent
- **Gemini** (via `@langchain/google-genai`) — settings chat agent (`api/chat/route.ts`)

LangGraph agents (`lib/agents/`) use **lazy singleton initialization** in `lib/agents/index.ts` — this prevents build-time failures when API keys aren't available. Always access agents through `getCoursewareGraph()` / `getSyllabusGraph()`, never import the create functions directly in route handlers.

Agent tools live in `lib/agents/tools/`. Each tool receives raw data and returns JSON strings.

### AI SDK v6 Patterns

- `useChat()` takes no `body` option. Pass body per-message: `sendMessage({ text }, { body })`
- Streaming responses use `createUIMessageStreamResponse` + `toUIMessageStream` for LangGraph → Vercel AI SDK bridging
- One-shot streaming uses `streamText` from `ai` package directly

### Supabase (Database Layer)

Optional Supabase integration with graceful fallback to static data when env vars are missing.

- **Client**: `lib/supabase.ts` — lazy singleton via `getSupabase()`, returns `null` if env vars missing
- **Queries**: `lib/supabase-queries.ts` — `fetchPersonas()`, `fetchCharactersByPersona()`, `writeQuizResult()`
- **Schema**: `supabase/migrations/001_schema.sql` — 5 tables (personas, characters, message_template_types, quiz_results, message_templates)
- **Seed**: `supabase/migrations/002_seed.sql` — 5 personas, 16 characters, 2 template types

Run migrations via Supabase Dashboard SQL editor or `supabase db push`.

### Persona Model (5 Personas)

Explorer, Nurturer, Mentor, Mastery Coach, Strategist — defined in `lib/data/personas.ts` (static fallback) and `supabase/migrations/002_seed.sql` (database source). Each persona maps to 6 platform settings. Quiz scoring is a **deterministic decision tree** in `lib/quiz-scoring.ts` (not weighted).

### Character Selection

After persona reveal, users pick a fictional teacher character from their persona's pool (16 characters across 5 personas). Characters are fetched from Supabase; if unavailable, the section is hidden. Selected `characterId` is stored in quiz context and passed to the chat API.

### Recommendation Engine

`lib/recommendation-engine.ts` is a pure deterministic function (no LLM call) that computes setting recommendations by directly reading persona settings. It runs on every settings page load.

### next.config.ts

`serverExternalPackages` must include `@langchain/core`, `@langchain/langgraph`, `pdf-parse`, and `mammoth`. Add any new LangChain or native-dependency packages here.

### File Parsing

- **pdf-parse v2**: Class-based API — `new PDFParse({ data: new Uint8Array(buf) })` → `.getText()` → `.destroy()`
- **mammoth**: No TS types — use `require("mammoth") as { extractRawText: ... }`

## Key Conventions

- All data types use Zod schemas in `lib/types.ts` with inferred TypeScript types
- Static data (questions, personas, settings) lives in `lib/data/`
- UI primitives are shadcn/ui in `components/ui/`; app components are in `components/`
- Path alias: `@/*` maps to project root
- Setting types: `select` (dropdown), `toggle` (switch), `multi-select` (checkboxes)
- Supabase columns use `snake_case`; TypeScript uses `camelCase` — mapping happens in `lib/supabase-queries.ts`

## Context Files

- `.context/progress.md` — Project progress, proposed Supabase schema, and phased future task list
- `.context/teacher-persona-agent.md` — Source of truth for personas (5), characters (16 with voice profiles), scoring logic, settings mappings, and message template generation prompts
