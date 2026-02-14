"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuiz } from "@/lib/quiz-context";
import { fetchActiveAccessCodes, validateAccessCode } from "@/lib/supabase-queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Home() {
  const router = useRouter();
  const { quizResult, hydrated } = useQuiz();

  const [codesRequired, setCodesRequired] = useState(false);
  const [codesChecked, setCodesChecked] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);

  // Check if access codes are required
  useEffect(() => {
    async function checkCodes() {
      const hasActiveCodes = await fetchActiveAccessCodes();
      setCodesRequired(hasActiveCodes);
      setCodesChecked(true);
    }
    checkCodes();
  }, []);

  if (!hydrated || !codesChecked) return null;

  async function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCodeError(null);
    setValidating(true);

    const valid = await validateAccessCode(codeInput);
    if (valid) {
      router.push("/quiz");
    } else {
      setCodeError("Invalid or expired access code.");
    }
    setValidating(false);
  }

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

        {codesRequired ? (
          <form onSubmit={handleCodeSubmit} className="space-y-3">
            <div className="space-y-2">
              <label htmlFor="access-code" className="text-sm font-medium">
                Enter your access code to begin
              </label>
              <Input
                id="access-code"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                placeholder="Enter code"
                className="text-center font-mono text-lg tracking-wider"
                maxLength={10}
                required
              />
            </div>
            {codeError && (
              <p className="text-sm text-destructive">{codeError}</p>
            )}
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={validating || !codeInput}
            >
              {validating ? "Validating..." : "Start the Quiz"}
            </Button>
          </form>
        ) : (
          <Button size="lg" onClick={() => router.push("/quiz")}>
            Start the Quiz
          </Button>
        )}
      </div>
    </main>
  );
}
