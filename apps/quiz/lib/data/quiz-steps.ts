import { QUIZ_QUESTIONS } from "./quiz-questions";
import { CONSTRAINT_QUESTIONS } from "./constraint-questions";
import type { QuizStep } from "@/lib/types";

export const QUIZ_STEPS: QuizStep[] = [
  ...QUIZ_QUESTIONS.map(
    (q) => ({ type: "persona" as const, question: q })
  ),
  ...CONSTRAINT_QUESTIONS.map(
    (q) => ({ type: "constraint" as const, question: q })
  ),
  { type: "syllabus-upload" },
];
