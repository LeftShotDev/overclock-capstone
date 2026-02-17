"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, X, ArrowLeft, Check } from "lucide-react";

interface SearchResult {
  url: string;
  thumbnail: string;
}

interface ImageSearchProps {
  /** Character context for auto-generating search query */
  characterContext?: { name: string; work: string };
  /** Character ID used for naming the stored image file */
  characterId?: string;
  /** Fallback search query if no characterContext */
  defaultQuery?: string;
  /** Called when an image is cropped, stored, and ready */
  onSelect: (url: string) => void;
}

type Phase = "closed" | "search" | "preview" | "saving";

export function ImageSearch({
  characterContext,
  characterId,
  defaultQuery = "",
  onSelect,
}: ImageSearchProps) {
  const initialQuery = characterContext
    ? `${characterContext.name} ${characterContext.work} character`
    : defaultQuery;

  const [phase, setPhase] = useState<Phase>("closed");
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<SearchResult | null>(null);

  function reset() {
    setPhase("closed");
    setResults([]);
    setError(null);
    setSelected(null);
  }

  async function handleSearch() {
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);
    setResults([]);
    setSelected(null);

    try {
      const res = await fetch("/api/find-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          characterContext
            ? { name: characterContext.name, work: characterContext.work }
            : { name: query.trim(), work: "" }
        ),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Search failed");
        return;
      }

      if (data.query) setQuery(data.query);
      setResults(data.images ?? []);
      if ((data.images ?? []).length === 0) {
        setError("No images found. Try a different search term.");
      }
    } catch {
      setError("Failed to search images");
    } finally {
      setIsSearching(false);
    }
  }

  async function handleCropAndSave() {
    if (!selected) return;

    setPhase("saving");
    setError(null);

    try {
      const res = await fetch("/api/crop-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: selected.url,
          characterId: characterId ?? "temp",
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to crop and save image");
        setPhase("preview");
        return;
      }

      onSelect(data.storedUrl);
      reset();
    } catch {
      setError("Failed to crop and save image");
      setPhase("preview");
    }
  }

  // Closed state — just the button
  if (phase === "closed") {
    return (
      <Button
        type="button"
        variant="outline"
        size="xs"
        onClick={() => {
          setPhase("search");
          setQuery(initialQuery);
        }}
      >
        <Search className="size-3" />
        Find Image
      </Button>
    );
  }

  // Preview state — show selected image with crop & save
  if (phase === "preview" || phase === "saving") {
    return (
      <div className="border rounded-md p-3 space-y-3 bg-muted/30">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium">Preview</span>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={reset}
            disabled={phase === "saving"}
          >
            <X className="size-3" />
          </Button>
        </div>

        {selected && (
          <div className="flex justify-center">
            <div className="relative w-32 h-32 rounded-md overflow-hidden border">
              <img
                src={selected.thumbnail}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {error && <p className="text-xs text-destructive">{error}</p>}

        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            onClick={handleCropAndSave}
            disabled={phase === "saving"}
          >
            {phase === "saving" ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Check className="size-3" />
            )}
            {phase === "saving" ? "Saving..." : "Crop & Save"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setSelected(null);
              setPhase("search");
            }}
            disabled={phase === "saving"}
          >
            <ArrowLeft className="size-3" />
            Back
          </Button>
        </div>
      </div>
    );
  }

  // Search state — query input + results grid
  return (
    <div className="border rounded-md p-3 space-y-3 bg-muted/30">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">Find Image</span>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={reset}
        >
          <X className="size-3" />
        </Button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className="flex gap-2"
      >
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for character image..."
          className="h-8 text-sm"
        />
        <Button
          type="submit"
          size="sm"
          disabled={isSearching || !query.trim()}
        >
          {isSearching ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Search className="size-3" />
          )}
          Search
        </Button>
      </form>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {results.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {results.map((img) => (
            <button
              key={img.url}
              type="button"
              onClick={() => {
                setSelected(img);
                setPhase("preview");
              }}
              className="aspect-square rounded-md overflow-hidden border-2 border-transparent hover:border-primary transition-colors"
            >
              <img
                src={img.thumbnail}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
