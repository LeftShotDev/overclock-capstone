# Capstone Video Script — Teaching Persona Quiz

**Target length:** 7–10 minutes
**Format:** Screen recording with voiceover. Show the app, code, and architecture diagram as you talk.

---

## INTRO (0:00–0:45)

> Every courseware platform has dozens of settings — mastery thresholds, automated messaging, grading participation — and every instructor has to configure them from scratch. Most just leave the defaults.
>
> I built the Teaching Persona Quiz to solve that. It's a BuzzFeed-style personality quiz that matches college instructors to a teaching persona, pairs them with a fictional teacher character, and then pre-configures all their courseware settings based on who they are as a teacher — not what they Googled in a help doc.
>
> There are two apps: the quiz that instructors take, and an admin panel that manages all the content behind it. Both are powered by AI agents that do real work — not just chat.
>
> Let me walk you through what I built.

**[SHOW: Landing page of the quiz app]**

---

## THE QUIZ FLOW (0:45–2:30)

### Landing Page & Access Codes

> The landing page checks Supabase for active access codes. If codes exist in the system, the instructor has to enter one before they can start — this lets admins control who takes the quiz. If no codes exist, the quiz is open to everyone. It's backward compatible.

**[SHOW: Access code input, then start quiz]**

### Quiz Questions

> The quiz is a multi-step flow — one question per screen. There are three types of steps.
>
> First, four persona questions. These determine your teaching philosophy. Things like "What's your mastery threshold?" and "How do you handle a struggling student?" Each answer maps to a branch in a deterministic decision tree — not weighted scoring. I rewrote the scoring engine from a weighted model to a decision tree because the five personas map cleanly to specific setting combinations, and I wanted the result to be explainable, not a black box.

**[SHOW: Click through 2-3 persona questions, show the auto-advance on card selection]**

> Then two constraint questions about course logistics — when does your course start, how much setup time do you have. These don't affect your persona, but they feed into the recommendation engine and become context for the AI chat assistant later.
>
> Finally, an optional syllabus upload step. You can drag and drop a PDF or Word doc, and a dedicated Claude agent — a LangGraph ReAct agent with three extraction tools — parses it into structured data: course duration, assignment types, grading policies, key dates. That data travels with you through the rest of the app.

**[SHOW: Syllabus upload step, drag a file, show the extraction status]**

---

## THE RESULTS PAGE (2:30–4:00)

> After the quiz, you land on the results page. This is where it gets interesting.
>
> The scoring engine determines two things: your persona — one of five: Explorer, Nurturer, Mentor, Mastery Coach, or Strategist — and your character match. There are 16 fictional teacher characters, from Ms. Frizzle to Professor McGonagall to Coach Carter. Each character has an energy level and communication style. The quiz scores your answers against those dimensions and picks the best match.

**[SHOW: Results page reveal with GSAP animations — the character card appearing, the persona section cascading in]**

> The reveal uses GSAP animations — a cascade sequence where each element fades and scales in with staggered delays. There's a reduced-motion check so it snaps to final state if the user has that accessibility preference set.
>
> While the character card appears, Claude is streaming a personalized blurb — two to three paragraphs about why you matched this character, written to your specific quiz answers and syllabus data.
>
> And here's a coordination pattern I'm proud of: the moment a character is selected, a parallel useEffect fires off template generation in the background. Claude takes the character's voice profile — a JSON blob with tone, sentence style, vocabulary, signature moves, things to avoid — and generates three variants of each message template in that character's voice. By the time you click "Continue to Settings," the templates are already done. No loading spinner on the next page.

**[SHOW: Streaming blurb appearing token by token, then scroll to show alternative characters grid]**

> You can also browse alternative characters from your persona and switch your selection. The template generation re-fires when you do.

---

## THE SETTINGS PAGE (4:00–5:00)

> The settings page shows six courseware setting cards, each pre-populated with a recommended value computed from your persona. Mastery threshold, message personality, auto messages, message types, study plan rollup, graded participation. You can adjust any of them.
>
> There's also a message template section showing the AI-generated templates in your character's voice — with a regenerate button if you want fresh variants.
>
> On the right side is a full-height chat panel. This is a Gemini-powered LangGraph agent that stays in character as your persona. It has two tools: read the current settings state and update a setting. But the key thing is the context enrichment — the agent receives your syllabus data and constraint answers in its system prompt, so when you ask "Should I turn on graded participation?", it can reference your specific course structure, not give generic advice.

**[SHOW: Settings page with cards + chat panel, send a message, show the agent responding in character]**

---

## THE ADMIN PANEL (5:00–6:45)

> The admin panel is the second Next.js app in the monorepo. It's behind Supabase Auth — email and password.

**[SHOW: Login, then the admin shell with sidebar navigation]**

