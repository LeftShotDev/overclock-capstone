import { createUIMessageStreamResponse, type UIMessage } from "ai";
import { toBaseMessages, toUIMessageStream } from "@ai-sdk/langchain";
import { HumanMessage } from "@langchain/core/messages";
import { getCoursewareGraph } from "@/lib/agents";
import type { ConstraintAnswer, SyllabusData } from "@/lib/types";

export const maxDuration = 60;

export async function POST(req: Request) {
  const {
    messages,
    personaId,
    constraintAnswers,
    syllabusData,
  }: {
    messages: UIMessage[];
    personaId?: string;
    constraintAnswers?: ConstraintAnswer[];
    syllabusData?: SyllabusData | null;
  } = await req.json();

  const graph = getCoursewareGraph();
  const langchainMessages = await toBaseMessages(messages);

  // Build context string
  let context = "";
  if (personaId) {
    context += `The user's teaching persona is "${personaId}".`;
  }
  if (constraintAnswers?.length) {
    const constraints = constraintAnswers
      .map((a) => `${a.constraintKey}: ${a.selectedValue}`)
      .join(", ");
    context += ` Course constraints: ${constraints}.`;
  }
  if (syllabusData) {
    const parts: string[] = [];
    if (syllabusData.courseDuration) parts.push(`Duration: ${syllabusData.courseDuration}`);
    if (syllabusData.moduleCount) parts.push(`${syllabusData.moduleCount} modules`);
    if (syllabusData.assignmentTypes?.length)
      parts.push(`Assignments: ${syllabusData.assignmentTypes.join(", ")}`);
    if (syllabusData.gradingPolicies) parts.push(`Grading: ${syllabusData.gradingPolicies}`);
    if (syllabusData.discussionExpectations)
      parts.push(`Discussion: ${syllabusData.discussionExpectations}`);
    if (parts.length) {
      context += ` Syllabus analysis: ${parts.join("; ")}.`;
    }
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
