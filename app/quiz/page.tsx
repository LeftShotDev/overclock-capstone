"use client";

import { useRouter } from "next/navigation";
import { useQuiz } from "@/lib/quiz-context";
import { QUIZ_QUESTIONS } from "@/lib/data/quiz-questions";
import { calculateQuizResults } from "@/lib/quiz-scoring";
import { QuizOptionCard } from "@/components/quiz-option-card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export default function QuizPage() {
  const router = useRouter();
  const { answers, addAnswer, setQuizResult, reset, hydrated } = useQuiz();

  if (!hydrated) return null;

  const currentIndex = answers.length;
  const totalQuestions = QUIZ_QUESTIONS.length;
  const isComplete = currentIndex >= totalQuestions;

  if (isComplete) {
    router.push("/results");
    return null;
  }

  const question = QUIZ_QUESTIONS[currentIndex];
  const progress = (currentIndex / totalQuestions) * 100;

  function handleAnswer(value: string) {
    addAnswer({ questionId: question.id, selectedValue: value });

    if (currentIndex + 1 >= totalQuestions) {
      const allAnswers = [
        ...answers,
        { questionId: question.id, selectedValue: value },
      ];
      const result = calculateQuizResults(allAnswers);
      setQuizResult(result);
      router.push("/results");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-xl space-y-8">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Question {currentIndex + 1} of {totalQuestions}
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
                onClick={handleAnswer}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
