"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCharacter } from "@/lib/actions";
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
  Sparkles,
  Loader2,
  ArrowLeft,
  RefreshCw,
  Info,
  Save,
  X,
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

type WizardStep = "select-persona" | "suggestions" | "review" | "manual";

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

export function NewCharacterWizard({
  initialCharacters,
  personas,
}: {
  initialCharacters: Character[];
  personas: Persona[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

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

  // Manual form
  const [manualForm, setManualForm] = useState({
    name: "",
    persona_id: personas[0]?.id ?? "",
    work: "",
    tagline: "",
    description: "",
    voice_profile: "{}",
    sex: "",
    ethnicity: "",
  });

  const selectedPersona = personas.find((p) => p.id === wizardPersona);

  // ── Wizard handlers ──

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
      alert("Failed to generate suggestions. Check your ANTHROPIC_API_KEY.");
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
      alert("Failed to generate profile. Check your ANTHROPIC_API_KEY.");
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
      // Loop back to suggestions for another
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
      router.refresh();
      await fetchSuggestions();
    });
  }

  function handleManualCreate() {
    if (!manualForm.name || !manualForm.persona_id) return;

    let parsedVoice: Record<string, unknown> = {};
    try {
      parsedVoice = JSON.parse(manualForm.voice_profile);
    } catch {
      alert("Invalid JSON in voice profile");
      return;
    }

    const id = generateId(manualForm.name);
    const samePersona = initialCharacters.filter(
      (c) => c.persona_id === manualForm.persona_id
    );
    const maxOrder = samePersona.reduce(
      (max, c) => Math.max(max, c.sort_order),
      -1
    );

    startTransition(async () => {
      await createCharacter({
        id,
        persona_id: manualForm.persona_id,
        name: manualForm.name,
        work: manualForm.work,
        tagline: manualForm.tagline,
        description: manualForm.description,
        voice_profile: parsedVoice,
        sort_order: maxOrder + 1,
        sex: manualForm.sex || undefined,
        ethnicity: manualForm.ethnicity || undefined,
      });
      router.push("/onboarding/characters");
      router.refresh();
    });
  }

  // ── Step renderers ──

  // Step 1: Select Persona
  if (wizardStep === "select-persona") {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Add New Character
            </h2>
            <p className="text-muted-foreground text-sm">
              Select a persona to generate AI character suggestions, or create
              one manually.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/onboarding/characters")}
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-violet-500" />
              Choose a Persona
            </CardTitle>
            <CardDescription>
              Which persona should this character belong to?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                onClick={() => setWizardStep("manual")}
                className="text-xs text-muted-foreground hover:text-foreground underline"
              >
                Create manually instead
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 2: Suggestions
  if (wizardStep === "suggestions") {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Add New Character
            </h2>
            <p className="text-muted-foreground text-sm">
              {isGenerating
                ? "Generating character suggestions..."
                : isLoadingProfile
                ? "Generating full profile..."
                : "Pick a character to generate their full profile, or get details first."}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setWizardStep("select-persona");
              setSuggestions([]);
              setSelectedDetail(null);
            }}
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-violet-500" />
              Pick a Character
              <Badge variant="outline" className="text-xs ml-1">
                {selectedPersona?.name}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isGenerating && (
              <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
                <span className="text-sm">Thinking up characters...</span>
              </div>
            )}

            {isLoadingProfile && (
              <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
                <span className="text-sm">Building full profile...</span>
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
                    onClick={() => setWizardStep("manual")}
                    className="text-xs text-muted-foreground hover:text-foreground underline"
                  >
                    Create manually instead
                  </button>
                </div>
              </>
            )}

            {!isGenerating &&
              !isLoadingProfile &&
              suggestions.length === 0 && (
                <div className="text-center py-8">
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
      </div>
    );
  }

  // Step 3: Review & Edit
  if (wizardStep === "review") {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Add New Character
            </h2>
            <p className="text-muted-foreground text-sm">
              Review and edit the AI-generated profile before saving.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setWizardStep("suggestions")}
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-violet-500" />
              Review Profile
              <Badge variant="outline" className="text-xs ml-1">
                {selectedPersona?.name}
              </Badge>
            </CardTitle>
            <CardDescription>
              Edit any fields before creating this character.
            </CardDescription>
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
      </div>
    );
  }

  // Manual create form
  if (wizardStep === "manual") {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Add New Character
            </h2>
            <p className="text-muted-foreground text-sm">
              Manually fill in all character fields.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setWizardStep("select-persona")}
          >
            <ArrowLeft className="size-4" />
            Back to AI Wizard
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Manual Character Entry</CardTitle>
            <CardDescription>
              Fill in all fields to create a new character.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={manualForm.name}
                  onChange={(e) =>
                    setManualForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g. Ms. Frizzle"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Persona</label>
                <select
                  className="w-full h-9 rounded-md border px-3 text-sm"
                  value={manualForm.persona_id}
                  onChange={(e) =>
                    setManualForm((p) => ({
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
                value={manualForm.work}
                onChange={(e) =>
                  setManualForm((p) => ({ ...p, work: e.target.value }))
                }
                placeholder="e.g. The Magic School Bus"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Sex</label>
                <select
                  className="w-full h-9 rounded-md border px-3 text-sm"
                  value={manualForm.sex}
                  onChange={(e) =>
                    setManualForm((p) => ({ ...p, sex: e.target.value }))
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
                  value={manualForm.ethnicity}
                  onChange={(e) =>
                    setManualForm((p) => ({
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
                value={manualForm.tagline}
                onChange={(e) =>
                  setManualForm((p) => ({ ...p, tagline: e.target.value }))
                }
                placeholder='"Take chances, make mistakes, get messy!"'
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="w-full min-h-[60px] rounded-md border px-3 py-2 text-sm"
                value={manualForm.description}
                onChange={(e) =>
                  setManualForm((p) => ({
                    ...p,
                    description: e.target.value,
                  }))
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
                value={manualForm.voice_profile}
                onChange={(e) =>
                  setManualForm((p) => ({
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
                onClick={() => router.push("/onboarding/characters")}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
