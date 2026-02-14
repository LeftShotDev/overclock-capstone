"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateQuestion } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

interface Question {
  id: string;
  question: string;
  question_type: string;
  constraint_key: string | null;
  options: { label: string; value: string }[];
  sort_order: number;
  is_active: boolean;
}

export function EditQuestionClient({ question }: { question: Question }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    question: question.question,
    question_type: question.question_type,
    constraint_key: question.constraint_key || "",
    options: question.options as { label: string; value: string }[],
  });

  function handleOptionChange(
    idx: number,
    field: "label" | "value",
    val: string
  ) {
    setForm((prev) => ({
      ...prev,
      options: prev.options.map((o, i) =>
        i === idx ? { ...o, [field]: val } : o
      ),
    }));
  }

  function handleAddOption() {
    setForm((prev) => ({
      ...prev,
      options: [...prev.options, { label: "", value: "" }],
    }));
  }

  function handleRemoveOption(idx: number) {
    setForm((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== idx),
    }));
  }

  function handleSave() {
    startTransition(async () => {
      await updateQuestion(question.id, {
        question: form.question,
        question_type: form.question_type,
        constraint_key:
          form.question_type === "constraint"
            ? form.constraint_key || null
            : null,
        options: form.options.filter((o) => o.label && o.value),
      });
      router.push("/questions");
    });
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/questions")}
      >
        <ArrowLeft className="size-4" />
        Back to Questions
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Question</CardTitle>
          <CardDescription>
            ID: <code className="text-xs bg-muted px-1 py-0.5 rounded">{question.id}</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <select
              className="w-full h-9 rounded-md border px-3 text-sm"
              value={form.question_type}
              onChange={(e) =>
                setForm((p) => ({ ...p, question_type: e.target.value }))
              }
            >
              <option value="persona">Persona</option>
              <option value="constraint">Constraint</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Question Text</label>
            <Input
              value={form.question}
              onChange={(e) =>
                setForm((p) => ({ ...p, question: e.target.value }))
              }
            />
          </div>

          {form.question_type === "constraint" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Constraint Key</label>
              <Input
                value={form.constraint_key}
                onChange={(e) =>
                  setForm((p) => ({ ...p, constraint_key: e.target.value }))
                }
                placeholder="e.g. courseStartDate"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Options</label>
            {form.options.map((opt, idx) => (
              <div key={idx} className="flex gap-2">
                <Input
                  placeholder="Label"
                  value={opt.label}
                  onChange={(e) =>
                    handleOptionChange(idx, "label", e.target.value)
                  }
                  className="flex-1"
                />
                <Input
                  placeholder="Value"
                  value={opt.value}
                  onChange={(e) =>
                    handleOptionChange(idx, "value", e.target.value)
                  }
                  className="w-32"
                />
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleRemoveOption(idx)}
                  disabled={form.options.length <= 1}
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={handleAddOption}>
              <Plus className="size-3" /> Add Option
            </Button>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/questions")}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
