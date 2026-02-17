import { ReactNode, ElementType } from "react";
import { cn } from "@/lib/utils";

export type HeadingLevel = "h1" | "h2" | "h3" | "h4";
export type HeadingColor = "default" | "muted" | "primary";

export interface HeadingProps {
  children: ReactNode;
  level?: HeadingLevel;
  styleAs?: HeadingLevel;
  color?: HeadingColor;
  className?: string;
  id?: string;
}

const headingStyles: Record<HeadingLevel, string> = {
  h1: "text-5xl font-semibold leading-[1.1] tracking-tight",
  h2: "text-4xl font-semibold leading-[1.2] tracking-tight",
  h3: "text-[1.625rem] font-semibold leading-[1.2]",
  h4: "text-xl font-semibold leading-[1.3]",
};

const colorStyles: Record<HeadingColor, string> = {
  default: "text-foreground",
  muted: "text-muted-foreground",
  primary: "text-primary",
};

export function Heading({
  children,
  level = "h2",
  styleAs,
  color = "default",
  className,
  id,
}: HeadingProps) {
  const Component = level as ElementType;
  const visualStyle = styleAs || level;

  return (
    <Component
      id={id}
      className={cn(headingStyles[visualStyle], colorStyles[color], className)}
    >
      {children}
    </Component>
  );
}

export function H1({
  children,
  className,
  color,
  id,
}: Omit<HeadingProps, "level" | "styleAs">) {
  return (
    <Heading level="h1" color={color} className={className} id={id}>
      {children}
    </Heading>
  );
}

export function H2({
  children,
  className,
  color,
  id,
}: Omit<HeadingProps, "level" | "styleAs">) {
  return (
    <Heading level="h2" color={color} className={className} id={id}>
      {children}
    </Heading>
  );
}

export function H3({
  children,
  className,
  color,
  id,
}: Omit<HeadingProps, "level" | "styleAs">) {
  return (
    <Heading level="h3" color={color} className={className} id={id}>
      {children}
    </Heading>
  );
}

export function H4({
  children,
  className,
  color,
  id,
}: Omit<HeadingProps, "level" | "styleAs">) {
  return (
    <Heading level="h4" color={color} className={className} id={id}>
      {children}
    </Heading>
  );
}
