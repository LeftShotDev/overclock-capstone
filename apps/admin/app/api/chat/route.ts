import { createUIMessageStreamResponse, type UIMessage } from "ai";
import { toBaseMessages, toUIMessageStream } from "@ai-sdk/langchain";
import { HumanMessage } from "@langchain/core/messages";
import { getAdminChatGraph } from "@/lib/agents";

export const maxDuration = 60;

export async function POST(req: Request) {
  const {
    messages,
    quizId,
    quizName,
  }: {
    messages: UIMessage[];
    quizId: string;
    quizName: string;
  } = await req.json();

  const graph = getAdminChatGraph();
  const langchainMessages = await toBaseMessages(messages);

  langchainMessages.unshift(
    new HumanMessage(
      `[System context: The admin is currently editing quiz "${quizName}" (ID: ${quizId}). When the admin refers to "this quiz" or "the current quiz", use this ID.]`
    )
  );

  const stream = graph.streamEvents(
    { messages: langchainMessages },
    { version: "v2" },
  );

  return createUIMessageStreamResponse({
    stream: toUIMessageStream(stream),
  });
}
