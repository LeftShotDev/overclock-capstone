# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Both apps (quiz :3000, admin :3001)
pnpm dev:quiz     # Quiz app only (localhost:3000)
pnpm dev:admin    # Admin app only (localhost:3001)
pnpm build        # Production build — both apps (use to verify before committing)
pnpm build:quiz   # Build quiz app only
pnpm build:admin  # Build admin app only
pnpm lint         # ESLint — all workspace packages
```

No test framework is configured. Use `pnpm build` as the primary verification step.

## Monorepo Structure

pnpm workspace with 3 packages:

```
capstone/
├── apps/quiz/          # Main quiz app (Next.js 16, port 3000)
├── apps/admin/         # Admin panel (Next.js 16, port 3001)
├── packages/shared/    # Shared types + Supabase client
└── supabase/           # Database migrations (shared)
```

- `packages/shared` (`@capstone/shared`) — Zod schemas, TypeScript types, `getSupabase()` singleton
- Both apps depend on `@capstone/shared` via `workspace:*`
- Quiz app's `lib/types.ts` and `lib/supabase.ts` re-export from `@capstone/shared`

## Environment Variables

### Quiz App (`apps/quiz/.env.local`)
```
ANTHROPIC_API_KEY              # Claude — persona blurb + syllabus agent + template generation
GOOGLE_GENERATIVE_AI_API_KEY   # Gemini — settings chat assistant
NEXT_PUBLIC_SUPABASE_URL       # Supabase project URL (optional — app works without)
NEXT_PUBLIC_SUPABASE_ANON_KEY  # Supabase anon key (optional)
```

### Admin App (`apps/admin/.env.local`)
```
ANTHROPIC_API_KEY              # Claude — AI question generation + character suggestion agent
NEXT_PUBLIC_SUPABASE_URL       # Same as quiz app
NEXT_PUBLIC_SUPABASE_ANON_KEY  # Same as quiz app
SUPABASE_SERVICE_ROLE_KEY      # Server-side only — bypasses RLS for admin writes
SERPER_API_KEY                 # Serper.dev — character image search (optional)
```

## Architecture

### Quiz App (`apps/quiz/`)

Next.js 16 App Router with sequential page flow: `/quiz` → `/results` → `/settings`.

**Data Flow**: Quiz state lives in React Context (`lib/quiz-context.tsx`) backed by localStorage. The `QuizProvider` wraps the app in `layout.tsx`. All pages read from `useQuiz()`. The context uses a `hydrated` flag to prevent SSR/client mismatch.

**Quiz Questions**: Fetched from Supabase `quiz_questions` table on mount, with static file fallback (`lib/data/quiz-questions.ts`, `lib/data/constraint-questions.ts`).

**Access Code Gate**: Landing page checks for active access codes in Supabase. If codes exist, users must enter a valid code before starting the quiz. If no codes exist, quiz is open (backward compatible).

**Quiz Step System**: Discriminated union type `QuizStep` with three types: `"persona"`, `"constraint"`, `"syllabus-upload"`. Steps are built dynamically from DB questions + static syllabus step.

**Scoring**: Deterministic decision tree in `lib/quiz-scoring.ts`. Uses hardcoded question IDs (`mastery-philosophy`, `communication-tone`, `classroom-structure`). Admin-created questions are informational only — they don't affect scoring.

### Admin App (`apps/admin/`)

Next.js 16 App Router with Supabase Auth (email/password). Protected by middleware — redirects to `/login` if not authenticated.

**Server Actions**: All CRUD operations in `lib/actions.ts` use `createSupabaseServiceClient()` (service role key, bypasses RLS).

**Pages** (all under `/onboarding/`):
- `/quizzes` — CRUD quizzes with custom settings schemas, generate or add questions per quiz
- `/questions` — CRUD for quiz questions (persona + constraint), reorder, toggle active
- `/personas` — Edit persona settings and character voice profiles
- `/characters` — AI wizard for character creation, manage voice profiles, image search with crop & storage
- `/access-codes` — Generate/revoke access codes for gating quiz entry

**Character Image Pipeline**: `ImageSearch` component (`components/image-search.tsx`) has a three-phase flow: search (Serper.dev via `POST /api/find-image`) → preview → crop & save (`POST /api/crop-image` — downloads image, center-crops to 512x512 WebP via `sharp`, uploads to Supabase Storage `Characters` bucket).

### AI / Agent Architecture

Two LLM providers with different roles:
- **Claude** (via `@ai-sdk/anthropic` and `@langchain/anthropic`) — persona blurb streaming, syllabus analysis agent, template generation
- **Gemini** (via `@langchain/google-genai`) — settings chat agent

LangGraph agents (`lib/agents/`) use **lazy singleton initialization** in `lib/agents/index.ts`. Always access via `getCoursewareGraph()` / `getSyllabusGraph()`.

### AI SDK v6 Patterns

- `useChat()` takes no `body` option. Pass body per-message: `sendMessage({ text }, { body })`
- Streaming responses use `createUIMessageStreamResponse` + `toUIMessageStream` for LangGraph → Vercel AI SDK bridging
- One-shot streaming uses `streamText` from `ai` package directly

### Supabase (Database Layer)

Optional integration with graceful fallback to static data.

- **Shared client**: `packages/shared/src/supabase.ts` — lazy singleton `getSupabase()`, returns `null` if env vars missing
- **Quiz queries**: `apps/quiz/lib/supabase-queries.ts` — fetchPersonas, fetchCharactersByPersona, fetchQuizQuestions, fetchConstraintQuestions, fetchActiveAccessCodes, validateAccessCode, writeQuizResult, writeMessageTemplates
- **Admin actions**: `apps/admin/lib/actions.ts` — full CRUD via service role client
- **Storage**: `Characters` bucket in Supabase Storage (public read, service role write). Created by `009_character_images_bucket.sql`.
- **Schema**: 9 migrations in `supabase/migrations/` — core schema, seeds, admin tables, quizzes, character demographics, character images, and storage bucket

### Persona Model (5 Personas)

Explorer, Nurturer, Mentor, Mastery Coach, Strategist — defined in `lib/data/personas.ts` (static fallback), `supabase/migrations/002_seed.sql` (database source), and manageable via admin panel. Each persona maps to 6 platform settings.

### next.config.ts

**Quiz App**: `serverExternalPackages` must include `@langchain/core`, `@langchain/langgraph`, `pdf-parse`, and `mammoth`.

**Admin App**: `serverExternalPackages` must include `@langchain/core`, `@langchain/langgraph`, and `sharp`.

## Key Conventions

- All data types use Zod schemas in `packages/shared/src/types.ts` with inferred TypeScript types
- Static data (questions, personas, settings) lives in `apps/quiz/lib/data/`
- UI primitives are shadcn/ui in `components/ui/`; app components are in `components/`
- Path alias: `@/*` maps to each app's root
- Supabase columns use `snake_case`; TypeScript uses `camelCase`
- Admin pages that fetch data must use `export const dynamic = "force-dynamic"` to prevent build-time prerender failures

## Context Files

- `.context/progress.md` — Project progress and phased future task list
- `.context/teacher-persona-agent.md` — Source of truth for personas (5), characters (16 with voice profiles), scoring logic, settings mappings, and message template generation prompts
