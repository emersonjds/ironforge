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
  display: "font-display text-4xl font-black text-text-primary tracking-tight leading-none",
  title: "font-display text-3xl font-bold text-text-primary tracking-tight leading-none",
  heading: "font-sans text-2xl font-bold text-text-primary leading-tight",
  body: "font-sans text-base text-text-primary leading-normal",
  bodySmall: "font-sans text-sm text-text-secondary leading-snug",
  caption: "font-sans text-xs text-text-tertiary tracking-wide uppercase",
  metric: "font-display text-5xl font-black text-text-primary tracking-tight leading-none",
  label: "font-sans text-2xs font-semibold uppercase tracking-widest text-text-tertiary",
};

export interface TextProps extends RNTextProps {
  variant?: Variant;
  className?: string;
}

export function Text({ variant = "body", className = "", ...rest }: TextProps) {
  return <RNText className={`${variantClasses[variant]} ${className}`} {...rest} />;
}
