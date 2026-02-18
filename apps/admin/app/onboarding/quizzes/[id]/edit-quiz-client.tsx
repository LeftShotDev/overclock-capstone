"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateQuiz } from "@/lib/actions";
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
  ArrowLeft,
  Plus,
  Trash2,
  FileQuestion,
  Save,
} from "lucide-react";
import { AdminChat } from "@/components/admin-chat";

interface SettingOption {
  label: string;
  value: string;
}

interface SettingDef {
  id: string;
  name: string;
  description: string;
  type: string;
  options: SettingOption[];
}

interface Quiz {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  settings_schema: SettingDef[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

function generateId(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

export function EditQuizClient({
  quiz,
  questionCount,
}: {
  quiz: Quiz;
  questionCount: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(quiz.name);
  const [slug, setSlug] = useState(quiz.slug);
  const [description, setDescription] = useState(quiz.description ?? "");
  const [settings, setSettings] = useState<SettingDef[]>(
    quiz.settings_schema ?? []
  );

  function handleAddSetting() {
    setSettings((prev) => [
      ...prev,
      { id: "", name: "", description: "", type: "select", options: [] },
    ]);
  }

  function handleRemoveSetting(idx: number) {
    setSettings((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleSettingChange(
    idx: number,
    field: keyof SettingDef,
    value: string
  ) {
    setSettings((prev) =>
      prev.map((s, i) => {
        if (i !== idx) return s;
        const updated = { ...s, [field]: value };
        if (field === "name") {
          updated.id = generateId(value);
        }
        // Clear options when switching to toggle
        if (field === "type" && value === "toggle") {
          updated.options = [];
        }
        return updated;
      })
    );
  }

  function handleAddOption(settingIdx: number) {
    setSettings((prev) =>
      prev.map((s, i) =>
        i === settingIdx
          ? { ...s, options: [...s.options, { label: "", value: "" }] }
          : s
      )
    );
  }

  function handleRemoveOption(settingIdx: number, optIdx: number) {
    setSettings((prev) =>
      prev.map((s, i) =>
        i === settingIdx
          ? { ...s, options: s.options.filter((_, j) => j !== optIdx) }
          : s
      )
    );
  }

  function handleOptionChange(
    settingIdx: number,
    optIdx: number,
    field: "label" | "value",
    value: string
  ) {
    setSettings((prev) =>
      prev.map((s, i) =>
        i === settingIdx
          ? {
              ...s,
              options: s.options.map((o, j) =>
                j === optIdx ? { ...o, [field]: value } : o
              ),
            }
          : s
      )
    );
  }

  function handleSave() {
    startTransition(async () => {
      await updateQuiz(quiz.id, {
        name,
        slug,
        description: description || null,
        settings_schema: settings.filter((s) => s.name && s.id),
      });
      router.refresh();
    });
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => router.push("/onboarding/quizzes")}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{quiz.name}</h2>
            <p className="text-muted-foreground text-sm">
              Edit quiz details and settings schema
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/onboarding/quizzes/${quiz.id}/questions`)}
          >
            <FileQuestion className="size-4" />
            Questions ({questionCount})
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            <Save className="size-4" />
            {isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Quiz Details */}
      <Card>
        <CardHeader>
          <CardTitle>Quiz Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Slug</label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the platform..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Admin Chat Agent */}
      <AdminChat
        quizId={quiz.id}
        quizName={name}
        className="h-[400px]"
      />

      {/* Settings Schema */}
      <Card>
        <CardHeader>
          <CardTitle>Settings Schema</CardTitle>
          <CardDescription>
            Define the platform settings that instructors will configure. These
            settings are used by the AI to generate relevant quiz questions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {settings.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No settings defined. Add settings to describe the platform&apos;s
              configuration options.
            </p>
          )}

          {settings.map((setting, idx) => (
            <div
              key={idx}
              className="border rounded-lg p-4 space-y-3 relative"
            >
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {setting.id || "new-setting"}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleRemoveSetting(idx)}
                  title="Remove setting"
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Name</label>
                  <Input
                    value={setting.name}
                    onChange={(e) =>
                      handleSettingChange(idx, "name", e.target.value)
                    }
                    placeholder="e.g. Mastery Threshold"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Type</label>
                  <select
                    className="w-full h-8 rounded-md border px-2 text-sm"
                    value={setting.type}
                    onChange={(e) =>
                      handleSettingChange(idx, "type", e.target.value)
                    }
                  >
                    <option value="select">Select</option>
                    <option value="toggle">Toggle</option>
                    <option value="multi-select">Multi-select</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Description</label>
                  <Input
                    value={setting.description}
                    onChange={(e) =>
                      handleSettingChange(idx, "description", e.target.value)
                    }
                    placeholder="What this setting controls..."
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              {/* Options (for select and multi-select) */}
              {setting.type !== "toggle" && (
                <div className="space-y-2 pl-4 border-l-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Options
                  </label>
                  {setting.options.map((opt, optIdx) => (
                    <div key={optIdx} className="flex gap-2">
                      <Input
                        placeholder="Label"
                        value={opt.label}
                        onChange={(e) =>
                          handleOptionChange(idx, optIdx, "label", e.target.value)
                        }
                        className="flex-1 h-7 text-sm"
                      />
                      <Input
                        placeholder="Value"
                        value={opt.value}
                        onChange={(e) =>
                          handleOptionChange(idx, optIdx, "value", e.target.value)
                        }
                        className="w-28 h-7 text-sm"
                      />
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleRemoveOption(idx, optIdx)}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => handleAddOption(idx)}
                  >
                    <Plus className="size-3" /> Add Option
                  </Button>
                </div>
              )}
            </div>
          ))}

          <Button variant="outline" onClick={handleAddSetting}>
            <Plus className="size-4" /> Add Setting
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
