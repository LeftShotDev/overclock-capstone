"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createQuiz, updateQuiz, deleteQuiz } from "@/lib/actions";
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
import { Plus, Trash2, Eye, EyeOff, Settings, FileQuestion } from "lucide-react";

interface Quiz {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  settings_schema: unknown[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  question_count: number;
  draft_count: number;
}

export function QuizzesClient({
  initialQuizzes,
}: {
  initialQuizzes: Quiz[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newQuiz, setNewQuiz] = useState({
    name: "",
    slug: "",
    description: "",
  });

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function handleNameChange(name: string) {
    setNewQuiz((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  }

  function handleCreate() {
    if (!newQuiz.name || !newQuiz.slug) return;
    startTransition(async () => {
      const quiz = await createQuiz({
        name: newQuiz.name,
        slug: newQuiz.slug,
        description: newQuiz.description || undefined,
      });
      setShowCreateForm(false);
      setNewQuiz({ name: "", slug: "", description: "" });
      router.push(`/quizzes/${quiz.id}`);
    });
  }

  function handleToggleActive(quiz: Quiz) {
    startTransition(async () => {
      await updateQuiz(quiz.id, { is_active: !quiz.is_active });
      router.refresh();
    });
  }

  function handleDelete(quiz: Quiz) {
    if (!confirm(`Delete quiz "${quiz.name}"? This will also delete all its questions.`))
      return;
    startTransition(async () => {
      await deleteQuiz(quiz.id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quizzes</h2>
          <p className="text-muted-foreground text-sm">
            Create and manage individual quizzes with custom settings schemas.
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="size-4" />
          Create Quiz
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Quiz</CardTitle>
            <CardDescription>
              Create a quiz for a specific platform or product. You&apos;ll define
              the settings schema and generate questions next.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Quiz Name</label>
              <Input
                value={newQuiz.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Acme LMS Settings Quiz"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Slug</label>
              <Input
                value={newQuiz.slug}
                onChange={(e) =>
                  setNewQuiz((p) => ({ ...p, slug: e.target.value }))
                }
                placeholder="e.g. acme-lms"
              />
              <p className="text-xs text-muted-foreground">
                URL-friendly identifier. Auto-generated from name.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                value={newQuiz.description}
                onChange={(e) =>
                  setNewQuiz((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Brief description of the platform and its settings..."
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={isPending}>
                {isPending ? "Creating..." : "Create Quiz"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {initialQuizzes.length === 0 && !showCreateForm && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No quizzes yet. Click &quot;Create Quiz&quot; to get started.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {initialQuizzes.map((quiz) => (
          <Card
            key={quiz.id}
            className={quiz.is_active ? "" : "opacity-50"}
          >
            <CardContent className="flex items-start gap-4 pt-4">
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{quiz.name}</span>
                  <Badge variant="outline" className="text-xs">
                    /{quiz.slug}
                  </Badge>
                  {!quiz.is_active && (
                    <Badge variant="secondary" className="text-xs">
                      Inactive
                    </Badge>
                  )}
                </div>
                {quiz.description && (
                  <p className="text-sm text-muted-foreground">
                    {quiz.description}
                  </p>
                )}
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span>{quiz.settings_schema.length} settings</span>
                  <span>
                    {quiz.question_count} questions
                    {quiz.draft_count > 0 && (
                      <span className="text-yellow-600">
                        {" "}
                        ({quiz.draft_count} drafts)
                      </span>
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => router.push(`/quizzes/${quiz.id}`)}
                  title="Edit Settings"
                >
                  <Settings className="size-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() =>
                    router.push(`/quizzes/${quiz.id}/questions`)
                  }
                  title="Questions"
                >
                  <FileQuestion className="size-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleToggleActive(quiz)}
                  disabled={isPending}
                  title={quiz.is_active ? "Deactivate" : "Activate"}
                >
                  {quiz.is_active ? (
                    <Eye className="size-3" />
                  ) : (
                    <EyeOff className="size-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleDelete(quiz)}
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
    </div>
  );
}
