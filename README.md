# Teaching Persona Quiz

A web application that helps college instructors discover their teaching persona through a BuzzFeed-style quiz, then guides them through personalized courseware settings.

## How It Works

The app has three pages that form a sequential flow:

1. **Quiz** (`/quiz`) — A multi-step quiz with one question per screen. Steps 1–5 are personality questions that determine the teaching persona. Steps 6–7 ask about course constraints (timeline, available customization time). Step 8 is an optional syllabus upload — a dedicated AI agent extracts course structure, assignments, grading policies, and key dates from the document.

2. **Persona Reveal** (`/results`) — A results page showing the instructor's teaching persona (The Architect, The Coach, The Explorer, or The Sage) with a designed persona card and an AI-generated personalized blurb streamed from Claude. If course constraints or syllabus data are available, the blurb references the instructor's specific situation.

3. **Settings** (`/settings`) — Courseware setting cards with dropdowns to change values, plus a chat panel where an AI assistant (in-character as the persona) explains settings and helps describe changes. Recommended values are computed dynamically from the combination of persona, course constraints, and syllabus data.

## Architecture

```
/quiz steps 1-5  → Persona questions (pure web form, no AI)
/quiz steps 6-7  → Constraint questions (pure web form, no AI)
/quiz step 8     → Syllabus upload (optional)
                   POST /api/syllabus → pdf-parse/mammoth + LangGraph syllabus agent (Claude)

/results         → Static persona card + streamed AI blurb
                   POST /api/persona → Claude (one-shot streamText)

/settings        → Setting cards with dynamic recommendations
                   (computed by lib/recommendation-engine.ts)
                 + Chat panel for Q&A
                   POST /api/chat → LangGraph courseware agent (Gemini)
```

**LLM usage:**
- **Anthropic Claude** — Syllabus analysis agent (LangGraph ReAct) + persona blurb (one-shot `streamText`)
- **Google Gemini** — LangGraph ReAct agent for the settings chat assistant

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **AI**: Vercel AI SDK v6, LangGraph.js
- **LLM Providers**: Anthropic (syllabus analysis, persona blurb), Google Gemini (settings chat)
- **UI**: Tailwind CSS v4, shadcn/ui
- **State**: React Context + localStorage (quiz answers, constraints, and syllabus data persist across pages)
- **File Parsing**: pdf-parse (PDF), mammoth (DOCX)
- **Validation**: Zod v4

## Getting Started

```bash
# Install dependencies
pnpm install

# Copy env file and add your API keys
cp .env.example .env.local

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and click "Start the Quiz."

### Required Environment Variables

| Variable | Used For |
|---|---|
| `ANTHROPIC_API_KEY` | Persona blurb generation + syllabus analysis agent |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Settings chat assistant |

## Project Structure

```
app/
  page.tsx                    → Landing page (start quiz or continue)
  quiz/page.tsx               → Multi-step quiz (persona, constraints, syllabus)
  results/page.tsx            → Persona reveal + AI blurb
  settings/page.tsx           → Setting cards + chat panel
  api/
    persona/route.ts          → One-shot Claude streamText endpoint
    chat/route.ts             → LangGraph courseware agent endpoint
    syllabus/route.ts         → Syllabus upload + analysis endpoint
components/
  quiz-option-card.tsx        → Clickable quiz option card
  constraint-question-step.tsx→ Constraint question renderer
  syllabus-upload-step.tsx    → Drag-and-drop syllabus upload with status
  persona-card.tsx            → Persona reveal card with traits
  setting-card.tsx            → Courseware setting with select dropdown
  chat.tsx                    → Configurable chat container (useChat)
  chat-message.tsx            → Message bubble component
  chat-input.tsx              → Input form with send button
  ui/                         → shadcn/ui primitives
lib/
  quiz-context.tsx            → React Context + localStorage for quiz state
  quiz-scoring.ts             → Pure persona scoring function
  recommendation-engine.ts    → Dynamic setting recommendations (persona + constraints + syllabus)
  types.ts                    → Shared Zod schemas and TypeScript types
  data/
    quiz-questions.ts         → Persona quiz questions + weights
    constraint-questions.ts   → Course constraint questions
    quiz-steps.ts             → Ordered quiz step sequence
    personas.ts               → Teaching persona definitions
    courseware-settings.ts     → Mock courseware settings
  agents/
    index.ts                  → Lazy-initialized graph exports
    courseware-agent.ts        → Gemini-powered settings assistant
    syllabus-analyzer.ts       → Claude-powered syllabus extraction agent
    tools/
      courseware-tools.ts      → LangChain tools for settings lookup/update
      syllabus-tools.ts        → LangChain tools for syllabus extraction
```

## Deployment

The app is configured for Vercel deployment with no additional setup. Push to GitHub, connect the repo in Vercel, and add your API key environment variables in the Vercel project settings.

## Customization

All content is in the `lib/data/` directory:

- **Quiz questions** — Edit `quiz-questions.ts` to change questions, options, and persona weight scoring
- **Constraint questions** — Edit `constraint-questions.ts` to add/modify course logistics questions
- **Personas** — Edit `personas.ts` to add/modify teaching personas
- **Courseware settings** — Edit `courseware-settings.ts` to match your actual courseware API
- **Recommendation rules** — Edit `lib/recommendation-engine.ts` to adjust how persona, constraints, and syllabus data influence setting recommendations
- **Settings chat behavior** — Edit the agent prompt in `lib/agents/courseware-agent.ts`
- **Syllabus extraction** — Edit the agent prompt in `lib/agents/syllabus-analyzer.ts`
