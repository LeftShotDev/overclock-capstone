import { tool } from "@langchain/core/tools";
import { z } from "zod";

const PERSONAS: Record<string, {
  id: string;
  name: string;
  description: string;
  traits: string[];
  communicationStyle: string;
}> = {
  "the-architect": {
    id: "the-architect",
    name: "The Architect",
    description:
      "You're methodical, structured, and believe in building strong foundations. Your courses are well-organized machines where every piece fits perfectly. Students always know exactly where they stand and what's coming next.",
    traits: ["organized", "systematic", "detail-oriented", "consistent"],
    communicationStyle:
      "Clear, structured explanations with step-by-step guidance. You use outlines, checklists, and well-defined rubrics.",
  },
  "the-coach": {
    id: "the-coach",
    name: "The Coach",
    description:
      "You're all heart. You see every student as an individual with unique potential, and you're there to help them unlock it. Your door is always open, and no question is too small.",
    traits: ["empathetic", "supportive", "patient", "encouraging"],
    communicationStyle:
      "Warm, personal, and encouraging. You check in often and celebrate small wins. Your feedback is constructive and kind.",
  },
  "the-explorer": {
    id: "the-explorer",
    name: "The Explorer",
    description:
      "You believe the best learning happens through discovery. Your classroom is a laboratory where students experiment, fail safely, and find their own paths. Structure is a suggestion, curiosity is the rule.",
    traits: ["creative", "adventurous", "flexible", "innovative"],
    communicationStyle:
      "Enthusiastic and open-ended. You ask more questions than you answer and love a good 'what if?' You embrace tangents that lead somewhere interesting.",
  },
  "the-sage": {
    id: "the-sage",
    name: "The Sage",
    description:
      "You're a deep thinker who values knowledge and intellectual rigor. Your courses challenge students to think critically and engage with material at a profound level. You curate the best resources and guide students toward mastery.",
    traits: ["analytical", "thoughtful", "rigorous", "knowledgeable"],
    communicationStyle:
      "Precise and substantive. You provide rich context and encourage deep reading. Your discussions are Socratic and thought-provoking.",
  },
};

export const determinePersona = tool(
  async ({ topPersonaId }: { topPersonaId: string }) => {
    const persona = PERSONAS[topPersonaId] || PERSONAS["the-architect"];
    return JSON.stringify(persona);
  },
  {
    name: "determine_persona",
    description:
      "Look up the full persona details by persona ID. Returns the persona's name, description, traits, and communication style.",
    schema: z.object({
      topPersonaId: z
        .string()
        .describe("The ID of the top-scoring persona from quiz results"),
    }),
  }
);

export const getPersonaDetails = tool(
  async ({ personaId }: { personaId: string }) => {
    const persona = PERSONAS[personaId];
    if (!persona) {
      return JSON.stringify({ error: `Persona '${personaId}' not found` });
    }
    return JSON.stringify(persona);
  },
  {
    name: "get_persona_details",
    description: "Get detailed information about a specific teaching persona.",
    schema: z.object({
      personaId: z.string().describe("The persona ID to look up"),
    }),
  }
);
