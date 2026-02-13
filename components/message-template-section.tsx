"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BASE_TEMPLATES } from "@/lib/data/base-templates";
import type { GeneratedTemplatesResult } from "@/lib/types";

const TEMPLATE_TYPE_LABELS: Record<
  string,
  { title: string; description: string }
> = {
  help_hints: {
    title: "Help Hints",
    description:
      "Sent when a student scores below mastery — encourages retry with guidance.",
  },
  good_game: {
    title: "Nice Work!",
    description:
      "Sent when a student achieves mastery — celebrates their achievement.",
  },
};

interface MessageTemplateSectionProps {
  templatesResult: GeneratedTemplatesResult | null;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

export function MessageTemplateSection({
  templatesResult,
  onRegenerate,
  isRegenerating,
}: MessageTemplateSectionProps) {
  // Loading state
  if (!templatesResult || templatesResult.status === "loading") {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Message Templates</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Generating personalized messages in your character&apos;s voice...
          </p>
        </div>
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-5 w-24 bg-muted rounded" />
              <div className="h-4 w-64 bg-muted rounded mt-2" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-12 bg-muted rounded" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Error state or empty — show base templates as fallback
  const templatesToShow =
    templatesResult.status === "error" || templatesResult.templates.length === 0
      ? Object.entries(BASE_TEMPLATES).map(([type, base]) => ({
          templateType: type,
          variants: base.variants,
        }))
      : templatesResult.templates;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Message Templates</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Automated messages students receive, written in your character&apos;s
            voice.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRegenerate}
          disabled={isRegenerating}
        >
          {isRegenerating ? "Regenerating..." : "Regenerate"}
        </Button>
      </div>

      {templatesResult.status === "error" && (
        <p className="text-sm text-amber-600">
          Could not generate personalized templates. Showing default versions
          below.
        </p>
      )}

      {templatesToShow.map((template) => {
        const meta = TEMPLATE_TYPE_LABELS[template.templateType];
        return (
          <Card key={template.templateType}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">
                  {meta?.title ?? template.templateType}
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {template.variants.length} variants
                </Badge>
              </div>
              <CardDescription>{meta?.description ?? ""}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {template.variants.map((variant, index) => (
                <div
                  key={index}
                  className="rounded-md border bg-muted/50 p-3 text-sm leading-relaxed"
                >
                  <span className="text-xs font-medium text-muted-foreground mr-2">
                    #{index + 1}
                  </span>
                  {variant}
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
