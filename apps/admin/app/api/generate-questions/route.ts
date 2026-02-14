import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { createSupabaseServiceClient } from "@/lib/supabase-server";

export const maxDuration = 60;

export async function POST(req: Request) {
  const {
    quizId,
    settingsSchema,
    quizName,
    quizDescription,
  }: {
    quizId: string;
    settingsSchema: {
      id: string;
      name: string;
      description: string;
      type: string;
      options?: { label: string; value: string }[];
    }[];
    quizName: string;
    quizDescription?: string;
  } = await req.json();

  if (!quizId || !settingsSchema?.length) {
    return Response.json(
      { error: "Quiz ID and at least one setting are required" },
      { status: 400 }
    );
  }

  const settingsBlock = settingsSchema
    .map((s) => {
      let line = `- ${s.name} (${s.type}): ${s.description}`;
      if (s.options?.length) {
        line += `\n  Options: ${s.options.map((o) => o.label).join(", ")}`;
      }
      return line;
    })
    .join("\n");

  const prompt = `You are designing a teaching persona quiz for the "${quizName}" platform.
${quizDescription ? `Platform description: ${quizDescription}` : ""}

This platform has the following configurable settings that instructors need to understand and configure:

SETTINGS:
${settingsBlock}

Generate 4-6 quiz questions that would help determine an instructor's teaching style based on how they'd configure these settings. Each question should:
1. Be a scenario-based question about teaching philosophy or classroom approach
2. Have 2-4 answer options that naturally map to different setting configurations
3. Be written in a conversational, non-technical tone
4. Not directly ask "what setting would you choose" — instead reveal preferences through teaching scenarios

For each question, include:
- id: a kebab-case identifier (unique, descriptive)
- question: the question text
- options: array of {label, value} where label is the answer text and value is a short kebab-case identifier

Return ONLY a JSON array. No explanation, no markdown fencing. Example:
[{"id":"feedback-approach","question":"When a student struggles with a concept, what's your first instinct?","options":[{"label":"Send them a helpful nudge with targeted resources","value":"nudge"},{"label":"Let them work through it independently","value":"independent"}]}]`;

  try {
    const result = await generateText({
      model: anthropic("claude-sonnet-4-5-20250929"),
      prompt,
    });

    const parsed = JSON.parse(result.text.trim());

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return Response.json(
        { error: "AI returned an unexpected format" },
        { status: 500 }
      );
    }

    // Insert as draft questions
    const supabase = createSupabaseServiceClient();

    // Get current max sort_order for this quiz
    const { data: existing } = await supabase
      .from("quiz_questions")
      .select("sort_order")
      .eq("quiz_id", quizId)
      .order("sort_order", { ascending: false })
      .limit(1);

    let nextOrder = (existing?.[0]?.sort_order ?? -1) + 1;

    const drafts = [];
    for (const q of parsed) {
      const id = `${quizId.slice(0, 8)}-${q.id}`;
      const { data, error } = await supabase
        .from("quiz_questions")
        .insert({
          id,
          question: q.question,
          question_type: "persona",
          options: q.options,
          sort_order: nextOrder++,
          quiz_id: quizId,
          is_active: true,
          is_draft: true,
        })
        .select()
        .single();

      if (error) {
        console.error("Failed to insert draft question:", error.message);
        continue;
      }
      drafts.push(data);
    }

    return Response.json({ questions: drafts });
  } catch (err) {
    console.error("Question generation failed:", err);
    return Response.json(
      { error: "Failed to generate questions" },
      { status: 500 }
    );
  }
}
