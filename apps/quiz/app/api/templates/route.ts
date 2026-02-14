import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { PERSONAS } from "@/lib/data/personas";
import { BASE_TEMPLATES } from "@/lib/data/base-templates";
import {
  fetchCharacterById,
  writeMessageTemplates,
} from "@/lib/supabase-queries";

export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    personaId,
    characterId,
    quizResultId,
  }: {
    personaId: string;
    characterId: string;
    quizResultId?: string | null;
  } = await req.json();

  const persona = PERSONAS[personaId];
  if (!persona) {
    return Response.json({ error: "Unknown persona" }, { status: 400 });
  }

  const enabledTypes = persona.enabledAutoMessages;

  // Fetch character voice profile from Supabase
  const character = await fetchCharacterById(characterId);
  if (!character) {
    // Fallback: return base templates unmodified
    const fallbackTemplates = enabledTypes
      .filter((type) => BASE_TEMPLATES[type])
      .map((type) => ({
        templateType: type,
        variants: BASE_TEMPLATES[type].variants,
      }));
    return Response.json({ templates: fallbackTemplates });
  }

  const voiceProfileJson = JSON.stringify(character.voiceProfile, null, 2);
  const templates: { templateType: string; variants: string[] }[] = [];

  for (const templateType of enabledTypes) {
    const base = BASE_TEMPLATES[templateType];
    if (!base) continue;

    const prompt = `You are adapting automated student-facing messages for a learning platform. These messages are sent to students by the system on behalf of their instructor.

VOICE PROFILE:
${voiceProfileJson}

CONSTRAINTS:
- Messages must be 1-3 sentences. Students receive these on mobile.
- Never use the character's name or reference the fictional source. The voice is inspired by the character — it is not roleplay.
- Use second person ("you") addressing the student directly.
- Do not include greetings ("Hi!", "Hey there!") — these are system messages, not emails.
- Respect the voice_profile.avoids list strictly.
- You may include template variables: {score}, {assessment_name}, {missed_sections}, {mastery_threshold}, {attempts}. Use them if the voice profile is direct/analytical; use them sparingly or not at all if the voice is warm/encouraging.

MESSAGE TYPE: ${templateType}
TRIGGER: ${base.triggerDescription}

BASE TEMPLATES (adapt these to match the voice profile above):
1. ${base.variants[0]}
2. ${base.variants[1]}
3. ${base.variants[2]}

Rewrite each of the 3 base templates in the character's voice. Maintain the core intent and approximate length, but transform the tone, vocabulary, sentence style, and signature moves to match the voice profile.

Return ONLY a JSON array of 3 strings. No explanation, no numbering, no markdown. Example format:
["adapted variant 1", "adapted variant 2", "adapted variant 3"]`;

    try {
      const result = await generateText({
        model: anthropic("claude-sonnet-4-5-20250929"),
        prompt,
      });

      const parsed = JSON.parse(result.text.trim());
      if (
        Array.isArray(parsed) &&
        parsed.length === 3 &&
        parsed.every((v: unknown) => typeof v === "string")
      ) {
        templates.push({ templateType, variants: parsed });
      } else {
        templates.push({ templateType, variants: base.variants });
      }
    } catch {
      templates.push({ templateType, variants: base.variants });
    }
  }

  // Best-effort write to Supabase (fire-and-forget)
  if (quizResultId) {
    writeMessageTemplates({
      quizResultId,
      characterId,
      templates,
    });
  }

  return Response.json({ templates });
}
