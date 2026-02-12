"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const OPTION_COLORS = [
  "hover:border-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950",
  "hover:border-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950",
  "hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950",
  "hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950",
];

interface QuizOptionCardProps {
  label: string;
  value: string;
  index: number;
  onClick: (value: string) => void;
}

export function QuizOptionCard({
  label,
  value,
  index,
  onClick,
}: QuizOptionCardProps) {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onClick(value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(value);
        }
      }}
      className={cn(
        "px-5 py-4 cursor-pointer border-2 border-transparent transition-all duration-200",
        "hover:scale-[1.02] hover:shadow-md active:scale-[0.98]",
        OPTION_COLORS[index % OPTION_COLORS.length]
      )}
    >
      <p className="text-sm font-medium leading-relaxed">{label}</p>
    </Card>
  );
}
