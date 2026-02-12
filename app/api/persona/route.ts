import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { PERSONAS } from "@/lib/data/personas";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { personaId, scores } = await req.json();

  const persona = PERSONAS[personaId] || PERSONAS["the-architect"];

  const result = streamText({
    model: anthropic("claude-sonnet-4-5-20250929"),
    prompt: `You are revealing a teaching persona quiz result. The user got "${persona.name}".

Persona details:
- Description: ${persona.description}
- Traits: ${persona.traits.join(", ")}
- Communication style: ${persona.communicationStyle}

Their score breakdown: ${JSON.stringify(scores)}

Write a personalized 2-3 paragraph blurb that:
1. Celebrates their result with BuzzFeed-results-page energy
2. Describes what this persona means for their teaching style
3. Makes them feel seen and validated as an educator

Keep it warm, affirming, and fun. No more than 150 words. Do not include a heading or the persona name — the UI already shows that.`,
  });

  return result.toTextStreamResponse();
}
