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
  featured?: boolean;
}

export function CharacterCard({
  character,
  isSelected,
  onSelect,
  featured,
}: CharacterCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary border-primary",
        featured && "border-2"
      )}
      onClick={() => onSelect(character.id)}
    >
      <CardHeader>
        {featured && (
          <span className="text-xs font-medium text-primary uppercase tracking-wide">
            Best Match
          </span>
        )}
        <CardTitle className={cn("text-base", featured && "text-lg")}>
          {character.name}
        </CardTitle>
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
