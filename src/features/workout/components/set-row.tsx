import { Pressable, View } from "react-native";
import { cssInterop } from "nativewind";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useEffect } from "react";
import { Text } from "@ui/text";
import { motion } from "@theme/motion";

cssInterop(Pressable, { className: "style" });
cssInterop(View, { className: "style" });

export type SetRowStatus = "done" | "active" | "pending";

export interface SetRowProps {
  index: number;
  status: SetRowStatus;
  previous?: { weight: number; reps: number } | null;
  weight?: number;
  reps?: number;
  rir?: number | null;
  targetReps?: string;
  onPress: () => void;
}

export function SetRow({
  index,
  status,
  previous,
  weight,
  reps,
  rir,
  targetReps,
  onPress,
}: SetRowProps) {
  const ringOpacity = useSharedValue(status === "active" ? 1 : 0);

  useEffect(() => {
    ringOpacity.value = withTiming(status === "active" ? 1 : 0, {
      duration: motion.duration.fast,
      easing: motion.easing.iron,
    });
  }, [status, ringOpacity]);

  const ringStyle = useAnimatedStyle(() => ({ opacity: ringOpacity.value }));

  const prevText = previous ? `${formatKg(previous.weight)}×${previous.reps}` : "—";
  const weightText = status === "done" && weight !== undefined ? formatKg(weight) : status === "active" ? targetReps ?? "—" : "—";
  const repsText =
    status === "done" && reps !== undefined
      ? String(reps)
      : status === "active"
        ? targetReps ?? "—"
        : "—";
  const rirText = status === "done" && rir !== null && rir !== undefined ? String(rir) : "—";

  return (
    <Pressable
      onPress={onPress}
      disabled={status === "done"}
      className={`relative rounded-lg overflow-hidden ${
        status === "active" ? "bg-bg-raised" : status === "done" ? "bg-success/5" : "bg-bg-sunken"
      }`}
    >
      <Animated.View
        pointerEvents="none"
        style={ringStyle}
        className="absolute inset-0 rounded-lg border-2 border-ember-500"
      />
      <View className="flex-row items-center px-3 h-14">
        <Text
          className={`w-8 text-xs font-bold ${status === "active" ? "text-ember-400" : "text-text-tertiary"}`}
        >
          {index}
        </Text>
        <Text
          className={`w-24 text-xs font-mono ${status === "done" ? "text-text-tertiary" : "text-text-disabled"}`}
        >
          {prevText}
        </Text>
        <View className="flex-1 flex-row justify-center gap-3">
          <Text
            className={`w-16 text-center font-mono text-base font-semibold ${
              status === "done"
                ? "text-text-primary"
                : status === "active"
                  ? "text-text-tertiary"
                  : "text-text-disabled"
            }`}
          >
            {status === "done" ? formatKg(weight ?? 0) : "—"}
          </Text>
          <Text
            className={`w-12 text-center font-mono text-base font-semibold ${
              status === "done"
                ? "text-text-primary"
                : status === "active"
                  ? "text-text-tertiary"
                  : "text-text-disabled"
            }`}
          >
            {status === "done" ? String(reps ?? 0) : status === "active" ? targetReps ?? "—" : "—"}
          </Text>
          <Text
            className={`w-10 text-center font-mono text-base ${
              status === "done" ? "text-text-secondary" : "text-text-disabled"
            }`}
          >
            {rirText}
          </Text>
        </View>
        <View className="w-7 items-center">
          {status === "done" ? (
            <View className="w-6 h-6 rounded-full bg-success items-center justify-center">
              <Text className="text-text-inverse text-xs font-bold">✓</Text>
            </View>
          ) : status === "active" ? (
            <View className="w-6 h-6 rounded-full border-2 border-ember-500" />
          ) : (
            <View className="w-6 h-6 rounded-full border border-border-subtle" />
          )}
        </View>
      </View>
    </Pressable>
  );
}

function formatKg(v: number): string {
  return v % 1 === 0 ? String(v) : v.toFixed(1);
}
