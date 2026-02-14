"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updatePersona, updateCharacter } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save } from "lucide-react";

interface Persona {
  id: string;
  name: string;
  description: string;
  result_message: string;
  mastery_threshold: number;
  message_personality: string;
  send_auto_messages: boolean;
  enabled_auto_messages: string[];
  show_study_plan_rollup: boolean;
  graded_participation_enabled: boolean;
}

interface Character {
  id: string;
  persona_id: string;
  name: string;
  work: string;
  tagline: string;
  description: string;
  voice_profile: Record<string, unknown>;
  sort_order: number;
}

export function EditPersonaClient({
  persona,
  characters,
}: {
  persona: Persona;
  characters: Character[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    name: persona.name,
    description: persona.description,
    result_message: persona.result_message,
    mastery_threshold: persona.mastery_threshold,
    message_personality: persona.message_personality,
    send_auto_messages: persona.send_auto_messages,
    enabled_auto_messages: persona.enabled_auto_messages,
    show_study_plan_rollup: persona.show_study_plan_rollup,
    graded_participation_enabled: persona.graded_participation_enabled,
  });

  const [editingChar, setEditingChar] = useState<string | null>(null);
  const [charForm, setCharForm] = useState<{
    name: string;
    work: string;
    tagline: string;
    description: string;
    voice_profile: string;
  }>({ name: "", work: "", tagline: "", description: "", voice_profile: "{}" });

  function handleSavePersona() {
    startTransition(async () => {
      await updatePersona(persona.id, form);
      router.refresh();
    });
  }

  function startEditChar(c: Character) {
    setEditingChar(c.id);
    setCharForm({
      name: c.name,
      work: c.work,
      tagline: c.tagline,
      description: c.description,
      voice_profile: JSON.stringify(c.voice_profile, null, 2),
    });
  }

  function handleSaveChar(charId: string) {
    let parsedVoice = {};
    try {
      parsedVoice = JSON.parse(charForm.voice_profile);
    } catch {
      alert("Invalid JSON in voice profile");
      return;
    }
    startTransition(async () => {
      await updateCharacter(charId, {
        name: charForm.name,
        work: charForm.work,
        tagline: charForm.tagline,
        description: charForm.description,
        voice_profile: parsedVoice,
      });
      setEditingChar(null);
      router.refresh();
    });
  }

  function toggleAutoMessage(msg: string) {
    setForm((prev) => ({
      ...prev,
      enabled_auto_messages: prev.enabled_auto_messages.includes(msg)
        ? prev.enabled_auto_messages.filter((m) => m !== msg)
        : [...prev.enabled_auto_messages, msg],
    }));
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/onboarding/personas")}
      >
        <ArrowLeft className="size-4" />
        Back to Personas
      </Button>

      {/* Persona Settings */}
      <Card>
        <CardHeader>
          <CardTitle>
            {persona.name}{" "}
            <Badge variant="outline" className="ml-2">
              {persona.id}
            </Badge>
          </CardTitle>
          <CardDescription>Edit persona settings and description</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mastery Threshold</label>
              <select
                className="w-full h-9 rounded-md border px-3 text-sm"
                value={form.mastery_threshold}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    mastery_threshold: Number(e.target.value),
                  }))
                }
              >
                <option value={70}>70%</option>
                <option value={80}>80%</option>
                <option value={90}>90%</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="w-full min-h-[80px] rounded-md border px-3 py-2 text-sm"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Result Message</label>
            <textarea
              className="w-full min-h-[80px] rounded-md border px-3 py-2 text-sm"
              value={form.result_message}
              onChange={(e) =>
                setForm((p) => ({ ...p, result_message: e.target.value }))
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Message Personality</label>
              <select
                className="w-full h-9 rounded-md border px-3 text-sm"
                value={form.message_personality}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    message_personality: e.target.value,
                  }))
                }
              >
                <option value="coach">Coach</option>
                <option value="advisor">Advisor</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Toggles</label>
            <div className="flex flex-wrap gap-3">
              {[
                {
                  key: "send_auto_messages" as const,
                  label: "Auto Messages",
                },
                {
                  key: "show_study_plan_rollup" as const,
                  label: "Study Plan Rollup",
                },
                {
                  key: "graded_participation_enabled" as const,
                  label: "Graded Participation",
                },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form[key]}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, [key]: e.target.checked }))
                    }
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Enabled Auto Messages
            </label>
            <div className="flex gap-2">
              {["help_hints", "good_game"].map((msg) => (
                <label key={msg} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.enabled_auto_messages.includes(msg)}
                    onChange={() => toggleAutoMessage(msg)}
                  />
                  {msg}
                </label>
              ))}
            </div>
          </div>

          <Button onClick={handleSavePersona} disabled={isPending}>
            <Save className="size-4" />
            {isPending ? "Saving..." : "Save Persona"}
          </Button>
        </CardContent>
      </Card>

      {/* Characters */}
      <Card>
        <CardHeader>
          <CardTitle>Characters ({characters.length})</CardTitle>
          <CardDescription>
            Teacher characters assigned to this persona
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {characters.map((c) => (
            <div
              key={c.id}
              className="border rounded-md p-3 space-y-2"
            >
              {editingChar === c.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Name</label>
                      <Input
                        value={charForm.name}
                        onChange={(e) =>
                          setCharForm((p) => ({
                            ...p,
                            name: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Work</label>
                      <Input
                        value={charForm.work}
                        onChange={(e) =>
                          setCharForm((p) => ({
                            ...p,
                            work: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Tagline</label>
                    <Input
                      value={charForm.tagline}
                      onChange={(e) =>
                        setCharForm((p) => ({
                          ...p,
                          tagline: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Description</label>
                    <textarea
                      className="w-full min-h-[60px] rounded-md border px-3 py-2 text-sm"
                      value={charForm.description}
                      onChange={(e) =>
                        setCharForm((p) => ({
                          ...p,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">
                      Voice Profile (JSON)
                    </label>
                    <textarea
                      className="w-full min-h-[120px] rounded-md border px-3 py-2 text-xs font-mono"
                      value={charForm.voice_profile}
                      onChange={(e) =>
                        setCharForm((p) => ({
                          ...p,
                          voice_profile: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSaveChar(c.id)}
                      disabled={isPending}
                    >
                      {isPending ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingChar(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-sm">{c.name}</span>
                    <span className="text-muted-foreground text-xs ml-2">
                      ({c.work})
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {c.tagline}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => startEditChar(c)}
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>
          ))}
          {characters.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No characters assigned.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
