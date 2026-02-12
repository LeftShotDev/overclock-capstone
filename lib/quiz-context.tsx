"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { QuizAnswer, QuizResult } from "@/lib/types";

interface QuizContextValue {
  answers: QuizAnswer[];
  addAnswer: (answer: QuizAnswer) => void;
  quizResult: QuizResult | null;
  setQuizResult: (result: QuizResult) => void;
  reset: () => void;
  hydrated: boolean;
}

const QuizContext = createContext<QuizContextValue | null>(null);

const STORAGE_KEY = "teaching-persona-quiz";

export function QuizProvider({ children }: { children: ReactNode }) {
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setAnswers(parsed.answers || []);
        setQuizResult(parsed.quizResult || null);
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
        JSON.stringify({ answers, quizResult })
      );
    }
  }, [answers, quizResult, hydrated]);

  const addAnswer = useCallback((answer: QuizAnswer) => {
    setAnswers((prev) => [...prev, answer]);
  }, []);

  const reset = useCallback(() => {
    setAnswers([]);
    setQuizResult(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <QuizContext.Provider
      value={{ answers, addAnswer, quizResult, setQuizResult, reset, hydrated }}
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
