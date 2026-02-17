"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, X } from "lucide-react";

interface SearchResult {
  url: string;
  thumbnail: string;
}

interface ImageSearchProps {
  /** Pre-fill the search query (e.g. character name) */
  defaultQuery?: string;
  /** Called when user selects an image */
  onSelect: (url: string) => void;
}

export function ImageSearch({ defaultQuery = "", onSelect }: ImageSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(defaultQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);
    setResults([]);

    try {
      const res = await fetch(
        `/api/search-image?q=${encodeURIComponent(query.trim())}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Search failed");
        return;
      }

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

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        size="xs"
        onClick={() => {
          setOpen(true);
          setQuery(defaultQuery);
        }}
      >
        <Search className="size-3" />
        Search Image
      </Button>
    );
  }

  return (
    <div className="border rounded-md p-3 space-y-3 bg-muted/30">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">Image Search</span>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => {
            setOpen(false);
            setResults([]);
            setError(null);
          }}
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

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {results.map((img) => (
            <button
              key={img.url}
              type="button"
              onClick={() => {
                onSelect(img.url);
                setOpen(false);
                setResults([]);
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
