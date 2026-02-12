import { getSyllabusGraph } from "@/lib/agents";
import { HumanMessage } from "@langchain/core/messages";
import type { SyllabusData } from "@/lib/types";

export const maxDuration = 120;

const MAX_TEXT_LENGTH = 15000;

async function extractText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  if (file.name.toLowerCase().endsWith(".pdf")) {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: new Uint8Array(arrayBuffer) });
    const result = await parser.getText();
    await parser.destroy();
    return result.text;
  }

  if (file.name.toLowerCase().endsWith(".docx")) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mammoth = require("mammoth") as {
      extractRawText: (opts: { buffer: Buffer }) => Promise<{ value: string }>;
    };
    const result = await mammoth.extractRawText({
      buffer: Buffer.from(arrayBuffer),
    });
    return result.value;
  }

  throw new Error("Unsupported file type. Please upload a PDF or DOCX file.");
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    // Extract raw text from file
    let text = await extractText(file);

    // Truncate to manage token costs
    if (text.length > MAX_TEXT_LENGTH) {
      text = text.slice(0, MAX_TEXT_LENGTH);
    }

    if (!text.trim()) {
      return Response.json(
        { error: "Could not extract text from the file. The document may be empty or image-based." },
        { status: 422 }
      );
    }

    // Run syllabus analysis agent
    const graph = getSyllabusGraph();
    const result = await graph.invoke({
      messages: [
        new HumanMessage(
          `Analyze this course syllabus and extract structured information using all three tools.\n\nSyllabus text:\n${text}`
        ),
      ],
    });

    // The agent's final message should contain the compiled JSON
    const lastMessage = result.messages[result.messages.length - 1];
    const content =
      typeof lastMessage.content === "string"
        ? lastMessage.content
        : JSON.stringify(lastMessage.content);

    // Try to parse the JSON from the agent's response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json(
        { error: "Failed to parse syllabus analysis results" },
        { status: 500 }
      );
    }

    const syllabusData: SyllabusData = JSON.parse(jsonMatch[0]);
    return Response.json(syllabusData);
  } catch (err) {
    console.error("Syllabus analysis error:", err);
    return Response.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to analyze syllabus",
      },
      { status: 500 }
    );
  }
}
