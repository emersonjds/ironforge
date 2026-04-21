import { View, type ViewProps } from "react-native";
import { cssInterop } from "nativewind";

cssInterop(View, { className: "style" });

type Variant = "default" | "raised" | "sunken" | "accent";

const variantClasses: Record<Variant, string> = {
  default: "bg-bg-raised border border-border-subtle",
  raised: "bg-bg-raised border border-border",
  sunken: "bg-bg-sunken border border-border-subtle",
  accent: "bg-bg-raised border border-ember-500/30",
};

export interface CardProps extends ViewProps {
  variant?: Variant;
  padding?: "sm" | "md" | "lg";
  className?: string;
}

const padMap = { sm: "p-3", md: "p-4", lg: "p-6" };

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
