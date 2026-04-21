import { Pressable, View } from "react-native";
import { cssInterop } from "nativewind";
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Text } from "@ui/text";
import { haptics } from "@lib/haptics";

cssInterop(Pressable, { className: "style" });
cssInterop(View, { className: "style" });

const HOLD_MS = 600;

export interface ForceUnlockXProps {
  onUnlock: () => void;
}

export function ForceUnlockX({ onUnlock }: ForceUnlockXProps) {
  const progress = useSharedValue(0);

  useAnimatedReaction(
    () => progress.value,
    (v, prev) => {
      if (v >= 1 && (prev ?? 0) < 1) {
        runOnJS(haptics.longPress)();
        runOnJS(onUnlock)();
      }
    },
  );

  const fillStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.9 + 0.1,
    transform: [{ scale: 0.5 + progress.value * 0.5 }],
  }));

  return (
    <Pressable
      onPressIn={() => {
        haptics.light();
        progress.value = withTiming(1, { duration: HOLD_MS, easing: Easing.bezier(0.65, 0, 0.35, 1) });
      }}
      onPressOut={() => {
        cancelAnimation(progress);
        progress.value = withTiming(0, { duration: 180 });
      }}
      className="w-11 h-11 rounded-full items-center justify-center"
    >
      <Animated.View style={fillStyle} className="absolute inset-1 rounded-full bg-ember-500/30" />
      <Text className="text-text-primary text-xl font-semibold">✕</Text>
    </Pressable>
  );
}
