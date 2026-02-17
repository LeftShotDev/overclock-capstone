"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateCharacter, deleteCharacter } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Pencil, X, Save } from "lucide-react";
import { ImageSearch } from "@/components/image-search";

interface Character {
  id: string;
  persona_id: string;
  name: string;
  work: string;
  tagline: string;
  description: string;
  voice_profile: Record<string, unknown>;
  sort_order: number;
  sex: string | null;
  ethnicity: string | null;
  image_url: string | null;
  personas: { name: string } | null;
}

interface Persona {
  id: string;
  name: string;
  description: string;
}

export function CharactersClient({
  initialCharacters,
  personas,
}: {
  initialCharacters: Character[];
  personas: Persona[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterPersona, setFilterPersona] = useState<string>("all");

  const [editForm, setEditForm] = useState({
    name: "",
    work: "",
    tagline: "",
    description: "",
    voice_profile: "{}",
    sex: "",
    ethnicity: "",
    image_url: "",
  });

  const filtered =
    filterPersona === "all"
      ? initialCharacters
      : initialCharacters.filter((c) => c.persona_id === filterPersona);

  const grouped = new Map<string, Character[]>();
  for (const c of filtered) {
    const personaName = c.personas?.name ?? c.persona_id;
    if (!grouped.has(personaName)) grouped.set(personaName, []);
    grouped.get(personaName)!.push(c);
  }

  // ── Edit/Delete handlers ──

  function startEdit(c: Character) {
    setEditingId(c.id);
    setEditForm({
      name: c.name,
      work: c.work,
      tagline: c.tagline,
      description: c.description,
      voice_profile: JSON.stringify(c.voice_profile, null, 2),
      sex: c.sex ?? "",
      ethnicity: c.ethnicity ?? "",
      image_url: c.image_url ?? "",
    });
  }

  function handleSaveEdit(charId: string) {
    let parsedVoice: Record<string, unknown> = {};
    try {
      parsedVoice = JSON.parse(editForm.voice_profile);
    } catch {
      alert("Invalid JSON in voice profile");
      return;
    }
    startTransition(async () => {
      await updateCharacter(charId, {
        name: editForm.name,
        work: editForm.work,
        tagline: editForm.tagline,
        description: editForm.description,
        voice_profile: parsedVoice,
        sex: editForm.sex || undefined,
        ethnicity: editForm.ethnicity || undefined,
        image_url: editForm.image_url || null,
      });
      setEditingId(null);
      router.refresh();
    });
  }

  function handleDelete(c: Character) {
    if (!confirm(`Delete character "${c.name}"?`)) return;
    startTransition(async () => {
      await deleteCharacter(c.id);
      router.refresh();
    });
  }

  // ── Render helpers ──

  function renderCharacterCard(c: Character) {
    const isEditing = editingId === c.id;

    if (isEditing) {
      return (
        <Card key={c.id}>
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                {c.id}
              </Badge>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setEditingId(null)}
              >
                <X className="size-3" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Name</label>
                <Input
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, name: e.target.value }))
                  }
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Work</label>
                <Input
                  value={editForm.work}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, work: e.target.value }))
                  }
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Sex</label>
                <select
                  className="w-full h-8 rounded-md border px-2 text-sm"
                  value={editForm.sex}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, sex: e.target.value }))
                  }
                >
                  <option value="">Not set</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Ethnicity</label>
                <select
                  className="w-full h-8 rounded-md border px-2 text-sm"
                  value={editForm.ethnicity}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, ethnicity: e.target.value }))
                  }
                >
                  <option value="">Not set</option>
                  <option value="White">White</option>
                  <option value="Black">Black</option>
                  <option value="Latino">Latino</option>
                  <option value="Asian">Asian</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium">Image</label>
                <ImageSearch
                  characterContext={{
                    name: editForm.name,
                    work: editForm.work,
                  }}
                  characterId={c.id}
                  onSelect={(url) =>
                    setEditForm((p) => ({ ...p, image_url: url }))
                  }
                />
              </div>
              {editForm.image_url && (
                <img
                  src={editForm.image_url}
                  alt="Preview"
                  className="w-16 h-16 rounded-md object-cover mt-1"
                />
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Tagline</label>
              <Input
                value={editForm.tagline}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, tagline: e.target.value }))
                }
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Description</label>
              <textarea
                className="w-full min-h-[60px] rounded-md border px-3 py-2 text-sm"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">
                Voice Profile (JSON)
              </label>
              <textarea
                className="w-full min-h-[120px] rounded-md border px-3 py-2 text-xs font-mono"
                value={editForm.voice_profile}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, voice_profile: e.target.value }))
                }
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleSaveEdit(c.id)}
                disabled={isPending}
              >
                <Save className="size-3" />
                {isPending ? "Saving..." : "Save"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingId(null)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card key={c.id}>
        <CardContent className="flex items-start gap-4 pt-4">
          {c.image_url ? (
            <img
              src={c.image_url}
              alt={c.name}
              className="w-10 h-10 rounded-md object-cover shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-md bg-muted shrink-0 flex items-center justify-center">
              <span className="text-muted-foreground text-xs">—</span>
            </div>
          )}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{c.name}</span>
              <span className="text-muted-foreground text-xs">({c.work})</span>
              {c.sex && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {c.sex}
                </Badge>
              )}
              {c.ethnicity && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {c.ethnicity}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground italic">
              &ldquo;{c.tagline}&rdquo;
            </p>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {c.description}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => startEdit(c)}
              title="Edit"
            >
              <Pencil className="size-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => handleDelete(c)}
              disabled={isPending}
              title="Delete"
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── Main render ──

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Characters</h2>
          <p className="text-muted-foreground text-sm">
            Manage teacher characters across all personas. Each character has a
            voice profile used for message template generation.
          </p>
        </div>
        <Link href="/onboarding/characters/new">
          <Button>
            <Plus className="size-4" />
            Add Character
          </Button>
        </Link>
      </div>

      {/* Demographics */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">
              {initialCharacters.length} total characters across{" "}
              {personas.length} personas
            </span>
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">Filter:</label>
              <select
                className="h-7 rounded-md border px-2 text-xs"
                value={filterPersona}
                onChange={(e) => setFilterPersona(e.target.value)}
              >
                <option value="all">All personas</option>
                {personas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* By Persona */}
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                By Persona
              </span>
              {personas.map((p) => {
                const count = initialCharacters.filter(
                  (c) => c.persona_id === p.id
                ).length;
                const pct =
                  initialCharacters.length > 0
                    ? (count / initialCharacters.length) * 100
                    : 0;
                return (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="text-xs w-28 truncate">{p.name}</span>
                    <div className="flex-1 h-5 bg-muted rounded-md overflow-hidden">
                      <div
                        className="h-full bg-primary/70 rounded-md transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* By Sex */}
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                By Sex
              </span>
              {(() => {
                const sexCounts = new Map<string, number>();
                for (const c of initialCharacters) {
                  const key = c.sex || "Unknown";
                  sexCounts.set(key, (sexCounts.get(key) ?? 0) + 1);
                }
                return Array.from(sexCounts.entries())
                  .sort((a, b) => b[1] - a[1])
                  .map(([sex, count]) => {
                    const pct =
                      initialCharacters.length > 0
                        ? (count / initialCharacters.length) * 100
                        : 0;
                    return (
                      <div key={sex} className="flex items-center gap-3">
                        <span className="text-xs w-28 truncate">{sex}</span>
                        <div className="flex-1 h-5 bg-muted rounded-md overflow-hidden">
                          <div
                            className="h-full bg-blue-500/70 rounded-md transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-8 text-right">
                          {count}
                        </span>
                      </div>
                    );
                  });
              })()}
            </div>

            {/* By Ethnicity */}
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                By Ethnicity
              </span>
              {(() => {
                const ethCounts = new Map<string, number>();
                for (const c of initialCharacters) {
                  const key = c.ethnicity || "Unknown";
                  ethCounts.set(key, (ethCounts.get(key) ?? 0) + 1);
                }
                return Array.from(ethCounts.entries())
                  .sort((a, b) => b[1] - a[1])
                  .map(([eth, count]) => {
                    const pct =
                      initialCharacters.length > 0
                        ? (count / initialCharacters.length) * 100
                        : 0;
                    return (
                      <div key={eth} className="flex items-center gap-3">
                        <span className="text-xs w-28 truncate">{eth}</span>
                        <div className="flex-1 h-5 bg-muted rounded-md overflow-hidden">
                          <div
                            className="h-full bg-emerald-500/70 rounded-md transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-8 text-right">
                          {count}
                        </span>
                      </div>
                    );
                  });
              })()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Character list grouped by persona */}
      {Array.from(grouped.entries()).map(([personaName, chars]) => (
        <div key={personaName} className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {personaName}
            <Badge variant="secondary" className="text-xs">
              {chars.length}
            </Badge>
          </h3>
          {chars.map((c) => renderCharacterCard(c))}
        </div>
      ))}

      {filtered.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No characters found. Click &quot;Add Character&quot; to create
              one.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
