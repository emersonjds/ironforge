import { View } from "react-native";
import { cssInterop } from "nativewind";

cssInterop(View, { className: "style" });

export function Divider({ className = "" }: { className?: string }) {
  return <View className={`h-px bg-border-subtle w-full ${className}`} />;
}
