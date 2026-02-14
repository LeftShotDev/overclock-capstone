"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type {
  QuizAnswer,
  QuizResult,
  ConstraintAnswer,
  SyllabusData,
  GeneratedTemplatesResult,
} from "@/lib/types";

interface QuizContextValue {
  answers: QuizAnswer[];
  addAnswer: (answer: QuizAnswer) => void;
  constraintAnswers: ConstraintAnswer[];
  addConstraintAnswer: (answer: ConstraintAnswer) => void;
  syllabusData: SyllabusData | null;
  setSyllabusData: (data: SyllabusData) => void;
  currentStepIndex: number;
  setCurrentStepIndex: (index: number) => void;
  quizResult: QuizResult | null;
  setQuizResult: (result: QuizResult) => void;
  selectedCharacterId: string | null;
  setSelectedCharacterId: (id: string | null) => void;
  generatedTemplates: GeneratedTemplatesResult | null;
  setGeneratedTemplates: (result: GeneratedTemplatesResult | null) => void;
  reset: () => void;
  hydrated: boolean;
}

const QuizContext = createContext<QuizContextValue | null>(null);

const STORAGE_KEY = "teaching-persona-quiz";

export function QuizProvider({ children }: { children: ReactNode }) {
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [constraintAnswers, setConstraintAnswers] = useState<
    ConstraintAnswer[]
  >([]);
  const [syllabusData, setSyllabusData] = useState<SyllabusData | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [generatedTemplates, setGeneratedTemplates] = useState<GeneratedTemplatesResult | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setAnswers(parsed.answers || []);
        setConstraintAnswers(parsed.constraintAnswers || []);
        setSyllabusData(parsed.syllabusData || null);
        setCurrentStepIndex(parsed.currentStepIndex || 0);
        setQuizResult(parsed.quizResult || null);
        setSelectedCharacterId(parsed.selectedCharacterId || null);
        setGeneratedTemplates(parsed.generatedTemplates || null);
      }
    } catch {
      // Ignore parse errors
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          answers,
          constraintAnswers,
          syllabusData,
          currentStepIndex,
          quizResult,
          selectedCharacterId,
          generatedTemplates,
        })
      );
    }
  }, [answers, constraintAnswers, syllabusData, currentStepIndex, quizResult, selectedCharacterId, generatedTemplates, hydrated]);

  const addAnswer = useCallback((answer: QuizAnswer) => {
    setAnswers((prev) => [...prev, answer]);
  }, []);

  const addConstraintAnswer = useCallback((answer: ConstraintAnswer) => {
    setConstraintAnswers((prev) => [...prev, answer]);
  }, []);

  const reset = useCallback(() => {
    setAnswers([]);
    setConstraintAnswers([]);
    setSyllabusData(null);
    setCurrentStepIndex(0);
    setQuizResult(null);
    setSelectedCharacterId(null);
    setGeneratedTemplates(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <QuizContext.Provider
      value={{
        answers,
        addAnswer,
        constraintAnswers,
        addConstraintAnswer,
        syllabusData,
        setSyllabusData,
        currentStepIndex,
        setCurrentStepIndex,
        quizResult,
        setQuizResult,
        selectedCharacterId,
        setSelectedCharacterId,
        generatedTemplates,
        setGeneratedTemplates,
        reset,
        hydrated,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error("useQuiz must be used within QuizProvider");
  return ctx;
}
