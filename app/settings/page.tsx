"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuiz } from "@/lib/quiz-context";
import { PERSONAS } from "@/lib/data/personas";
import { COURSEWARE_SETTINGS } from "@/lib/data/courseware-settings";
import { SettingCard } from "@/components/setting-card";
import { Chat } from "@/components/chat";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SettingsPage() {
  const router = useRouter();
  const { quizResult, hydrated } = useQuiz();

  const [settingValues, setSettingValues] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        COURSEWARE_SETTINGS.map((s) => [s.id, String(s.currentValue)])
      )
  );
  const [saved, setSaved] = useState(false);

  if (!hydrated) return null;

  if (!quizResult) {
    router.push("/quiz");
    return null;
  }

  const persona = PERSONAS[quizResult.topPersonaId];

  function handleValueChange(settingId: string, newValue: string) {
    setSettingValues((prev) => ({ ...prev, [settingId]: newValue }));
    setSaved(false);
  }

  function handleSave() {
    // In a real app, this would call an API to persist settings
    setSaved(true);
  }

  const changedCount = COURSEWARE_SETTINGS.filter(
    (s) => settingValues[s.id] !== String(s.currentValue)
  ).length;

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Courseware Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure your courseware as{" "}
            <span className="font-medium text-foreground">
              {persona?.name}
            </span>
            . Recommended values are tailored to your teaching style.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {COURSEWARE_SETTINGS.map((setting) => (
            <SettingCard
              key={setting.id}
              setting={setting}
              currentValue={settingValues[setting.id]}
              onValueChange={handleValueChange}
            />
          ))}
        </div>

        <div className="flex items-center gap-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="lg" disabled={changedCount === 0 || saved}>
                {saved ? "Settings Saved" : `Save Settings${changedCount > 0 ? ` (${changedCount} changed)` : ""}`}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Save courseware settings?</AlertDialogTitle>
                <AlertDialogDescription>
                  You&apos;re about to update {changedCount} setting
                  {changedCount !== 1 ? "s" : ""}. This will apply to your
                  courseware configuration.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSave}>
                  Save Changes
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button variant="ghost" onClick={() => router.push("/results")}>
            Back to Results
          </Button>
        </div>

        <Separator />

        <Chat
          title="Settings Assistant"
          description={`Ask me about any setting — I'll explain it as ${persona?.name}`}
          placeholder="Ask about a setting or describe changes you'd like..."
          emptyMessage="Have questions about a setting? Ask me and I'll explain it in your persona's style."
          body={{ personaId: quizResult.topPersonaId }}
          className="h-[400px]"
        />
      </div>
    </main>
  );
}
