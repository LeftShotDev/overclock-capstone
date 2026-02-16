"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  updateCharacter,
  createCharacter,
  deleteCharacter,
} from "@/lib/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  Pencil,
  X,
  Save,
  Sparkles,
  Loader2,
  ArrowLeft,
  RefreshCw,
  Info,
} from "lucide-react";

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
  personas: { name: string } | null;
}

interface Persona {
  id: string;
  name: string;
  description: string;
}

type WizardStep = "select-persona" | "suggestions" | "review";

interface Suggestion {
  name: string;
  work: string;
}

function generateId(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
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

  // Wizard state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<WizardStep>("select-persona");
  const [wizardPersona, setWizardPersona] = useState<string>("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedDetail, setSelectedDetail] = useState<{
    name: string;
    detail: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Manual create fallback
  const [showManualForm, setShowManualForm] = useState(false);

  // Review form (pre-filled by AI)
  const [reviewForm, setReviewForm] = useState({
    name: "",
    work: "",
    tagline: "",
    description: "",
    voice_profile: "{}",
    sex: "",
    ethnicity: "",
  });

  const [editForm, setEditForm] = useState({
    name: "",
    work: "",
    tagline: "",
    description: "",
    voice_profile: "{}",
    sex: "",
    ethnicity: "",
  });

  const [createForm, setCreateForm] = useState({
    name: "",
    persona_id: personas[0]?.id ?? "",
    work: "",
    tagline: "",
    description: "",
    voice_profile: "{}",
    sex: "",
    ethnicity: "",
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

  const selectedPersona = personas.find((p) => p.id === wizardPersona);

  // ── Wizard handlers ──

  function openWizard() {
    setWizardOpen(true);
    setWizardStep("select-persona");
    setWizardPersona("");
    setSuggestions([]);
    setSelectedDetail(null);
    setShowManualForm(false);
  }

  function closeWizard() {
    setWizardOpen(false);
    setWizardStep("select-persona");
    setWizardPersona("");
    setSuggestions([]);
    setSelectedDetail(null);
    setIsGenerating(false);
    setIsLoadingProfile(false);
    setShowManualForm(false);
  }

  async function handleSelectPersona(personaId: string) {
    setWizardPersona(personaId);
    setWizardStep("suggestions");
    setSuggestions([]);
    setSelectedDetail(null);
    await fetchSuggestions(personaId);
  }

  async function fetchSuggestions(personaId?: string) {
    const pid = personaId || wizardPersona;
    const persona = personas.find((p) => p.id === pid);
    if (!persona) return;

    setIsGenerating(true);
    setSuggestions([]);
    setSelectedDetail(null);

    try {
      const existingNames = initialCharacters.map((c) => c.name);
      const res = await fetch("/api/generate-character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: "suggestions",
          personaName: persona.name,
          personaDescription: persona.description,
          existingCharacters: existingNames,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to generate suggestions");
        return;
      }

      const data = await res.json();
      setSuggestions(data.suggestions ?? []);
    } catch {
      alert("Failed to generate suggestions. Check your API key.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleFetchDetail(suggestion: Suggestion) {
    if (isLoadingDetail) return;
    setIsLoadingDetail(suggestion.name);
    setSelectedDetail(null);

    try {
      const res = await fetch("/api/generate-character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: "details",
          name: suggestion.name,
          work: suggestion.work,
          personaName: selectedPersona?.name ?? "",
        }),
      });

      if (!res.ok) {
        alert("Failed to fetch details");
        return;
      }

      const data = await res.json();
      setSelectedDetail({ name: suggestion.name, detail: data.details });
    } catch {
      alert("Failed to fetch details");
    } finally {
      setIsLoadingDetail(null);
    }
  }

  async function handleSelectSuggestion(suggestion: Suggestion) {
    if (!selectedPersona) return;
    setIsLoadingProfile(true);

    // Gather existing voice profiles for this persona
    const personaChars = initialCharacters.filter(
      (c) => c.persona_id === wizardPersona
    );
    const existingProfiles = personaChars.map((c) => ({
      name: c.name,
      voice_profile: c.voice_profile,
    }));

    try {
      const res = await fetch("/api/generate-character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: "profile",
          name: suggestion.name,
          work: suggestion.work,
          personaName: selectedPersona.name,
          personaDescription: selectedPersona.description,
          existingVoiceProfiles: JSON.stringify(existingProfiles),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to generate profile");
        return;
      }

      const data = await res.json();
      const profile = data.profile;

      setReviewForm({
        name: suggestion.name,
        work: suggestion.work,
        tagline: profile.tagline ?? "",
        description: profile.description ?? "",
        voice_profile: JSON.stringify(profile.voice_profile ?? {}, null, 2),
        sex: profile.sex ?? "",
        ethnicity: profile.ethnicity ?? "",
      });

      setWizardStep("review");
    } catch {
      alert("Failed to generate profile. Check your API key.");
    } finally {
      setIsLoadingProfile(false);
    }
  }

  function handleCreateFromWizard() {
    if (!reviewForm.name || !wizardPersona) return;

    let parsedVoice: Record<string, unknown> = {};
    try {
      parsedVoice = JSON.parse(reviewForm.voice_profile);
    } catch {
      alert("Invalid JSON in voice profile");
      return;
    }

    const id = generateId(reviewForm.name);
    const samePersona = initialCharacters.filter(
      (c) => c.persona_id === wizardPersona
    );
    const maxOrder = samePersona.reduce(
      (max, c) => Math.max(max, c.sort_order),
      -1
    );

    startTransition(async () => {
      await createCharacter({
        id,
        persona_id: wizardPersona,
        name: reviewForm.name,
        work: reviewForm.work,
        tagline: reviewForm.tagline,
        description: reviewForm.description,
        voice_profile: parsedVoice,
        sort_order: maxOrder + 1,
        sex: reviewForm.sex || undefined,
        ethnicity: reviewForm.ethnicity || undefined,
      });
      router.refresh();
      // Offer to add another
      setWizardStep("suggestions");
      setReviewForm({
        name: "",
        work: "",
        tagline: "",
        description: "",
        voice_profile: "{}",
        sex: "",
        ethnicity: "",
      });
      await fetchSuggestions();
    });
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
      });
      setEditingId(null);
      router.refresh();
    });
  }

  function handleManualCreate() {
    if (!createForm.name || !createForm.persona_id) return;

    let parsedVoice: Record<string, unknown> = {};
    try {
      parsedVoice = JSON.parse(createForm.voice_profile);
    } catch {
      alert("Invalid JSON in voice profile");
      return;
    }

    const id = generateId(createForm.name);
    const samePersona = initialCharacters.filter(
      (c) => c.persona_id === createForm.persona_id
    );
    const maxOrder = samePersona.reduce(
      (max, c) => Math.max(max, c.sort_order),
      -1
    );

    startTransition(async () => {
      await createCharacter({
        id,
        persona_id: createForm.persona_id,
        name: createForm.name,
        work: createForm.work,
        tagline: createForm.tagline,
        description: createForm.description,
        voice_profile: parsedVoice,
        sort_order: maxOrder + 1,
        sex: createForm.sex || undefined,
        ethnicity: createForm.ethnicity || undefined,
      });
      setShowManualForm(false);
      setCreateForm({
        name: "",
        persona_id: personas[0]?.id ?? "",
        work: "",
        tagline: "",
        description: "",
        voice_profile: "{}",
        sex: "",
        ethnicity: "",
      });
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

  // ── Wizard UI ──

  function renderWizard() {
    if (!wizardOpen) return null;

    // Step 1: Select Persona
    if (wizardStep === "select-persona") {
      return (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="size-4 text-violet-500" />
                  AI Character Wizard
                </CardTitle>
                <CardDescription>
                  Select a persona to generate character suggestions.
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon-xs" onClick={closeWizard}>
                <X className="size-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {personas.map((p) => {
                const count = initialCharacters.filter(
                  (c) => c.persona_id === p.id
                ).length;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPersona(p.id)}
                    className="border rounded-lg p-3 text-left hover:border-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-950/20 transition-colors"
                  >
                    <span className="font-medium text-sm block">{p.name}</span>
                    <span className="text-xs text-muted-foreground block mt-1 line-clamp-2">
                      {p.description}
                    </span>
                    <Badge variant="secondary" className="text-[10px] mt-2">
                      {count} characters
                    </Badge>
                  </button>
                );
              })}
            </div>
            <div className="pt-2 border-t">
              <button
                onClick={() => {
                  setWizardOpen(false);
                  setShowManualForm(true);
                }}
                className="text-xs text-muted-foreground hover:text-foreground underline"
              >
                Create manually instead
              </button>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Step 2: Suggestions
    if (wizardStep === "suggestions") {
      return (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="size-4 text-violet-500" />
                  Pick a Character
                  <Badge variant="outline" className="text-xs ml-1">
                    {selectedPersona?.name}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {isGenerating
                    ? "Generating character suggestions..."
                    : isLoadingProfile
                    ? "Generating full profile..."
                    : "Click a character to generate their full profile, or get more details first."}
                </CardDescription>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => {
                    setWizardStep("select-persona");
                    setSuggestions([]);
                    setSelectedDetail(null);
                  }}
                  title="Back to persona selection"
                >
                  <ArrowLeft className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={closeWizard}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isGenerating && (
              <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
                <span className="text-sm">Thinking up characters...</span>
              </div>
            )}

            {isLoadingProfile && (
              <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
                <span className="text-sm">
                  Building full profile...
                </span>
              </div>
            )}

            {!isGenerating && !isLoadingProfile && suggestions.length > 0 && (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {suggestions.map((s) => (
                    <div
                      key={`${s.name}-${s.work}`}
                      className="border rounded-lg p-3 space-y-2 hover:border-violet-400 transition-colors"
                    >
                      <div>
                        <span className="font-medium text-sm block">
                          {s.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {s.work}
                        </span>
                      </div>

                      {selectedDetail?.name === s.name && (
                        <p className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
                          {selectedDetail.detail}
                        </p>
                      )}

                      <div className="flex gap-1.5">
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => handleFetchDetail(s)}
                          disabled={isLoadingDetail === s.name}
                          className="flex-1"
                        >
                          {isLoadingDetail === s.name ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            <Info className="size-3" />
                          )}
                          Details
                        </Button>
                        <Button
                          size="xs"
                          onClick={() => handleSelectSuggestion(s)}
                          className="flex-1"
                        >
                          Select
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchSuggestions()}
                    disabled={isGenerating}
                  >
                    <RefreshCw className="size-3" />
                    Regenerate
                  </Button>
                  <button
                    onClick={() => {
                      setWizardOpen(false);
                      setShowManualForm(true);
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground underline"
                  >
                    Create manually instead
                  </button>
                </div>
              </>
            )}

            {!isGenerating && !isLoadingProfile && suggestions.length === 0 && (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">
                  No suggestions yet.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => fetchSuggestions()}
                >
                  <Sparkles className="size-3" />
                  Generate Suggestions
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    // Step 3: Review & Edit
    if (wizardStep === "review") {
      return (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="size-4 text-violet-500" />
                  Review Profile
                  <Badge variant="outline" className="text-xs ml-1">
                    {selectedPersona?.name}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Review and edit the AI-generated profile before creating.
                </CardDescription>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => {
                    setWizardStep("suggestions");
                  }}
                  title="Back to suggestions"
                >
                  <ArrowLeft className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={closeWizard}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={reviewForm.name}
                  onChange={(e) =>
                    setReviewForm((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Work</label>
                <Input
                  value={reviewForm.work}
                  onChange={(e) =>
                    setReviewForm((p) => ({ ...p, work: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Sex</label>
                <select
                  className="w-full h-9 rounded-md border px-3 text-sm"
                  value={reviewForm.sex}
                  onChange={(e) =>
                    setReviewForm((p) => ({ ...p, sex: e.target.value }))
                  }
                >
                  <option value="">Not set</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Ethnicity</label>
                <select
                  className="w-full h-9 rounded-md border px-3 text-sm"
                  value={reviewForm.ethnicity}
                  onChange={(e) =>
                    setReviewForm((p) => ({
                      ...p,
                      ethnicity: e.target.value,
                    }))
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Tagline</label>
              <Input
                value={reviewForm.tagline}
                onChange={(e) =>
                  setReviewForm((p) => ({ ...p, tagline: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="w-full min-h-[60px] rounded-md border px-3 py-2 text-sm"
                value={reviewForm.description}
                onChange={(e) =>
                  setReviewForm((p) => ({
                    ...p,
                    description: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Voice Profile (JSON)
              </label>
              <textarea
                className="w-full min-h-[120px] rounded-md border px-3 py-2 text-xs font-mono"
                value={reviewForm.voice_profile}
                onChange={(e) =>
                  setReviewForm((p) => ({
                    ...p,
                    voice_profile: e.target.value,
                  }))
                }
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCreateFromWizard}
                disabled={isPending}
              >
                <Save className="size-4" />
                {isPending ? "Creating..." : "Create Character"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setWizardStep("suggestions")}
              >
                Pick a Different Character
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return null;
  }

  // ── Manual create form ──

  function renderManualForm() {
    if (!showManualForm) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle>New Character (Manual)</CardTitle>
          <CardDescription>
            Manually fill in all character fields.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g. Ms. Frizzle"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Persona</label>
              <select
                className="w-full h-9 rounded-md border px-3 text-sm"
                value={createForm.persona_id}
                onChange={(e) =>
                  setCreateForm((p) => ({
                    ...p,
                    persona_id: e.target.value,
                  }))
                }
              >
                {personas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Work</label>
            <Input
              value={createForm.work}
              onChange={(e) =>
                setCreateForm((p) => ({ ...p, work: e.target.value }))
              }
              placeholder="e.g. The Magic School Bus"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Sex</label>
              <select
                className="w-full h-9 rounded-md border px-3 text-sm"
                value={createForm.sex}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, sex: e.target.value }))
                }
              >
                <option value="">Not set</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ethnicity</label>
              <select
                className="w-full h-9 rounded-md border px-3 text-sm"
                value={createForm.ethnicity}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, ethnicity: e.target.value }))
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
          <div className="space-y-2">
            <label className="text-sm font-medium">Tagline</label>
            <Input
              value={createForm.tagline}
              onChange={(e) =>
                setCreateForm((p) => ({ ...p, tagline: e.target.value }))
              }
              placeholder='"Take chances, make mistakes, get messy!"'
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="w-full min-h-[60px] rounded-md border px-3 py-2 text-sm"
              value={createForm.description}
              onChange={(e) =>
                setCreateForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Brief description of the character's teaching style..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Voice Profile (JSON)
            </label>
            <textarea
              className="w-full min-h-[120px] rounded-md border px-3 py-2 text-xs font-mono"
              value={createForm.voice_profile}
              onChange={(e) =>
                setCreateForm((p) => ({
                  ...p,
                  voice_profile: e.target.value,
                }))
              }
              placeholder='{"tone": "...", "sentence_style": "...", "vocabulary": "...", "signature_moves": [...], "avoids": [...], "example_voice": "..."}'
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleManualCreate} disabled={isPending}>
              {isPending ? "Creating..." : "Create Character"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowManualForm(false)}
            >
              Cancel
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
        <Button onClick={openWizard}>
          <Plus className="size-4" />
          Add Character
        </Button>
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

      {/* AI Wizard */}
      {renderWizard()}

      {/* Manual create form fallback */}
      {renderManualForm()}

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

      {filtered.length === 0 && !wizardOpen && !showManualForm && (
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
