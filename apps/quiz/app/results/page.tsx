"use client";

import { useEffect, useState, useMemo } from "react";
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
    personaBlurb,
    setPersonaBlurb,
    hydrated,
  } = useQuiz();
  const [blurb, setBlurb] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loadingCharacters, setLoadingCharacters] = useState(false);

  const persona = quizResult ? PERSONAS[quizResult.topPersonaId] : null;

  // Split characters into matched + alternatives
  const matchedCharacter = useMemo(
    () =>
      quizResult?.topCharacterId
        ? characters.find((c) => c.id === quizResult.topCharacterId) ?? null
        : null,
    [characters, quizResult]
  );

  const alternativeCharacters = useMemo(() => {
    if (!quizResult?.alternativeCharacterIds?.length) {
      // Legacy result without character matching — show all as alternatives
      return characters;
    }
    // Order alternatives by the scoring order
    return quizResult.alternativeCharacterIds
      .map((id) => characters.find((c) => c.id === id))
      .filter((c): c is Character => c != null);
  }, [characters, quizResult]);

  // Auto-select matched character on mount
  useEffect(() => {
    if (!hydrated || !quizResult?.topCharacterId) return;
    if (!selectedCharacterId) {
      setSelectedCharacterId(quizResult.topCharacterId);
    }
  }, [hydrated, quizResult, selectedCharacterId, setSelectedCharacterId]);

  // Fetch character-focused blurb — waits for matchedCharacter to load
  // Use matchedCharacter?.id as dep to keep array size constant (object → primitive)
  const matchedCharacterId = matchedCharacter?.id ?? null;
  useEffect(() => {
    if (!hydrated || !quizResult || !persona || !matchedCharacter) return;

    // Use cached blurb if available
    if (personaBlurb) {
      setBlurb(personaBlurb);
      return;
    }

    setIsStreaming(true);
    const controller = new AbortController();

    async function fetchBlurb() {
      try {
        const res = await fetch("/api/persona", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            personaId: quizResult!.topPersonaId,
            characterName: matchedCharacter!.name,
            characterWork: matchedCharacter!.work,
            characterTagline: matchedCharacter!.tagline,
            characterDescription: matchedCharacter!.description,
            characterVoiceProfile: matchedCharacter!.voiceProfile,
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

        // Cache the completed blurb in context (persisted to localStorage)
        if (text) {
          setPersonaBlurb(text);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
      } finally {
        setIsStreaming(false);
      }
    }

    fetchBlurb();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, quizResult, persona, matchedCharacterId, personaBlurb, constraintAnswers, syllabusData, setPersonaBlurb]);

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
        {/* 1. Character-focused header */}
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Your character match is...
          </p>
        </div>

        {/* 2. Hero character + streamed blurb (flows inline) */}
        {loadingCharacters && !matchedCharacter && (
          <p className="text-sm text-muted-foreground text-center">
            Finding your character match...
          </p>
        )}
        {matchedCharacter && (
          <CharacterCard
            character={matchedCharacter}
            isSelected={selectedCharacterId === matchedCharacter.id}
            onSelect={setSelectedCharacterId}
            featured
            streamedBlurb={
              (blurb || isStreaming) ? (
                <p className="text-sm leading-relaxed whitespace-pre-wrap pt-1">
                  {blurb}
                  {isStreaming && (
                    <span className="inline-block w-1.5 h-4 bg-foreground/70 animate-pulse ml-0.5 align-text-bottom" />
                  )}
                </p>
              ) : undefined
            }
          />
        )}

        {/* 4. Teaching persona section */}
        {persona && (
          <>
            <Separator />
            <div className="space-y-4">
              <p className="text-sm font-semibold text-muted-foreground">
                Part of the {persona.name} teaching philosophy
              </p>
              <PersonaCard persona={persona} />
            </div>
          </>
        )}

        {/* 5. Alternative characters */}
        {alternativeCharacters.length > 0 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-muted-foreground">
                Other {persona.name} characters
              </p>
              <p className="text-xs text-muted-foreground">
                These share your teaching philosophy with a different communication style.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {alternativeCharacters.map((character) => (
                <CharacterCard
                  key={character.id}
                  character={character}
                  isSelected={selectedCharacterId === character.id}
                  onSelect={setSelectedCharacterId}
                />
              ))}
            </div>
          </div>
        )}

        {/* 6. Continue button */}
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
