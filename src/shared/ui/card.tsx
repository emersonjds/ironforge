import { View, type ViewProps } from "react-native";
import { cssInterop } from "nativewind";

cssInterop(View, { className: "style" });

type Variant = "default" | "raised" | "sunken" | "accent";

const variantClasses: Record<Variant, string> = {
  default: "bg-bg-raised border border-border",
  raised: "bg-bg-raised border border-border",
  sunken: "bg-bg-sunken border border-border-subtle",
  accent: "bg-bg-raised border border-ember-500/40",
};

export interface CardProps extends ViewProps {
  variant?: Variant;
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const padMap = { none: "p-0", sm: "p-4", md: "p-5", lg: "p-6", xl: "p-7" };

export function Card({
  variant = "default",
  padding = "md",
  className = "",
  children,
  ...rest
}: CardProps) {
  return (
    <View
      className={`rounded-xl ${padMap[padding]} ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {children}
    </View>
  );
}
