import type { QuizAnswer, QuizResult } from "@/lib/types";

/**
 * Deterministic decision tree scoring from teacher-persona-agent.md:
 *
 * IF threshold == 70 AND structure == "open"  → Explorer
 * ELSE IF threshold == 70                     → Nurturer
 * ELSE IF threshold == 80                     → Mentor
 * ELSE IF threshold == 90 AND personality == "coach"   → Mastery Coach
 * ELSE IF threshold == 90 AND personality == "advisor"  → Strategist
 */
export function calculateQuizResults(answers: QuizAnswer[]): QuizResult {
  const answerMap = new Map(answers.map((a) => [a.questionId, a.selectedValue]));

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

  return { topPersonaId };
}
