import { createUIMessageStreamResponse, type UIMessage } from "ai";
import { toBaseMessages, toUIMessageStream } from "@ai-sdk/langchain";
import { HumanMessage } from "@langchain/core/messages";
import { getCoursewareGraph } from "@/lib/agents";
import { PERSONAS } from "@/lib/data/personas";
import type { SyllabusData, ConstraintAnswer } from "@capstone/shared";

export const maxDuration = 60;

export async function POST(req: Request) {
  const {
    messages,
    personaId,
    characterId,
    syllabusData,
    constraintAnswers,
  }: {
    messages: UIMessage[];
    personaId?: string;
    characterId?: string | null;
    syllabusData?: SyllabusData | null;
    constraintAnswers?: ConstraintAnswer[];
  } = await req.json();

  const graph = getCoursewareGraph();
  const langchainMessages = await toBaseMessages(messages);

  // Build context string
  let context = "";
  if (personaId) {
    const persona = PERSONAS[personaId];
    if (persona) {
      context += `The user's teaching persona is "${persona.name}" (${personaId}).`;
      context += ` Their settings: mastery threshold ${persona.masteryThreshold}%, ${persona.messagePersonality} personality, auto messages ${persona.sendAutoMessages ? "on" : "off"}, enabled messages: ${persona.enabledAutoMessages.join(", ")}, study plan rollup ${persona.showStudyPlanRollup ? "visible" : "hidden"}, graded participation ${persona.gradedParticipationEnabled ? "enabled" : "disabled"}.`;
    }
  }
  if (characterId) {
    context += ` Selected character: ${characterId}.`;
  }

  // Syllabus-extracted course structure
  if (syllabusData) {
    const parts: string[] = [];
    if (syllabusData.courseDuration) parts.push(`duration: ${syllabusData.courseDuration}`);
    if (syllabusData.moduleCount) parts.push(`${syllabusData.moduleCount} modules`);
    if (syllabusData.assignmentTypes?.length) parts.push(`assignment types: ${syllabusData.assignmentTypes.join(", ")}`);
    if (syllabusData.gradingPolicies) parts.push(`grading: ${syllabusData.gradingPolicies}`);
    if (syllabusData.discussionExpectations) parts.push(`discussions: ${syllabusData.discussionExpectations}`);
    if (parts.length) {
      context += ` Course structure: ${parts.join("; ")}.`;
    }
  }

  // Constraint answers (course logistics from quiz)
  if (constraintAnswers?.length) {
    const constraintSummary = constraintAnswers
      .map((ca) => `${ca.constraintKey}: ${ca.selectedValue}`)
      .join("; ");
    context += ` Course constraints: ${constraintSummary}.`;
  }

  if (context) {
    langchainMessages.unshift(
      new HumanMessage(
        `[System context: ${context} Stay in character as this persona when responding. Use the course context to give specific, relevant advice about settings.]`
      )
    );
  }

  const stream = graph.streamEvents(
    { messages: langchainMessages },
    { version: "v2" },
  );

  return createUIMessageStreamResponse({
    stream: toUIMessageStream(stream),
  });
}
