import type { QuizAnswer, QuizResult } from "@/lib/types";

/**
 * Character style vectors — maps each character to two communication dimensions:
 * - energy: how the character delivers feedback (high/calm/direct)
 * - style: the character's approach to connection (playful/personal/analytical)
 *
 * Used by Phase 2 scoring to match quiz answers to the best-fit character
 * within the determined persona.
 */

interface CharacterStyleEntry {
  personaId: string;
  energy: "high" | "calm" | "direct";
  style: "playful" | "personal" | "analytical";
  sortOrder: number;
}

export const CHARACTER_STYLE_VECTORS: Record<string, CharacterStyleEntry> = {
  // Explorer
  frizzle: { personaId: "explorer", energy: "high", style: "playful", sortOrder: 1 },
  jess_day: { personaId: "explorer", energy: "high", style: "personal", sortOrder: 2 },
  evan_marquez: { personaId: "explorer", energy: "direct", style: "analytical", sortOrder: 3 },

  // Nurturer
  janine_teagues: { personaId: "nurturer", energy: "high", style: "personal", sortOrder: 1 },
  uncle_iroh: { personaId: "nurturer", energy: "calm", style: "personal", sortOrder: 2 },
  jiraiya: { personaId: "nurturer", energy: "direct", style: "playful", sortOrder: 3 },

  // Mentor
  mr_miyagi: { personaId: "mentor", energy: "calm", style: "analytical", sortOrder: 1 },
  gabe_iglesias: { personaId: "mentor", energy: "high", style: "playful", sortOrder: 2 },
  mr_feeny: { personaId: "mentor", energy: "calm", style: "personal", sortOrder: 3 },

  // Mastery Coach
  escalante: { personaId: "mastery_coach", energy: "direct", style: "analytical", sortOrder: 1 },
  coach_carter: { personaId: "mastery_coach", energy: "direct", style: "analytical", sortOrder: 2 },
  all_might: { personaId: "mastery_coach", energy: "high", style: "playful", sortOrder: 3 },
  coach_taylor: { personaId: "mastery_coach", energy: "calm", style: "personal", sortOrder: 4 },

  // Strategist
  annalise_keating: { personaId: "strategist", energy: "direct", style: "analytical", sortOrder: 1 },
  mcgonagall: { personaId: "strategist", energy: "calm", style: "analytical", sortOrder: 2 },
  storm: { personaId: "strategist", energy: "calm", style: "analytical", sortOrder: 3 },
};

/**
 * Match characters within a persona based on communication style answers.
 * Scores: +1 for energy match, +1 for style match. Tiebreak by sortOrder.
 */
function matchCharacters(
  personaId: string,
  energy: string,
  style: string
): { topCharacterId: string; alternativeCharacterIds: string[] } {
  const candidates = Object.entries(CHARACTER_STYLE_VECTORS)
    .filter(([, entry]) => entry.personaId === personaId)
    .map(([id, entry]) => {
      let score = 0;
      if (entry.energy === energy) score += 1;
      if (entry.style === style) score += 1;
      return { id, score, sortOrder: entry.sortOrder };
    })
    .sort((a, b) => b.score - a.score || a.sortOrder - b.sortOrder);

  return {
    topCharacterId: candidates[0]?.id ?? "",
    alternativeCharacterIds: candidates.slice(1).map((c) => c.id),
  };
}

/**
 * Deterministic two-phase scoring:
 *
 * Phase 1 — Persona decision tree (from teacher-persona-agent.md):
 *   IF threshold == 70 AND structure == "open"  → Explorer
 *   ELSE IF threshold == 70                     → Nurturer
 *   ELSE IF threshold == 80                     → Mentor
 *   ELSE IF threshold == 90 AND personality == "coach"   → Mastery Coach
 *   ELSE IF threshold == 90 AND personality == "advisor"  → Strategist
 *
 * Phase 2 — Character matching:
 *   Scores each character in the persona by energy + style match,
 *   returns best-fit character and sorted alternatives.
 */
export function calculateQuizResults(answers: QuizAnswer[]): QuizResult {
  const answerMap = new Map(answers.map((a) => [a.questionId, a.selectedValue]));

  // Phase 1: Persona (unchanged)
  const threshold = answerMap.get("mastery-philosophy") ?? "80";
  const personality = answerMap.get("communication-tone") ?? "coach";
  const structure = answerMap.get("classroom-structure") ?? "guided";

  let topPersonaId: string;

  if (threshold === "70" && structure === "open") {
    topPersonaId = "explorer";
  } else if (threshold === "70") {
    topPersonaId = "nurturer";
  } else if (threshold === "80") {
    topPersonaId = "mentor";
  } else if (threshold === "90" && personality === "coach") {
    topPersonaId = "mastery_coach";
  } else {
    topPersonaId = "strategist";
  }

  // Phase 2: Character matching
  const energy = answerMap.get("teaching-energy") ?? "calm";
  const style = answerMap.get("communication-approach") ?? "personal";
  const { topCharacterId, alternativeCharacterIds } = matchCharacters(
    topPersonaId,
    energy,
    style
  );

  return { topPersonaId, topCharacterId, alternativeCharacterIds };
}
