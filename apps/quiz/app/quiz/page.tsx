"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useQuiz } from "@/lib/quiz-context";
import { QUIZ_STEPS } from "@/lib/data/quiz-steps";
import { calculateQuizResults } from "@/lib/quiz-scoring";
import { fetchQuizQuestions, fetchConstraintQuestions } from "@/lib/supabase-queries";
import { QuizOptionCard } from "@/components/quiz-option-card";
import { ConstraintQuestionStep } from "@/components/constraint-question-step";
import { SyllabusUploadStep } from "@/components/syllabus-upload-step";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import type { QuizStep } from "@/lib/types";

export default function QuizPage() {
  const router = useRouter();
  const {
    answers,
    addAnswer,
    addConstraintAnswer,
    setQuizResult,
    currentStepIndex,
    setCurrentStepIndex,
    reset,
    hydrated,
  } = useQuiz();

  const [steps, setSteps] = useState<QuizStep[]>(QUIZ_STEPS);
  const [loading, setLoading] = useState(true);

  // Fetch questions from Supabase (falls back to static if unavailable)
  useEffect(() => {
    async function loadQuestions() {
      try {
        const [personaQs, constraintQs] = await Promise.all([
          fetchQuizQuestions(),
          fetchConstraintQuestions(),
        ]);
        const dynamicSteps: QuizStep[] = [
          ...personaQs.map((q) => ({ type: "persona" as const, question: q })),
          ...constraintQs.map((q) => ({ type: "constraint" as const, question: q })),
          { type: "syllabus-upload" as const },
        ];
        setSteps(dynamicSteps);
      } catch {
        // Keep static fallback
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, []);

  if (!hydrated || loading) return null;

  const totalSteps = steps.length;

  if (currentStepIndex >= totalSteps) {
    router.push("/results");
    return null;
  }

  const step = steps[currentStepIndex];
  const progress = (currentStepIndex / totalSteps) * 100;

  function finishQuiz() {
    const result = calculateQuizResults(answers);
    setQuizResult(result);
    router.push("/results");
  }

  function advance() {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex >= totalSteps) {
      const allAnswers = answers;
      const result = calculateQuizResults(allAnswers);
      setQuizResult(result);
      setCurrentStepIndex(nextIndex);
      router.push("/results");
    } else {
      setCurrentStepIndex(nextIndex);
    }
  }

  function handlePersonaAnswer(value: string) {
    if (step.type !== "persona") return;
    const updatedAnswers = [
      ...answers,
      { questionId: step.question.id, selectedValue: value },
    ];
    addAnswer({ questionId: step.question.id, selectedValue: value });

    const nextIndex = currentStepIndex + 1;
    if (nextIndex >= totalSteps) {
      const result = calculateQuizResults(updatedAnswers);
      setQuizResult(result);
      setCurrentStepIndex(nextIndex);
      router.push("/results");
    } else {
      setCurrentStepIndex(nextIndex);
    }
  }

  function handleConstraintAnswer(constraintKey: string, value: string) {
    addConstraintAnswer({ constraintKey, selectedValue: value });
    advance();
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-xl space-y-8">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Step {currentStepIndex + 1} of {totalSteps}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => reset()}
              className="text-xs"
            >
              Start Over
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {step.type === "persona" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              {step.question.question}
            </h2>
            <div className="grid gap-3">
              {step.question.options.map((option, i) => (
                <QuizOptionCard
                  key={option.value}
                  label={option.label}
                  value={option.value}
                  index={i}
                  onClick={handlePersonaAnswer}
                />
              ))}
            </div>
          </div>
        )}

        {step.type === "constraint" && (
          <ConstraintQuestionStep
            question={step.question}
            onAnswer={handleConstraintAnswer}
          />
        )}

        {step.type === "syllabus-upload" && (
          <SyllabusUploadStep onComplete={finishQuiz} onSkip={finishQuiz} />
        )}
      </div>
    </main>
  );
}
