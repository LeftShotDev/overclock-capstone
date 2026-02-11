# Teaching Persona Quiz

A multi-agent AI application that helps college instructors discover their teaching persona through a BuzzFeed-style quiz, then walks them through personalized courseware settings.

## How It Works

The app runs a three-phase conversational flow, each handled by a specialized AI agent:

1. **Quiz** — An engaging personality quiz asks instructors about their teaching style, classroom preferences, and values
2. **Persona Reveal** — Quiz results are scored and the instructor's teaching persona is revealed (The Architect, The Coach, The Explorer, or The Sage)
3. **Courseware Walkthrough** — The assigned persona guides the instructor through courseware settings, recommending configurations that match their style

## Architecture

```
Next.js Frontend (Vercel AI SDK — useChat, streaming)
        │
   POST /api/chat
        │
  LangGraph.js Supervisor (routes between agents)
        │
  ┌─────┼─────────┐
  │     │         │
Quiz  Persona  Courseware
Agent  Agent    Agent
```

- **Supervisor** (OpenAI GPT-4o) — orchestrates the flow and delegates to the right agent
- **Quiz Agent** (OpenAI GPT-4o-mini) — manages the quiz, presents questions, tracks answers
- **Persona Agent** (Anthropic Claude) — delivers a dramatic persona reveal
- **Courseware Agent** (Google Gemini) — walks through settings in-character as the persona

The frontend uses the Vercel AI SDK `useChat` hook for real-time streaming. The `@ai-sdk/langchain` adapter bridges AI SDK's streaming protocol with LangGraph's agent output.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Agent Orchestration**: LangGraph.js with `@langchain/langgraph-supervisor`
- **Frontend Streaming**: Vercel AI SDK v6
- **LLM Providers**: OpenAI, Anthropic, Google Gemini
- **UI**: Tailwind CSS v4, shadcn/ui
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

Open [http://localhost:3000](http://localhost:3000) and type anything to start the quiz.

### Required Environment Variables

| Variable | Provider |
|---|---|
| `OPENAI_API_KEY` | OpenAI (supervisor + quiz agent) |
| `ANTHROPIC_API_KEY` | Anthropic (persona agent) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google (courseware agent) |

## Project Structure

```
app/
  api/chat/route.ts       → API route bridging AI SDK ↔ LangGraph
  page.tsx                 → Main page rendering the chat UI
components/
  chat.tsx                 → Chat container (useChat hook, message list)
  chat-message.tsx         → Message bubble component
  chat-input.tsx           → Input form with send button
  ui/                      → shadcn/ui primitives
lib/
  types.ts                 → Shared Zod schemas and TypeScript types
  agents/
    supervisor.ts          → Supervisor graph (lazy-initialized)
    quiz-agent.ts          → Quiz flow agent
    persona-agent.ts       → Persona reveal agent
    courseware-agent.ts     → Courseware walkthrough agent
    tools/
      quiz-tools.ts        → Quiz questions + scoring logic
      persona-tools.ts     → Persona definitions + lookup
      courseware-tools.ts   → Mock courseware settings API
```

## Deployment

The app is configured for Vercel deployment with no additional setup. Push to GitHub and connect the repo in Vercel. Add the three API key environment variables in your Vercel project settings.

## Customization

All content is isolated in the `lib/agents/tools/` directory:

- **Quiz questions** — Edit `quiz-tools.ts` to change questions, options, and persona weight scoring
- **Personas** — Edit `persona-tools.ts` to add/modify teaching personas
- **Courseware settings** — Edit `courseware-tools.ts` to match your actual courseware API
- **Agent behavior** — Each agent's system prompt is in its own file under `lib/agents/`
