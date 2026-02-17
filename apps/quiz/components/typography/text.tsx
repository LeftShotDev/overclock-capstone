import { ReactNode, ElementType } from "react";
import { cn } from "@/lib/utils";

export type TextVariant = "body" | "body-bold" | "body-bold-compact" | "caption";
export type TextColor = "default" | "muted" | "primary" | "error" | "success";

export interface TextProps {
  children: ReactNode;
  variant?: TextVariant;
  color?: TextColor;
  as?: ElementType;
  className?: string;
  id?: string;
}

const variantStyles: Record<TextVariant, string> = {
  body: "text-base font-normal leading-[1.4]",
  "body-bold": "text-base font-bold leading-[1.5]",
  "body-bold-compact": "text-base font-bold leading-[1.4]",
  caption: "text-sm font-bold leading-[1.2]",
};

const colorStyles: Record<TextColor, string> = {
  default: "text-foreground",
  muted: "text-muted-foreground",
  primary: "text-primary",
  error: "text-destructive",
  success: "text-success",
};

export function Text({
  children,
  variant = "body",
  color = "default",
  as = "p",
  className,
  id,
}: TextProps) {
  const Component = as;

  return (
    <Component
      id={id}
      className={cn(variantStyles[variant], colorStyles[color], className)}
    >
      {children}
    </Component>
  );
}

export function Body({
  children,
  className,
  color,
  as,
  id,
}: Omit<TextProps, "variant">) {
  return (
    <Text variant="body" color={color} as={as} className={className} id={id}>
      {children}
    </Text>
  );
}

export function BodyBold({
  children,
  className,
  color,
  as,
  id,
}: Omit<TextProps, "variant">) {
  return (
    <Text variant="body-bold" color={color} as={as} className={className} id={id}>
      {children}
    </Text>
  );
}

export function BodyBoldCompact({
  children,
  className,
  color,
  as,
  id,
}: Omit<TextProps, "variant">) {
  return (
    <Text
      variant="body-bold-compact"
      color={color}
      as={as}
      className={className}
      id={id}
    >
      {children}
    </Text>
  );
}

export function Caption({
  children,
  className,
  color,
  as = "span",
  id,
}: Omit<TextProps, "variant">) {
  return (
    <Text variant="caption" color={color} as={as} className={className} id={id}>
      {children}
    </Text>
  );
}
