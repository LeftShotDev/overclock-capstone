"use client";

import Image from "next/image";
import type { Character } from "@/lib/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

function PlaceholderSvg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="120" height="120" rx="8" className="fill-muted" />
      <circle cx="60" cy="45" r="18" className="fill-muted-foreground/25" />
      <ellipse cx="60" cy="95" rx="28" ry="22" className="fill-muted-foreground/25" />
    </svg>
  );
}

function CharacterAvatar({
  imageUrl,
  name,
  className,
}: {
  imageUrl?: string | null;
  name: string;
  className?: string;
}) {
  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={name}
        width={120}
        height={120}
        className={cn("rounded-lg object-cover", className)}
      />
    );
  }

  return <PlaceholderSvg className={cn("rounded-lg bg-muted", className)} />;
}

interface CharacterCardProps {
  character: Character;
  isSelected: boolean;
  onSelect: (id: string) => void;
  featured?: boolean;
  /** Streamed blurb content rendered inline after the character description */
  streamedBlurb?: React.ReactNode;
}

export function CharacterCard({
  character,
  isSelected,
  onSelect,
  featured,
  streamedBlurb,
}: CharacterCardProps) {
  // Featured layout: flat (no card), avatar + text flowing into blurb
  if (featured) {
    return (
      <div className="flex gap-6 items-start">
        <CharacterAvatar
          imageUrl={character.imageUrl}
          name={character.name}
          className="w-24 h-24 shrink-0"
        />
        <div className="space-y-1 min-w-0">
          <h2 className="text-2xl font-bold tracking-tight">{character.name}</h2>
          <p className="text-sm text-muted-foreground">{character.work}</p>
          <p className="text-sm font-medium italic text-muted-foreground pt-1">
            &ldquo;{character.tagline}&rdquo;
          </p>
          <p className="text-sm leading-relaxed pt-1">{character.description}</p>
          {streamedBlurb}
        </div>
      </div>
    );
  }

  // Alternative characters: card with small avatar
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary border-primary"
      )}
      onClick={() => onSelect(character.id)}
    >
      <CardHeader>
        <div className="flex items-center gap-3">
          <CharacterAvatar
            imageUrl={character.imageUrl}
            name={character.name}
            className="w-10 h-10 shrink-0"
          />
          <div>
            <CardTitle className="text-base">{character.name}</CardTitle>
            <CardDescription>{character.work}</CardDescription>
          </div>
        </div>
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
