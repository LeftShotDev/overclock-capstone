"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import { useQuiz } from "@/lib/quiz-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SyllabusData } from "@/lib/types";

type UploadStatus = "idle" | "uploading" | "complete" | "error";

interface SyllabusUploadStepProps {
  onComplete: () => void;
  onSkip: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function SyllabusUploadStep({
  onComplete,
  onSkip,
}: SyllabusUploadStepProps) {
  const { setSyllabusData } = useQuiz();
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [summary, setSummary] = useState<SyllabusData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function processFile(file: File) {
    if (file.size > MAX_FILE_SIZE) {
      setStatus("error");
      setErrorMessage("File is too large. Please upload a file under 10MB.");
      return;
    }

    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const validExtensions = [".pdf", ".docx"];
    const hasValidExtension = validExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!validTypes.includes(file.type) && !hasValidExtension) {
      setStatus("error");
      setErrorMessage("Please upload a PDF or DOCX file.");
      return;
    }

    setStatus("uploading");
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/syllabus", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error || `Upload failed (${response.status})`
        );
      }

      const data: SyllabusData = await response.json();
      setSyllabusData(data);
      setSummary(data);
      setStatus("complete");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Do you have a syllabus?
        </h2>
        <p className="text-muted-foreground mt-2">
          Upload your course syllabus and we&apos;ll tailor recommendations to
          your specific course. This step is optional.
        </p>
      </div>

      {status === "idle" && (
        <>
          <Card
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "flex flex-col items-center justify-center gap-3 p-10 border-2 border-dashed cursor-pointer transition-colors",
              dragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            )}
          >
            <div className="text-4xl">📄</div>
            <p className="text-sm font-medium">
              Drop your syllabus here or click to browse
            </p>
            <p className="text-xs text-muted-foreground">PDF or DOCX, up to 10MB</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
          </Card>

          <Button variant="ghost" onClick={onSkip} className="w-full">
            Skip this step
          </Button>
        </>
      )}

      {status === "uploading" && (
        <Card className="flex flex-col items-center justify-center gap-3 p-10">
          <div className="animate-spin text-2xl">⏳</div>
          <p className="text-sm font-medium">Analyzing your syllabus...</p>
          <p className="text-xs text-muted-foreground">
            This may take a moment
          </p>
        </Card>
      )}

      {status === "complete" && summary && (
        <div className="space-y-4">
          <Card className="p-5 space-y-3">
            <p className="text-sm font-semibold">Here&apos;s what we found:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {summary.courseDuration && (
                <li>
                  <span className="font-medium text-foreground">Duration:</span>{" "}
                  {summary.courseDuration}
                </li>
              )}
              {summary.moduleCount && (
                <li>
                  <span className="font-medium text-foreground">Modules:</span>{" "}
                  {summary.moduleCount}
                </li>
              )}
              {summary.assignmentTypes && summary.assignmentTypes.length > 0 && (
                <li>
                  <span className="font-medium text-foreground">
                    Assignments:
                  </span>{" "}
                  {summary.assignmentTypes.join(", ")}
                </li>
              )}
              {summary.gradingPolicies && (
                <li>
                  <span className="font-medium text-foreground">Grading:</span>{" "}
                  {summary.gradingPolicies}
                </li>
              )}
              {summary.keyDates && summary.keyDates.length > 0 && (
                <li>
                  <span className="font-medium text-foreground">
                    Key dates:
                  </span>{" "}
                  {summary.keyDates.length} found
                </li>
              )}
            </ul>
          </Card>

          <Button onClick={onComplete} className="w-full" size="lg">
            Continue to Results
          </Button>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-4">
          <Card className="p-5 border-destructive/50 bg-destructive/5">
            <p className="text-sm text-destructive">{errorMessage}</p>
          </Card>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setStatus("idle");
                setErrorMessage("");
              }}
              className="flex-1"
            >
              Try Again
            </Button>
            <Button variant="ghost" onClick={onSkip} className="flex-1">
              Skip
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
