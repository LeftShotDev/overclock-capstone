"use client";

import { useRouter } from "next/navigation";
import { useQuiz } from "@/lib/quiz-context";
import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();
  const { quizResult, hydrated } = useQuiz();

  if (!hydrated) return null;

  // If they already have results, offer to continue
  if (quizResult) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="text-center space-y-6 max-w-md">
          <h1 className="text-4xl font-bold tracking-tight">Welcome Back!</h1>
          <p className="text-muted-foreground">
            You&apos;ve already completed the quiz. Where would you like to go?
          </p>
          <div className="flex flex-col gap-3">
            <Button size="lg" onClick={() => router.push("/results")}>
              View Your Results
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/settings")}
            >
              Go to Settings
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                router.push("/quiz");
              }}
            >
              Retake Quiz
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-4xl font-bold tracking-tight">
          What Kind of Professor Are You?
        </h1>
        <p className="text-muted-foreground text-lg">
          Take this quick quiz to discover your teaching persona and get
          personalized courseware recommendations.
        </p>
        <Button size="lg" onClick={() => router.push("/quiz")}>
          Start the Quiz
        </Button>
      </div>
    </main>
  );
}
