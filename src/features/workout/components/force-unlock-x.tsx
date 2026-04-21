import { Pressable, View } from "react-native";
import { cssInterop } from "nativewind";
import { Text } from "@ui/text";
import { haptics } from "@lib/haptics";

cssInterop(Pressable, { className: "style" });
cssInterop(View, { className: "style" });

export interface ForceUnlockXProps {
  onUnlock: () => void;
}

export function ForceUnlockX({ onUnlock }: ForceUnlockXProps) {
  return (
    <Pressable
      onPress={() => {
        haptics.light();
        onUnlock();
      }}
      hitSlop={8}
      className="w-11 h-11 rounded-full items-center justify-center border border-border active:bg-bg-raised"
    >
      <Text className="text-text-primary text-base font-semibold">✕</Text>
    </Pressable>
  );
}
