import { View, Pressable } from "react-native";
import { cssInterop } from "nativewind";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useEffect } from "react";
import { Text } from "@ui/text";
import { formatDuration } from "@lib/utils/format";
import { motion } from "@theme/motion";

cssInterop(View, { className: "style" });
cssInterop(Pressable, { className: "style" });

export interface RestTimerBarProps {
  remainingSeconds: number;
  totalSeconds: number;
  onAdjust: (delta: number) => void;
  onSkip: () => void;
}

export function RestTimerBar({ remainingSeconds, totalSeconds, onAdjust, onSkip }: RestTimerBarProps) {
  const ratio = totalSeconds > 0 ? 1 - remainingSeconds / totalSeconds : 0;
  const width = useSharedValue(ratio * 100);

  useEffect(() => {
    width.value = withTiming(ratio * 100, {
      duration: motion.duration.base,
      easing: motion.easing.iron,
    });
  }, [ratio, width]);

  const barStyle = useAnimatedStyle(() => ({ width: `${width.value}%` }));

  const isFinishing = remainingSeconds > 0 && remainingSeconds <= 3;

  return (
    <View className="bg-bg-raised border-t border-border-subtle px-4 py-4">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-baseline gap-2">
          <Text className="text-2xs font-semibold uppercase tracking-widest text-text-tertiary">
            DESCANSO
          </Text>
          <Text
            className={`font-mono text-2xl font-bold ${isFinishing ? "text-warning" : "text-text-primary"}`}
          >
            {formatDuration(remainingSeconds)}
          </Text>
        </View>
        <Pressable
          onPress={onSkip}
          className="h-9 px-4 rounded-pill border border-border items-center justify-center active:bg-bg-sunken"
        >
          <Text className="text-xs text-text-secondary font-semibold uppercase tracking-wide">pular</Text>
        </Pressable>
      </View>

      <View className="h-1.5 rounded-full bg-bg-sunken overflow-hidden mb-4">
        <Animated.View style={barStyle} className="h-full bg-ember-500 rounded-full" />
      </View>

      <View className="flex-row gap-2">
        <Pressable
          onPress={() => onAdjust(-15)}
          className="flex-1 h-11 rounded-lg bg-bg-sunken border border-border items-center justify-center active:bg-surface-700"
        >
          <Text className="text-sm text-text-primary font-semibold">-15s</Text>
        </Pressable>
        <Pressable
          onPress={() => onAdjust(15)}
          className="flex-1 h-11 rounded-lg bg-bg-sunken border border-border items-center justify-center active:bg-surface-700"
        >
          <Text className="text-sm text-text-primary font-semibold">+15s</Text>
        </Pressable>
      </View>
    </View>
  );
}
