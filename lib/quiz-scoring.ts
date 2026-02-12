import type { QuizAnswer } from "@/lib/types";
import { QUIZ_QUESTIONS } from "@/lib/data/quiz-questions";

export interface QuizResult {
  topPersonaId: string;
  scores: Record<string, number>;
  ranking: string[];
}

export function calculateQuizResults(answers: QuizAnswer[]): QuizResult {
  const totals: Record<string, number> = {};

  for (const answer of answers) {
    const question = QUIZ_QUESTIONS.find((q) => q.id === answer.questionId);
    if (!question) continue;
    const option = question.options.find(
      (o) => o.value === answer.selectedValue
    );
    if (!option) continue;

    for (const [persona, weight] of Object.entries(option.personaWeights)) {
      totals[persona] = (totals[persona] || 0) + weight;
    }
  }

  const sorted = Object.entries(totals).sort(([, a], [, b]) => b - a);

  return {
    topPersonaId: sorted[0]?.[0] || "the-architect",
    scores: Object.fromEntries(sorted),
    ranking: sorted.map(([id]) => id),
  };
}