### Quiz & Question Management

> Admins can create quizzes with custom settings schemas, then generate questions using Claude. The AI reads the quiz's settings schema and produces scenario-based questions as drafts for review.
>
> The questions page lets you manage global quiz questions — create, edit, reorder, toggle active or inactive.

**[SHOW: Quiz list, edit a quiz, generate questions, then questions page with reorder]**

### The Character Wizard

> The character creation flow is the most complex AI feature in the project. It's a four-step wizard powered by a supervised multi-turn LangGraph agent with four tools.
>
> Step one, you pick a persona. Step two, the agent generates five to eight character suggestions — names and works, avoiding characters already in the pool. Step three is where it gets sophisticated: when you select a suggestion, the agent makes two tool calls in a single invocation — it generates the full profile AND searches for representative images through Serper.dev. You get back a complete character profile plus six image candidates in one round trip. Step four, you review and edit everything, pick an image, and the agent downloads it, center-crops to 512 by 512 WebP using sharp, and uploads it to Supabase Storage.
>
> If the full wizard endpoint fails, it gracefully falls back to a simpler step-based agent. Defense in depth.

**[SHOW: Walk through the character wizard — persona select, suggestions appearing, profile + images loading, image crop and save]**

### The Admin Chat Agent

> On every quiz edit page, there's an inline chat agent — Claude with 14 tools. It can read and write across all five admin entity types: quizzes, questions, personas, characters, and access codes. It receives the current quiz as context so you can say "add a question about study habits to this quiz" and it resolves "this quiz" correctly. No delete tools — that's a deliberate safety choice.

**[SHOW: Open a quiz edit page, use the chat agent to create a question or update a setting]**

---

## ARCHITECTURE & TECHNICAL DECISIONS (6:45–8:15)

> Let me zoom out to the architecture.

**[SHOW: The Mermaid architecture diagram from the README]**

> This is a pnpm monorepo with three packages: the quiz app, the admin app, and a shared package with Zod schemas and the Supabase client. Both apps run on Next.js 16 with React 19.
>
> There are eight AI integration points total — five LangGraph ReAct agents and three direct model calls — using two LLM providers. Claude handles everything that needs precision: syllabus analysis, persona blurbs, template generation, question generation, character creation, and the admin chat agent. Gemini handles the settings chat because it's a conversational use case where speed matters more than precision.
>
> Four multi-agent coordination patterns tie it together:
>
> One — context enrichment. The syllabus agent's output flows into the courseware chat agent's system prompt.
>
> Two — supervised multi-turn. The character wizard makes multiple invocations of the same agent across steps, with the client orchestrating the conversation.
>
> Three — parallel fan-out. Template generation fires concurrently with the persona blurb on the results page.
>
> Four — the cross-section admin assistant. One agent with 14 tools that can operate across the entire admin surface from a single chat panel.
>
> On the database side, Supabase handles Postgres, auth, row-level security, and file storage. The quiz app uses the anon key and falls back gracefully to static TypeScript files if Supabase is down. The admin uses a service role key that bypasses RLS. Nine migrations cover seven tables, seed data, and a storage bucket.

**[SHOW: Quick scroll through supabase/migrations/ in the file tree]**

> One more thing I want to highlight: Vercel AI SDK v6. It changed the `useChat` API — `body` is now passed per-message, not in the hook options. And for LangGraph streaming, I'm bridging `streamEvents()` into `createUIMessageStreamResponse` with `toUIMessageStream`. That's how you get LangGraph ReAct agents streaming into a React chat component.

---

## WRAP-UP (8:15–8:45)

> To sum up: two Next.js 16 apps in a monorepo, five LangGraph agents, 16 fictional teacher characters with full voice profiles, a deterministic scoring engine, GSAP animations, an image processing pipeline, Supabase with row-level security, and four multi-agent coordination patterns connecting it all together.
>
> The core idea is simple — help teachers set up their courseware by understanding who they are. The engineering challenge was making AI do useful, coordinated work across the entire system, not just answer questions in a chat box.
>
> Thanks for watching.

---

## PRODUCTION NOTES

- **Total runtime estimate:** ~8:30 at a natural speaking pace
- **Screen recordings needed:**
  - Quiz flow: landing → quiz → results → settings (full walkthrough)
  - Admin: login → quizzes → questions → character wizard → admin chat
  - Code: architecture diagram, file tree, maybe a quick look at quiz-scoring.ts or a LangGraph agent file
- **Tip:** Record the quiz walkthrough first with a real syllabus PDF so the AI responses look genuine
- **Tip:** For the character wizard demo, pick a persona that has room for a new character
- **Tip:** Keep code flashes brief — 3-5 seconds max. The diagram carries the architecture story better than scrolling through files
