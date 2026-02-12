"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuiz } from "@/lib/quiz-context";
import { PERSONAS } from "@/lib/data/personas";
import { PersonaCard } from "@/components/persona-card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function ResultsPage() {
  const router = useRouter();
  const { quizResult, constraintAnswers, syllabusData, hydrated } = useQuiz();
  const [blurb, setBlurb] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const persona = quizResult
    ? PERSONAS[quizResult.topPersonaId]
    : null;

  useEffect(() => {
    if (!hydrated || !quizResult || !persona) return;

    setIsStreaming(true);
    const controller = new AbortController();

    async function fetchBlurb() {
      try {
        const res = await fetch("/api/persona", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            personaId: quizResult!.topPersonaId,
            scores: quizResult!.scores,
            constraintAnswers,
            syllabusData,
          }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          setIsStreaming(false);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let text = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          text += decoder.decode(value, { stream: true });
          setBlurb(text);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
      } finally {
        setIsStreaming(false);
      }
    }

    fetchBlurb();
    return () => controller.abort();
  }, [hydrated, quizResult, persona]);

  if (!hydrated) return null;

  if (!quizResult || !persona) {
    router.push("/quiz");
    return null;
  }

  const sortedScores = Object.entries(quizResult.scores).sort(
    ([, a], [, b]) => b - a
  );
  const maxScore = sortedScores[0]?.[1] || 1;

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-xl space-y-8 py-8">
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Your teaching persona is...
          </p>
        </div>

        <PersonaCard persona={persona} />

        {(blurb || isStreaming) && (
          <div className="space-y-2">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {blurb}
              {isStreaming && (
                <span className="inline-block w-1.5 h-4 bg-foreground/70 animate-pulse ml-0.5 align-text-bottom" />
              )}
            </p>
          </div>
        )}

        <Separator />

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            Score Breakdown
          </p>
          {sortedScores.map(([id, score]) => {
            const p = PERSONAS[id];
            if (!p) return null;
            return (
              <div key={id} className="flex items-center gap-3">
                <span className="text-sm w-28 shrink-0">{p.name}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${(score / maxScore) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-8 text-right">
                  {score}
                </span>
              </div>
            );
          })}
        </div>

        <Button
          onClick={() => router.push("/settings")}
          className="w-full"
          size="lg"
        >
          Continue to Settings
        </Button>
      </div>
    </main>
  );
}
