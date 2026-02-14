"use client";

import type { TeachingPersona } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const PERSONA_THEMES: Record<
  string,
  { border: string; bg: string }
> = {
  explorer: {
    border: "border-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950",
  },
  nurturer: {
    border: "border-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950",
  },
  mentor: {
    border: "border-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950",
  },
  mastery_coach: {
    border: "border-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950",
  },
  strategist: {
    border: "border-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950",
  },
};

const DEFAULT_THEME = {
  border: "border-primary",
  bg: "bg-muted",
};

interface PersonaCardProps {
  persona: TeachingPersona;
}

export function PersonaCard({ persona }: PersonaCardProps) {
  const theme = PERSONA_THEMES[persona.id] || DEFAULT_THEME;

  return (
    <Card className={cn("border-2", theme.border, theme.bg)}>
      <CardHeader>
        <CardTitle className="text-3xl font-bold">{persona.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed">{persona.description}</p>
      </CardContent>
    </Card>
  );
}
