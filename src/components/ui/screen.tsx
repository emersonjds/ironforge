import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { View, type ViewProps } from "react-native";
import { cssInterop } from "nativewind";

cssInterop(SafeAreaView, { className: "style" });
cssInterop(View, { className: "style" });

export interface ScreenProps extends ViewProps {
  padded?: boolean;
  edges?: readonly Edge[];
  className?: string;
}

export function Screen({
  padded = true,
  edges = ["top", "bottom"],
  className = "",
  children,
  ...rest
}: ScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-bg" edges={edges}>
      <View
        className={`flex-1 ${padded ? "px-4" : ""} ${className}`}
        {...rest}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}
