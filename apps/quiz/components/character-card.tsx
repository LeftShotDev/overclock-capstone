"use client";

import type { Character } from "@/lib/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CharacterCardProps {
  character: Character;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function CharacterCard({
  character,
  isSelected,
  onSelect,
}: CharacterCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary border-primary"
      )}
      onClick={() => onSelect(character.id)}
    >
      <CardHeader>
        <CardTitle className="text-base">{character.name}</CardTitle>
        <CardDescription>{character.work}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm font-medium italic text-muted-foreground">
          &ldquo;{character.tagline}&rdquo;
        </p>
        <p className="text-sm leading-relaxed">{character.description}</p>
      </CardContent>
    </Card>
  );
}
