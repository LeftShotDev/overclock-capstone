"use client";

import type { TeachingPersona } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PERSONA_THEMES: Record<
  string,
  { border: string; bg: string; badge: string }
> = {
  "the-architect": {
    border: "border-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  "the-coach": {
    border: "border-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950",
    badge: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
  },
  "the-explorer": {
    border: "border-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950",
    badge:
      "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  },
  "the-sage": {
    border: "border-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950",
    badge:
      "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200",
  },
};

const DEFAULT_THEME = {
  border: "border-primary",
  bg: "bg-muted",
  badge: "",
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
        <div className="flex flex-wrap gap-2 pt-2">
          {persona.traits.map((trait) => (
            <Badge key={trait} className={cn("capitalize", theme.badge)}>
              {trait}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm leading-relaxed">{persona.description}</p>
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">
            Communication Style
          </p>
          <p className="text-sm leading-relaxed">
            {persona.communicationStyle}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
