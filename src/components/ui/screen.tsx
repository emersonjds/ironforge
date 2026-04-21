import { SafeAreaView } from "react-native-safe-area-context";
import { View, type ViewProps } from "react-native";
import { cssInterop } from "nativewind";

cssInterop(SafeAreaView, { className: "style" });
cssInterop(View, { className: "style" });

export interface ScreenProps extends ViewProps {
  padded?: boolean;
  className?: string;
}

export function Screen({ padded = true, className = "", children, ...rest }: ScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top", "bottom"]}>
      <View className={`flex-1 ${padded ? "px-4" : ""} ${className}`} {...rest}>
        {children}
      </View>
    </SafeAreaView>
  );
}
