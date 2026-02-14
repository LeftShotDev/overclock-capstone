"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  approveQuizQuestion,
  deleteQuizQuestion,
  createQuizQuestion,
  updateQuestion,
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
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  Plus,
  Trash2,
  Check,
  Pencil,
  Sparkles,
  Loader2,
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
  is_draft: boolean;
  quiz_id: string | null;
  created_at: string;
  updated_at: string;
}

interface SettingDef {
  id: string;
  name: string;
  description: string;
  type: string;
  options: { label: string; value: string }[];
}

interface Quiz {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  settings_schema: SettingDef[];
  is_active: boolean;
}

export function QuizQuestionsClient({
  quiz,
  initialQuestions,
}: {
  quiz: Quiz;
  initialQuestions: Question[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    id: "",
    question: "",
    options: [{ label: "", value: "" }],
  });

  const drafts = initialQuestions.filter((q) => q.is_draft);
  const approved = initialQuestions.filter((q) => !q.is_draft);

  async function handleGenerate() {
    if (quiz.settings_schema.length === 0) {
      alert("Add settings to the quiz before generating questions.");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: quiz.id,
          settingsSchema: quiz.settings_schema,
          quizName: quiz.name,
          quizDescription: quiz.description,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to generate questions");
        return;
      }

      router.refresh();
    } catch {
      alert("Failed to generate questions. Check your API key.");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleApprove(q: Question) {
    startTransition(async () => {
      await approveQuizQuestion(q.id, quiz.id);
      router.refresh();
    });
  }

  function handleDelete(q: Question) {
    if (!confirm(`Delete question "${q.question.slice(0, 50)}..."?`)) return;
    startTransition(async () => {
      await deleteQuizQuestion(q.id, quiz.id);
      router.refresh();
    });
  }

  function handleToggleActive(q: Question) {
    startTransition(async () => {
      await updateQuestion(q.id, { is_active: !q.is_active });
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
      await createQuizQuestion({
        id: `${quiz.id.slice(0, 8)}-${newQuestion.id}`,
        question: newQuestion.question,
        question_type: "persona",
        options: newQuestion.options.filter((o) => o.label && o.value),
        sort_order: initialQuestions.length,
        quiz_id: quiz.id,
      });
      setShowAddForm(false);
      setNewQuestion({ id: "", question: "", options: [{ label: "", value: "" }] });
      router.refresh();
    });
  }

  function renderQuestion(q: Question, list: Question[], idx: number) {
    return (
      <Card
        key={q.id}
        className={`${!q.is_active ? "opacity-50" : ""} ${q.is_draft ? "border-yellow-300 bg-yellow-50/50 dark:bg-yellow-950/10" : ""}`}
      >
        <CardContent className="flex items-start gap-4 pt-4">
          {/* Reorder buttons (only for approved) */}
          {!q.is_draft && (
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => handleMoveUp(q, list)}
                disabled={isPending || idx === 0}
              >
                <ChevronUp className="size-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => handleMoveDown(q, list)}
                disabled={isPending || idx === list.length - 1}
              >
                <ChevronDown className="size-3" />
              </Button>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{q.question}</span>
              {q.is_draft ? (
                <Badge className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
                  Draft
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs text-green-700 border-green-300">
                  Active
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {q.options.map((opt: { label: string; value: string }, i: number) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {opt.value}: {opt.label.slice(0, 50)}
                  {opt.label.length > 50 ? "..." : ""}
                </Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {q.is_draft && (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => handleApprove(q)}
                disabled={isPending}
                title="Approve"
                className="text-green-600 hover:text-green-700"
              >
                <Check className="size-3" />
              </Button>
            )}
            {!q.is_draft && (
              <>
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
              </>
            )}
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
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => router.push(`/onboarding/quizzes/${quiz.id}`)}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {quiz.name} — Questions
            </h2>
            <p className="text-muted-foreground text-sm">
              Generate AI questions from settings or add manually.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus className="size-4" />
            Add Manual
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || quiz.settings_schema.length === 0}
          >
            {isGenerating ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Generate Questions
              </>
            )}
          </Button>
        </div>
      </div>

      {quiz.settings_schema.length === 0 && (
        <Card>
          <CardContent className="py-6 text-center">
            <p className="text-muted-foreground text-sm">
              Add settings to the quiz first before generating questions.{" "}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => router.push(`/onboarding/quizzes/${quiz.id}`)}
              >
                Edit settings →
              </Button>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Manual add form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Question</CardTitle>
            <CardDescription>
              Manually create a question for this quiz.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <label className="text-sm font-medium">Question Text</label>
              <Input
                value={newQuestion.question}
                onChange={(e) =>
                  setNewQuestion((p) => ({ ...p, question: e.target.value }))
                }
                placeholder="When a student..."
              />
            </div>
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

      {/* Draft questions */}
      {drafts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="size-4 text-yellow-600" />
            Draft Questions ({drafts.length})
          </h3>
          <p className="text-sm text-muted-foreground">
            AI-generated questions pending your review. Approve to include in
            the quiz.
          </p>
          {drafts.map((q, idx) => renderQuestion(q, drafts, idx))}
        </div>
      )}

      {/* Approved questions */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">
          Approved Questions ({approved.length})
        </h3>
        {approved.length === 0 && drafts.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No questions yet. Generate from settings or add manually.
          </p>
        )}
        {approved.map((q, idx) => renderQuestion(q, approved, idx))}
      </div>
    </div>
  );
}
