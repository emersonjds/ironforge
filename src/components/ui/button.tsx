import { Pressable, type PressableProps, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { cssInterop } from "nativewind";
import { Text } from "./text";
import { motion } from "@theme/motion";
import { haptics } from "@lib/haptics";

cssInterop(Pressable, { className: "style" });
cssInterop(View, { className: "style" });
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Variant = "solid" | "outline" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg" | "xl";

const variantStyles: Record<Variant, { bg: string; text: string; border: string }> = {
  solid: {
    bg: "bg-ember-500 active:bg-ember-600",
    text: "text-text-inverse",
    border: "border-transparent",
  },
  outline: {
    bg: "bg-transparent active:bg-bg-raised",
    text: "text-text-primary",
    border: "border border-border",
  },
  ghost: {
    bg: "bg-transparent active:bg-bg-raised",
    text: "text-text-primary",
    border: "border-transparent",
  },
  destructive: {
    bg: "bg-error active:bg-error-strong",
    text: "text-text-primary",
    border: "border-transparent",
  },
};

const sizeStyles: Record<Size, { container: string; label: string }> = {
  sm: { container: "h-10 px-4 rounded-md", label: "text-sm font-semibold" },
  md: { container: "h-12 px-5 rounded-lg", label: "text-base font-semibold" },
  lg: { container: "h-14 px-6 rounded-lg", label: "text-base font-bold uppercase tracking-wide" },
  xl: { container: "h-16 px-8 rounded-xl", label: "text-lg font-bold uppercase tracking-wide" },
};

export interface ButtonProps extends Omit<PressableProps, "children"> {
  label: string;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  disabled?: boolean;
  haptic?: boolean;
  className?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}

export function Button({
  label,
  variant = "solid",
  size = "md",
  fullWidth,
  disabled,
  haptic = true,
  className = "",
  leading,
  trailing,
  onPressIn,
  onPressOut,
  onPress,
  ...rest
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const v = variantStyles[variant];
  const s = sizeStyles[size];

  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={disabled}
      onPressIn={(e) => {
        scale.value = withTiming(0.97, {
          duration: motion.duration.fast,
          easing: motion.easing.iron,
        });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withTiming(1, {
          duration: motion.duration.fast,
          easing: motion.easing.iron,
        });
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptic) haptics.tap();
        onPress?.(e);
      }}
      style={animatedStyle}
      className={`
        ${s.container}
        ${v.bg}
        ${v.border}
        ${fullWidth ? "w-full" : ""}
        ${disabled ? "opacity-40" : ""}
        flex-row items-center justify-center gap-2
        ${className}
      `}
      {...rest}
    >
      {leading}
      <Text className={`${v.text} ${s.label}`}>{label}</Text>
      {trailing}
    </AnimatedPressable>
  );
}
