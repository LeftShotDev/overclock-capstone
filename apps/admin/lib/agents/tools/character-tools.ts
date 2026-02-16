import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const generateCharacterSuggestions = tool(
  async ({
    personaName,
    personaDescription,
    existingCharacters,
  }: {
    personaName: string;
    personaDescription: string;
    existingCharacters: string[];
  }) => {
    return JSON.stringify({
      personaName,
      personaDescription,
      existingCharacters,
      instruction:
        "Generate 5-8 fictional teacher character suggestions for this persona. " +
        "Each suggestion should include a name and the work/franchise they are from. " +
        "Ensure diversity across franchises, demographics (sex, ethnicity), and media types (TV, film, anime, books, games). " +
        "Do NOT suggest any character whose name appears in the existingCharacters list. " +
        "Only one character per franchise/IP. " +
        "Characters should be recognizable fictional figures who teach, mentor, coach, or guide others. " +
        "Return ONLY a JSON array of objects with 'name' and 'work' fields.",
    });
  },
  {
    name: "generate_character_suggestions",
    description:
      "Retrieve persona context and existing characters to generate diverse fictional teacher character suggestions. Returns the context needed to produce 5-8 character name+work suggestions that fit the persona and avoid duplicates.",
    schema: z.object({
      personaName: z.string().describe("The name of the persona (e.g. 'Explorer', 'Mentor')"),
      personaDescription: z.string().describe("A description of the persona's teaching philosophy"),
      existingCharacters: z
        .array(z.string())
        .describe("Names of characters that already exist (to avoid duplicates)"),
    }),
  }
);

export const generateCharacterProfile = tool(
  async ({
    name,
    work,
    personaName,
    personaDescription,
    existingVoiceProfiles,
  }: {
    name: string;
    work: string;
    personaName: string;
    personaDescription: string;
    existingVoiceProfiles: string;
  }) => {
    return JSON.stringify({
      name,
      work,
      personaName,
      personaDescription,
      existingVoiceProfiles,
      instruction:
        "Generate a complete character profile for this fictional teacher character. " +
        "The profile must include: tagline (a short quote or motto, ≤15 words), " +
        "description (2-sentence teaching energy summary), " +
        "voice_profile (object with keys: tone, sentence_style, vocabulary, signature_moves (array), avoids (array), example_voice), " +
        "sex (Male or Female), and ethnicity (White, Black, Latino, or Asian). " +
        "The voice_profile must feel distinct from the existing voice profiles provided. " +
        "Return ONLY a JSON object with fields: tagline, description, voice_profile, sex, ethnicity.",
    });
  },
  {
    name: "generate_character_profile",
    description:
      "Retrieve context about a specific character selection to generate a full profile including tagline, description, voice_profile (tone, sentence_style, vocabulary, signature_moves, avoids, example_voice), sex, and ethnicity. Returns context needed to produce a distinctive profile.",
    schema: z.object({
      name: z.string().describe("The character's name (e.g. 'Ms. Frizzle')"),
      work: z.string().describe("The franchise/work the character is from (e.g. 'The Magic School Bus')"),
      personaName: z.string().describe("The persona this character belongs to"),
      personaDescription: z.string().describe("The persona's teaching philosophy description"),
      existingVoiceProfiles: z
        .string()
        .describe("JSON string of existing voice profiles in this persona for distinctiveness comparison"),
    }),
  }
);
