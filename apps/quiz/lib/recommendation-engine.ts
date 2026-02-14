import type { QuizResult } from "@/lib/types";
import { PERSONAS } from "@/lib/data/personas";

export interface RecommendationInput {
  quizResult: QuizResult;
}

export function computeRecommendations(
  input: RecommendationInput
): Record<string, string | number | boolean | string[]> {
  const persona = PERSONAS[input.quizResult.topPersonaId];
  if (!persona) return {};

  return {
    mastery_threshold: persona.masteryThreshold,
    message_personality: persona.messagePersonality,
    send_auto_messages: persona.sendAutoMessages,
    enabled_auto_messages: persona.enabledAutoMessages,
    show_study_plan_rollup: persona.showStudyPlanRollup,
    graded_participation_enabled: persona.gradedParticipationEnabled,
  };
}
