import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface PullQuoteProps {
  children: ReactNode;
  author?: string;
  className?: string;
}

export function PullQuote({ children, author, className }: PullQuoteProps) {
  return (
    <blockquote
      className={cn(
        "font-serif text-xl leading-[1.4] italic text-foreground",
        className
      )}
    >
      <p>&ldquo;{children}&rdquo;</p>
      {author && (
        <footer className="mt-2 font-sans text-sm font-bold not-italic text-muted-foreground">
          — {author}
        </footer>
      )}
    </blockquote>
  );
}
