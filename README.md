# Teaching Persona Quiz

A web application that helps college instructors discover their teaching persona through a BuzzFeed-style quiz, then guides them through personalized courseware settings.

## How It Works

The app has three pages that form a sequential flow:

1. **Quiz** (`/quiz`) — A multi-step personality quiz with one question per screen. Instructors click through options about their teaching style, classroom preferences, and values. No AI involved — pure web form with client-side scoring.

2. **Persona Reveal** (`/results`) — A results page showing the instructor's teaching persona (The Architect, The Coach, The Explorer, or The Sage) with a designed persona card and an AI-generated personalized blurb streamed from Claude.

3. **Settings** (`/settings`) — Courseware setting cards with dropdowns to change values, plus a chat panel where an AI assistant (in-character as the persona) explains settings and helps describe changes.

## Architecture

```
/quiz          → Pure web form (no AI)
                 Client-side scoring via lib/quiz-scoring.ts

/results       → Static persona card + streamed AI blurb
                 POST /api/persona → Claude (one-shot streamText)

/settings      → Setting cards (direct manipulation)
               + Chat panel for Q&A
                 POST /api/chat → LangGraph courseware agent (Gemini)
```

**LLM usage is minimal by design:**
- **Anthropic Claude** — Single `streamText` call for the personalized persona blurb
- **Google Gemini** — LangGraph ReAct agent for the settings chat assistant

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **AI**: Vercel AI SDK v6, LangGraph.js (courseware agent only)
- **LLM Providers**: Anthropic (persona blurb), Google Gemini (settings chat)
- **UI**: Tailwind CSS v4, shadcn/ui
- **State**: React Context + localStorage (quiz answers persist across pages)
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
| `ANTHROPIC_API_KEY` | Persona blurb generation (results page) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Settings chat assistant |

## Project Structure

```
app/
  page.tsx                → Landing page (start quiz or continue)
  quiz/page.tsx           → Multi-step quiz form
  results/page.tsx        → Persona reveal + AI blurb
  settings/page.tsx       → Setting cards + chat panel
  api/
    persona/route.ts      → One-shot Claude streamText endpoint
    chat/route.ts         → LangGraph courseware agent endpoint
components/
  quiz-option-card.tsx    → Clickable quiz option
  persona-card.tsx        → Persona reveal card with traits
  setting-card.tsx        → Courseware setting with select dropdown
  chat.tsx                → Configurable chat container (useChat)
  chat-message.tsx        → Message bubble component
  chat-input.tsx          → Input form with send button
  ui/                     → shadcn/ui primitives
lib/
  quiz-context.tsx        → React Context + localStorage for quiz state
  quiz-scoring.ts         → Pure scoring function
  types.ts                → Shared Zod schemas and TypeScript types
  data/
    quiz-questions.ts     → Quiz question content + persona weights
    personas.ts           → Teaching persona definitions
    courseware-settings.ts → Mock courseware settings
  agents/
    index.ts              → Exports courseware graph (lazy-initialized)
    courseware-agent.ts    → Gemini-powered settings assistant
    tools/
      courseware-tools.ts  → LangChain tools for settings lookup/update
```

## Deployment

The app is configured for Vercel deployment with no additional setup. Push to GitHub, connect the repo in Vercel, and add your API key environment variables in the Vercel project settings.

## Customization

All content is in the `lib/data/` directory:

- **Quiz questions** — Edit `quiz-questions.ts` to change questions, options, and persona weight scoring
- **Personas** — Edit `personas.ts` to add/modify teaching personas
- **Courseware settings** — Edit `courseware-settings.ts` to match your actual courseware API
- **Settings chat behavior** — Edit the agent prompt in `lib/agents/courseware-agent.ts`
