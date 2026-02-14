"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  updateQuestion,
  deleteQuestion,
  createQuestion,
  reorderQuestions,
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
  ChevronUp,
  ChevronDown,
  Plus,
  Trash2,
  Pencil,
  Eye,
  EyeOff,
} from "lucide-react";

interface Question {
  id: string;
  question: string;
  question_type: string;
  constraint_key: string | null;
  options: { label: string; value: string }[];
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function QuestionsClient({
  initialQuestions,
}: {
  initialQuestions: Question[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    id: "",
    question: "",
    question_type: "persona",
    constraint_key: "",
    options: [{ label: "", value: "" }],
  });

  const personaQuestions = initialQuestions.filter(
    (q) => q.question_type === "persona"
  );
  const constraintQuestions = initialQuestions.filter(
    (q) => q.question_type === "constraint"
  );

  function handleToggleActive(q: Question) {
    startTransition(async () => {
      await updateQuestion(q.id, { is_active: !q.is_active });
      router.refresh();
    });
  }

  function handleDelete(q: Question) {
    if (!confirm(`Delete question "${q.question}"?`)) return;
    startTransition(async () => {
      await deleteQuestion(q.id);
      router.refresh();
    });
  }

  function handleMoveUp(q: Question, list: Question[]) {
    const idx = list.findIndex((item) => item.id === q.id);
    if (idx <= 0) return;
    const updates = [
      { id: list[idx].id, sort_order: list[idx - 1].sort_order },
      { id: list[idx - 1].id, sort_order: list[idx].sort_order },
    ];
    startTransition(async () => {
      await reorderQuestions(updates);
      router.refresh();
    });
  }

  function handleMoveDown(q: Question, list: Question[]) {
    const idx = list.findIndex((item) => item.id === q.id);
    if (idx >= list.length - 1) return;
    const updates = [
      { id: list[idx].id, sort_order: list[idx + 1].sort_order },
      { id: list[idx + 1].id, sort_order: list[idx].sort_order },
    ];
    startTransition(async () => {
      await reorderQuestions(updates);
      router.refresh();
    });
  }

  function handleAddOption() {
    setNewQuestion((prev) => ({
      ...prev,
      options: [...prev.options, { label: "", value: "" }],
    }));
  }

  function handleRemoveOption(idx: number) {
    setNewQuestion((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== idx),
    }));
  }

  function handleOptionChange(
    idx: number,
    field: "label" | "value",
    val: string
  ) {
    setNewQuestion((prev) => ({
      ...prev,
      options: prev.options.map((o, i) =>
        i === idx ? { ...o, [field]: val } : o
      ),
    }));
  }

  function handleCreate() {
    if (!newQuestion.id || !newQuestion.question || newQuestion.options.length === 0)
      return;
    startTransition(async () => {
      await createQuestion({
        id: newQuestion.id,
        question: newQuestion.question,
        question_type: newQuestion.question_type,
        constraint_key: newQuestion.constraint_key || undefined,
        options: newQuestion.options.filter((o) => o.label && o.value),
        sort_order: initialQuestions.length,
      });
      setShowAddForm(false);
      setNewQuestion({
        id: "",
        question: "",
        question_type: "persona",
        constraint_key: "",
        options: [{ label: "", value: "" }],
      });
      router.refresh();
    });
  }

  function renderQuestionList(questions: Question[], title: string) {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        {questions.length === 0 && (
          <p className="text-sm text-muted-foreground">No questions yet.</p>
        )}
        {questions.map((q, idx) => (
          <Card
            key={q.id}
            className={q.is_active ? "" : "opacity-50"}
          >
            <CardContent className="flex items-start gap-4 pt-4">
              {/* Reorder buttons */}
              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleMoveUp(q, questions)}
                  disabled={isPending || idx === 0}
                >
                  <ChevronUp className="size-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleMoveDown(q, questions)}
                  disabled={isPending || idx === questions.length - 1}
                >
                  <ChevronDown className="size-3" />
                </Button>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{q.question}</span>
                  <Badge variant="outline" className="text-xs">
                    {q.id}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {q.options.map((opt: { label: string; value: string }, i: number) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {opt.value}: {opt.label.slice(0, 40)}
                      {opt.label.length > 40 ? "..." : ""}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleToggleActive(q)}
                  disabled={isPending}
                  title={q.is_active ? "Deactivate" : "Activate"}
                >
                  {q.is_active ? (
                    <Eye className="size-3" />
                  ) : (
                    <EyeOff className="size-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => router.push(`/onboarding/questions/${q.id}`)}
                  title="Edit"
                >
                  <Pencil className="size-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleDelete(q)}
                  disabled={isPending}
                  title="Delete"
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quiz Questions</h2>
          <p className="text-muted-foreground text-sm">
            Manage persona and constraint questions. Changes are reflected in the
            quiz immediately.
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="size-4" />
          Add Question
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Question</CardTitle>
            <CardDescription>
              Add a new quiz question. Persona questions affect scoring;
              constraint questions capture course logistics.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Question ID</label>
                <Input
                  value={newQuestion.id}
                  onChange={(e) =>
                    setNewQuestion((p) => ({ ...p, id: e.target.value }))
                  }
                  placeholder="e.g. feedback-style"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <select
                  className="w-full h-9 rounded-md border px-3 text-sm"
                  value={newQuestion.question_type}
                  onChange={(e) =>
                    setNewQuestion((p) => ({
                      ...p,
                      question_type: e.target.value,
                    }))
                  }
                >
                  <option value="persona">Persona</option>
                  <option value="constraint">Constraint</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Question Text</label>
              <Input
                value={newQuestion.question}
                onChange={(e) =>
                  setNewQuestion((p) => ({ ...p, question: e.target.value }))
                }
                placeholder="When a student..."
              />
            </div>

            {newQuestion.question_type === "constraint" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Constraint Key</label>
                <Input
                  value={newQuestion.constraint_key}
                  onChange={(e) =>
                    setNewQuestion((p) => ({
                      ...p,
                      constraint_key: e.target.value,
                    }))
                  }
                  placeholder="e.g. courseStartDate"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Options</label>
              {newQuestion.options.map((opt, idx) => (
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
                    disabled={newQuestion.options.length <= 1}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={handleAddOption}>
                <Plus className="size-3" /> Add Option
              </Button>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={isPending}>
                {isPending ? "Creating..." : "Create Question"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {renderQuestionList(personaQuestions, "Persona Questions")}
      {renderQuestionList(constraintQuestions, "Constraint Questions")}
    </div>
  );
}
