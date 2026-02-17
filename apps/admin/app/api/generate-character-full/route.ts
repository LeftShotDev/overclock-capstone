import { getCharacterGraphFull } from "@/lib/agents";
import { HumanMessage } from "@langchain/core/messages";

export const maxDuration = 120;

/**
 * Supervised multi-turn character wizard endpoint.
 * Uses the full character agent (with image tools) and provides
 * conversation context from previous steps so the agent can
 * make informed decisions across the entire workflow.
 *
 * Steps:
 *   "suggestions" — Generate 5-8 character suggestions for a persona
 *   "profile"     — Generate full profile + search for images
 *   "save-image"  — Crop and store a selected image
 */
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

      const graph = getCharacterGraphFull();
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

    if (step === "profile") {
      const {
        name,
        work,
        personaName,
        personaDescription,
        existingVoiceProfiles,
        existingCharacters,
        characterId,
      } = body;

      if (!name || !work || !personaName || !personaDescription) {
        return Response.json(
          { error: "name, work, personaName, and personaDescription are required" },
          { status: 400 }
        );
      }

      // Build a context-rich prompt that includes awareness of the suggestion step
      const graph = getCharacterGraphFull();
      const result = await graph.invoke({
        messages: [
          new HumanMessage(
            `You are creating a character for the "${personaName}" persona.\n\n` +
              `Persona description: ${personaDescription}\n\n` +
              `The administrator selected ${name} from "${work}" from a list of suggestions.\n` +
              `Existing characters: ${(existingCharacters ?? []).join(", ") || "none"}\n\n` +
              `Please do TWO things:\n` +
              `1. Call the generate_character_profile tool to generate a complete profile for ${name}. Existing voice profiles for distinctiveness: ${existingVoiceProfiles || "[]"}\n` +
              `2. Call the find_character_image tool to search for a representative image of ${name} from "${work}".\n\n` +
              `After both tool calls, return a single JSON object with these fields:\n` +
              `- tagline, description, voice_profile (object with tone, sentence_style, vocabulary, signature_moves array, avoids array, example_voice), sex, ethnicity\n` +
              `- images: the array of image results from the search\n\n` +
              `Return ONLY the JSON object, no markdown fencing.`
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

      const profileWithImages = JSON.parse(jsonMatch[0]);
      return Response.json({
        profile: {
          tagline: profileWithImages.tagline,
          description: profileWithImages.description,
          voice_profile: profileWithImages.voice_profile,
          sex: profileWithImages.sex,
          ethnicity: profileWithImages.ethnicity,
        },
        images: profileWithImages.images ?? [],
      });
    }

    if (step === "save-image") {
      const { imageUrl, characterId } = body;

      if (!imageUrl || !characterId) {
        return Response.json(
          { error: "imageUrl and characterId are required" },
          { status: 400 }
        );
      }

      const graph = getCharacterGraphFull();
      const result = await graph.invoke({
        messages: [
          new HumanMessage(
            `The administrator selected an image for their character. ` +
              `Please call the save_character_image tool to download, crop, and store this image.\n\n` +
              `Image URL: ${imageUrl}\n` +
              `Character ID: ${characterId}\n\n` +
              `Return ONLY a JSON object with a "storedUrl" field containing the public URL of the saved image.`
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
          { error: "Failed to parse save result" },
          { status: 500 }
        );
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return Response.json({ storedUrl: parsed.storedUrl });
    }

    return Response.json(
      { error: "Invalid step. Use 'suggestions', 'profile', or 'save-image'" },
      { status: 400 }
    );
  } catch (err) {
    console.error("Character full generation error:", err);
    return Response.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to generate character",
      },
      { status: 500 }
    );
  }
}
