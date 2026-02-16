import { getCharacterGraph } from "@/lib/agents";
import { HumanMessage } from "@langchain/core/messages";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { step } = body;

    if (step === "suggestions") {
      const { personaName, personaDescription, existingCharacters } = body;

      if (!personaName || !personaDescription) {
        return Response.json(
          { error: "personaName and personaDescription are required" },
          { status: 400 }
        );
      }

      const graph = getCharacterGraph();
      const result = await graph.invoke({
        messages: [
          new HumanMessage(
            `Generate 5-8 diverse fictional teacher character suggestions for the "${personaName}" persona.\n\n` +
              `Persona description: ${personaDescription}\n\n` +
              `Existing characters to exclude: ${(existingCharacters ?? []).join(", ") || "none"}\n\n` +
              `Call the generate_character_suggestions tool with this context, then return ONLY a JSON array of objects with "name" and "work" fields.`
          ),
        ],
      });

      const lastMessage = result.messages[result.messages.length - 1];
      const content =
        typeof lastMessage.content === "string"
          ? lastMessage.content
          : JSON.stringify(lastMessage.content);

      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        return Response.json(
          { error: "Failed to parse character suggestions" },
          { status: 500 }
        );
      }

      const suggestions = JSON.parse(jsonMatch[0]);
      return Response.json({ suggestions });
    }

    if (step === "details") {
      const { name, work, personaName } = body;

      if (!name || !work) {
        return Response.json(
          { error: "name and work are required" },
          { status: 400 }
        );
      }

      const graph = getCharacterGraph();
      const result = await graph.invoke({
        messages: [
          new HumanMessage(
            `Give a brief 2-3 sentence preview of ${name} from "${work}" as a teacher character for the "${personaName}" persona. ` +
              `Describe their teaching style and personality. ` +
              `Do NOT call any tools. Return ONLY a JSON object with a single "details" field containing the preview text.`
          ),
        ],
      });

      const lastMessage = result.messages[result.messages.length - 1];
      const content =
        typeof lastMessage.content === "string"
          ? lastMessage.content
          : JSON.stringify(lastMessage.content);

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return Response.json({ details: content.trim() });
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return Response.json({ details: parsed.details || content.trim() });
    }

    if (step === "profile") {
      const {
        name,
        work,
        personaName,
        personaDescription,
        existingVoiceProfiles,
      } = body;

      if (!name || !work || !personaName || !personaDescription) {
        return Response.json(
          { error: "name, work, personaName, and personaDescription are required" },
          { status: 400 }
        );
      }

      const graph = getCharacterGraph();
      const result = await graph.invoke({
        messages: [
          new HumanMessage(
            `Generate a complete character profile for ${name} from "${work}" for the "${personaName}" persona.\n\n` +
              `Persona description: ${personaDescription}\n\n` +
              `Call the generate_character_profile tool with this context, then return ONLY a JSON object with fields: tagline, description, voice_profile (object with tone, sentence_style, vocabulary, signature_moves array, avoids array, example_voice), sex, ethnicity.\n\n` +
              `Existing voice profiles for distinctiveness: ${existingVoiceProfiles || "[]"}`
          ),
        ],
      });

      const lastMessage = result.messages[result.messages.length - 1];
      const content =
        typeof lastMessage.content === "string"
          ? lastMessage.content
          : JSON.stringify(lastMessage.content);

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return Response.json(
          { error: "Failed to parse character profile" },
          { status: 500 }
        );
      }

      const profile = JSON.parse(jsonMatch[0]);
      return Response.json({ profile });
    }

    return Response.json(
      { error: "Invalid step. Use 'suggestions', 'details', or 'profile'" },
      { status: 400 }
    );
  } catch (err) {
    console.error("Character generation error:", err);
    return Response.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to generate character",
      },
      { status: 500 }
    );
  }
}
