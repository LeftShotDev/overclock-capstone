"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

const PERSONA_COLORS: Record<string, string> = {
  explorer: "bg-blue-500",
  nurturer: "bg-green-500",
  mentor: "bg-yellow-500",
  mastery_coach: "bg-orange-500",
  strategist: "bg-purple-500",
};

const PERSONA_LABELS: Record<string, string> = {
  explorer: "Explorer",
  nurturer: "Nurturer",
  mentor: "Mentor",
  mastery_coach: "Mastery Coach",
  strategist: "Strategist",
};

interface QuizResult {
  id: string;
  persona_id: string;
  character_id: string | null;
  applied_settings: Record<string, unknown>;
  quiz_answers: unknown[];
  constraint_answers: unknown[];
  syllabus_data: unknown | null;
  access_code: string | null;
  created_at: string;
  personas: { name: string } | null;
  characters: { name: string } | null;
}

interface Stats {
  total: number;
  distribution: Record<string, number>;
}

export function ResultsClient({
  initialResults,
  total,
  stats,
}: {
  initialResults: QuizResult[];
  total: number;
  stats: Stats;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const maxCount = Math.max(...Object.values(stats.distribution), 1);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Quiz Results</h2>
        <p className="text-muted-foreground text-sm">
          {total} total quiz completions
        </p>
      </div>

      {/* Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Persona Distribution</CardTitle>
          <CardDescription>
            Breakdown of quiz results by persona type
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(PERSONA_LABELS).map(([id, label]) => {
            const count = stats.distribution[id] || 0;
            const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
            return (
              <div key={id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{label}</span>
                  <span className="text-muted-foreground">
                    {count} ({pct.toFixed(0)}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${PERSONA_COLORS[id]}`}
                    style={{
                      width: `${maxCount > 0 ? (count / maxCount) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
          {stats.total === 0 && (
            <p className="text-sm text-muted-foreground">
              No quiz results yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {initialResults.length === 0 ? (
            <p className="text-sm text-muted-foreground">No results to show.</p>
          ) : (
            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 text-xs font-medium text-muted-foreground px-3 py-2">
                <span>Date</span>
                <span>Persona</span>
                <span>Character</span>
                <span className="w-8" />
              </div>
              {initialResults.map((r) => (
                <div key={r.id}>
                  <div
                    className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 items-center px-3 py-2 rounded-md hover:bg-muted/50 cursor-pointer"
                    onClick={() =>
                      setExpandedId(expandedId === r.id ? null : r.id)
                    }
                  >
                    <span className="text-sm">
                      {new Date(r.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <Badge variant="secondary">
                      {r.personas?.name || r.persona_id}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {r.characters?.name || r.character_id || "—"}
                    </span>
                    <Button variant="ghost" size="icon-xs">
                      {expandedId === r.id ? (
                        <ChevronUp className="size-3" />
                      ) : (
                        <ChevronDown className="size-3" />
                      )}
                    </Button>
                  </div>
                  {expandedId === r.id && (
                    <div className="px-3 pb-3 pt-1 space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">
                            Quiz Answers
                          </span>
                          <pre className="text-xs bg-muted rounded p-2 mt-1 overflow-x-auto">
                            {JSON.stringify(r.quiz_answers, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">
                            Applied Settings
                          </span>
                          <pre className="text-xs bg-muted rounded p-2 mt-1 overflow-x-auto">
                            {JSON.stringify(r.applied_settings, null, 2)}
                          </pre>
                        </div>
                      </div>
                      {r.access_code && (
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">
                            Access Code:{" "}
                          </span>
                          <Badge variant="outline">{r.access_code}</Badge>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
