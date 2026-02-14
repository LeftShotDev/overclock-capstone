"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuiz } from "@/lib/quiz-context";
import { PERSONAS } from "@/lib/data/personas";
import { PersonaCard } from "@/components/persona-card";
import { CharacterCard } from "@/components/character-card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { fetchCharactersByPersona, writeQuizResult } from "@/lib/supabase-queries";
import { computeRecommendations } from "@/lib/recommendation-engine";
import type { Character } from "@/lib/types";

export default function ResultsPage() {
  const router = useRouter();
  const {
    quizResult,
    answers,
    constraintAnswers,
    syllabusData,
    selectedCharacterId,
    setSelectedCharacterId,
    setGeneratedTemplates,
    hydrated,
  } = useQuiz();
  const [blurb, setBlurb] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loadingCharacters, setLoadingCharacters] = useState(false);

  const persona = quizResult ? PERSONAS[quizResult.topPersonaId] : null;

  // Fetch persona blurb
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
  }, [hydrated, quizResult, persona, constraintAnswers, syllabusData]);

  // Fetch characters for persona
  useEffect(() => {
    if (!hydrated || !quizResult) return;

    setLoadingCharacters(true);
    fetchCharactersByPersona(quizResult.topPersonaId)
      .then(setCharacters)
      .finally(() => setLoadingCharacters(false));
  }, [hydrated, quizResult]);

  if (!hydrated) return null;

  if (!quizResult || !persona) {
    router.push("/quiz");
    return null;
  }

  const handleContinue = async () => {
    // Write quiz result to Supabase — await to get the ID for template generation
    const recommendations = computeRecommendations({ quizResult });
    const quizResultId = await writeQuizResult({
      personaId: quizResult.topPersonaId,
      characterId: selectedCharacterId,
      appliedSettings: recommendations,
      quizAnswers: answers,
      constraintAnswers,
      syllabusData,
    });

    // Fire template generation (non-blocking)
    if (selectedCharacterId) {
      setGeneratedTemplates({
        templates: [],
        characterId: selectedCharacterId,
        personaId: quizResult.topPersonaId,
        status: "loading",
      });

      fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaId: quizResult.topPersonaId,
          characterId: selectedCharacterId,
          quizResultId,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setGeneratedTemplates({
            templates: data.templates,
            characterId: selectedCharacterId,
            personaId: quizResult.topPersonaId,
            status: "success",
          });
        })
        .catch(() => {
          setGeneratedTemplates({
            templates: [],
            characterId: selectedCharacterId,
            personaId: quizResult.topPersonaId,
            status: "error",
          });
        });
    }

    router.push("/settings");
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-2xl space-y-8 py-8">
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

        {characters.length > 0 && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold">
                  Choose your teaching character
                </p>
                <p className="text-xs text-muted-foreground">
                  Your pick shapes the tone of automated messages your students receive.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {characters.map((character) => (
                  <CharacterCard
                    key={character.id}
                    character={character}
                    isSelected={selectedCharacterId === character.id}
                    onSelect={setSelectedCharacterId}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {loadingCharacters && (
          <p className="text-sm text-muted-foreground text-center">
            Loading characters...
          </p>
        )}

        <Button
          onClick={handleContinue}
          className="w-full"
          size="lg"
        >
          Continue to Settings
        </Button>
      </div>
    </main>
  );
}
