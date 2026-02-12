"use client";

import type { ConstraintQuestion } from "@/lib/types";
import { QuizOptionCard } from "@/components/quiz-option-card";

interface ConstraintQuestionStepProps {
  question: ConstraintQuestion;
  onAnswer: (constraintKey: string, value: string) => void;
}

export function ConstraintQuestionStep({
  question,
  onAnswer,
}: ConstraintQuestionStepProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">
        {question.question}
      </h2>

      <div className="grid gap-3">
        {question.options.map((option, i) => (
          <QuizOptionCard
            key={option.value}
            label={option.label}
            value={option.value}
            index={i}
            onClick={(value) => onAnswer(question.constraintKey, value)}
          />
        ))}
      </div>
    </div>
  );
}
