import { Text as RNText, type TextProps as RNTextProps } from "react-native";
import { cssInterop } from "nativewind";

cssInterop(RNText, { className: "style" });

type Variant =
  | "display"
  | "title"
  | "heading"
  | "body"
  | "bodySmall"
  | "caption"
  | "metric"
  | "label";

const variantClasses: Record<Variant, string> = {
  display: "font-display text-4xl text-text-primary tracking-tight",
  title: "font-display text-3xl text-text-primary tracking-tight",
  heading: "font-sans text-2xl font-bold text-text-primary",
  body: "font-sans text-base text-text-primary",
  bodySmall: "font-sans text-sm text-text-secondary",
  caption: "font-sans text-xs text-text-tertiary tracking-wide",
  metric: "font-display text-5xl text-text-primary tracking-tight",
  label: "font-sans text-xs font-semibold uppercase tracking-wider text-text-tertiary",
};

export interface TextProps extends RNTextProps {
  variant?: Variant;
  className?: string;
}

export function Text({ variant = "body", className = "", ...rest }: TextProps) {
  return <RNText className={`${variantClasses[variant]} ${className}`} {...rest} />;
}
