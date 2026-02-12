import { createUIMessageStreamResponse, type UIMessage } from "ai";
import { toBaseMessages, toUIMessageStream } from "@ai-sdk/langchain";
import { HumanMessage } from "@langchain/core/messages";
import { getCoursewareGraph } from "@/lib/agents";

export const maxDuration = 60;

export async function POST(req: Request) {
  const {
    messages,
    personaId,
  }: { messages: UIMessage[]; personaId?: string } = await req.json();

  const graph = getCoursewareGraph();
  const langchainMessages = await toBaseMessages(messages);

  // Prepend persona context if provided
  if (personaId) {
    langchainMessages.unshift(
      new HumanMessage(
        `[System context: The user's teaching persona is "${personaId}". Stay in character as this persona when responding.]`
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
