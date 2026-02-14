"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

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

export function PersonasClient({ personas }: { personas: Persona[] }) {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Personas</h2>
        <p className="text-muted-foreground text-sm">
          Edit persona definitions, settings, and character assignments.
        </p>
      </div>

      <div className="grid gap-4">
        {personas.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{p.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {p.description.slice(0, 120)}
                    {p.description.length > 120 ? "..." : ""}
                  </CardDescription>
                </div>
                <Link href={`/onboarding/personas/${p.id}`}>
                  <Button variant="outline" size="sm">
                    <Pencil className="size-3" />
                    Edit
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  Mastery: {p.mastery_threshold}%
                </Badge>
                <Badge variant="secondary">
                  Personality: {p.message_personality}
                </Badge>
                <Badge variant="secondary">
                  Auto Messages: {p.send_auto_messages ? "On" : "Off"}
                </Badge>
                <Badge variant="secondary">
                  Study Plan: {p.show_study_plan_rollup ? "On" : "Off"}
                </Badge>
                <Badge variant="secondary">
                  Participation: {p.graded_participation_enabled ? "On" : "Off"}
                </Badge>
                {p.enabled_auto_messages.map((msg) => (
                  <Badge key={msg} variant="outline">
                    {msg}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        {personas.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No personas found. Run database migrations first.
          </p>
        )}
      </div>
    </div>
  );
}
