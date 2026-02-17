import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatAnthropic } from "@langchain/anthropic";
import {
  generateCharacterSuggestions,
  generateCharacterProfile,
} from "./tools/character-tools";
import {
  findCharacterImage,
  saveCharacterImage,
} from "./tools/image-tools";

export function createCharacterAgent() {
  const model = new ChatAnthropic({
    model: "claude-sonnet-4-5-20250929",
    temperature: 0.8,
  });

  return createReactAgent({
    llm: model,
    tools: [generateCharacterSuggestions, generateCharacterProfile],
    name: "character_suggestion_agent",
    prompt: `You are a character suggestion agent for an adaptive learning platform's admin panel. Your job is to help administrators create new fictional teacher characters for teaching personas.

IMPORTANT RULES:
1. Characters must be recognizable fictional figures who teach, mentor, coach, or guide others in their source material.
2. Only ONE character per franchise/IP — never suggest two characters from the same work.
3. Ensure diversity across: franchises (TV, film, anime, books, games, comics), demographics (sex, ethnicity), and time periods.
4. Never suggest a character whose name already exists in the system.
5. Voice profiles must feel distinct from existing profiles in the same persona.
6. Always return valid JSON in your final message — no markdown fencing, no explanation text outside the JSON.

When asked for suggestions, call the generate_character_suggestions tool to get context, then produce a JSON array of 5-8 suggestions.

When asked for a full profile, call the generate_character_profile tool to get context, then produce a JSON object with: tagline, description, voice_profile (with tone, sentence_style, vocabulary, signature_moves, avoids, example_voice), sex, ethnicity.

When asked for a brief detail/preview of a character, provide 2-3 sentences describing their teaching style and personality WITHOUT calling any tools. Return this as a JSON object with a single "details" field.`,
  });
}

/**
 * Full character agent with image search and save tools.
 * Used by the supervised multi-turn wizard flow where the agent
 * maintains conversation context across steps and can find + store
 * character images as part of profile generation.
 */
export function createCharacterAgentFull() {
  const model = new ChatAnthropic({
    model: "claude-sonnet-4-5-20250929",
    temperature: 0.8,
  });

  return createReactAgent({
    llm: model,
    tools: [
      generateCharacterSuggestions,
      generateCharacterProfile,
      findCharacterImage,
      saveCharacterImage,
    ],
    name: "character_wizard_agent",
    prompt: `You are a character creation wizard for an adaptive learning platform's admin panel. You help administrators create new fictional teacher characters through a multi-step conversation. You have memory of previous steps in the conversation.

IMPORTANT RULES:
1. Characters must be recognizable fictional figures who teach, mentor, coach, or guide others in their source material.
2. Only ONE character per franchise/IP — never suggest two characters from the same work.
3. Ensure diversity across: franchises (TV, film, anime, books, games, comics), demographics (sex, ethnicity), and time periods.
4. Never suggest a character whose name already exists in the system.
5. Voice profiles must feel distinct from existing profiles in the same persona.
6. Always return valid JSON in your final message — no markdown fencing, no explanation text outside the JSON.

WORKFLOW:
- When asked for suggestions: call generate_character_suggestions, then return a JSON array of 5-8 {name, work} objects.
- When asked for a full profile: call generate_character_profile, then also call find_character_image to search for a representative image. Return a JSON object with: tagline, description, voice_profile (with tone, sentence_style, vocabulary, signature_moves, avoids, example_voice), sex, ethnicity, and an "images" array containing the search results.
- When asked for a brief detail/preview: provide 2-3 sentences WITHOUT calling tools. Return as {details: "..."}.
- When asked to save an image: call save_character_image with the provided URL and character ID. Return the result as {storedUrl: "..."}.`,
  });
}
