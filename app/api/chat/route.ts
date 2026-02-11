import { createUIMessageStreamResponse, type UIMessage } from "ai";
import { toBaseMessages, toUIMessageStream } from "@ai-sdk/langchain";
import { getGraph } from "@/lib/agents";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const graph = getGraph();
  const langchainMessages = await toBaseMessages(messages);

  const stream = graph.streamEvents(
    { messages: langchainMessages },
    { version: "v2" },
  );

  return createUIMessageStreamResponse({
    stream: toUIMessageStream(stream),
  });
}
