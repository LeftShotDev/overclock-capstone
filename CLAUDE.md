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

### Recommendation Engine

`lib/recommendation-engine.ts` is a pure deterministic function (no LLM call) that computes setting recommendations from persona + constraints + syllabus data. It runs on every settings page load.

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

## Context Files

- `.context/progress.md` — Project progress, proposed Supabase schema, and phased future task list
- `.context/teacher-persona-agent.md` — Source of truth for personas (5), characters (16 with voice profiles), scoring logic, settings mappings, and message template generation prompts
