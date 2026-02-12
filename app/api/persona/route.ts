import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { PERSONAS } from "@/lib/data/personas";
import type { ConstraintAnswer, SyllabusData } from "@/lib/types";

export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    personaId,
    constraintAnswers,
    syllabusData,
  }: {
    personaId: string;
    constraintAnswers?: ConstraintAnswer[];
    syllabusData?: SyllabusData | null;
  } = await req.json();

  const persona = PERSONAS[personaId] || PERSONAS["mentor"];

  let contextSection = "";
  if (constraintAnswers?.length) {
    const constraints = constraintAnswers
      .map((a) => `${a.constraintKey}: ${a.selectedValue}`)
      .join(", ");
    contextSection += `\nCourse constraints: ${constraints}`;
  }
  if (syllabusData) {
    const parts: string[] = [];
    if (syllabusData.courseDuration) parts.push(`Duration: ${syllabusData.courseDuration}`);
    if (syllabusData.moduleCount) parts.push(`${syllabusData.moduleCount} modules`);
    if (syllabusData.assignmentTypes?.length)
      parts.push(`Assignments: ${syllabusData.assignmentTypes.join(", ")}`);
    if (parts.length) {
      contextSection += `\nSyllabus highlights: ${parts.join("; ")}`;
    }
  }

  const result = streamText({
    model: anthropic("claude-sonnet-4-5-20250929"),
    prompt: `You are revealing a teaching persona quiz result. The user got "${persona.name}".

Persona details:
- Description: ${persona.description}
- Result message: ${persona.resultMessage}
- Key settings: mastery threshold ${persona.masteryThreshold}%, ${persona.messagePersonality} personality, ${persona.showStudyPlanRollup ? "study plan visible" : "no study plan rollup"}, ${persona.gradedParticipationEnabled ? "graded participation" : "ungraded participation"}${contextSection}

Write a personalized 2-3 paragraph blurb that:
1. Celebrates their result with BuzzFeed-results-page energy
2. Describes what this persona means for their teaching style
3. Makes them feel seen and validated as an educator
${contextSection ? "4. If course context is available, briefly connect the persona to their specific course situation" : ""}

Keep it warm, affirming, and fun. No more than 150 words. Do not include a heading or the persona name — the UI already shows that.`,
  });

  return result.toTextStreamResponse();
}
