import { Pressable, View } from "react-native";
import { cssInterop } from "nativewind";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { type BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Text } from "@ui/text";
import { haptics } from "@lib/haptics";

cssInterop(Pressable, { className: "style" });
cssInterop(View, { className: "style" });

const LABELS: Record<string, { label: string; icon: string }> = {
  index: { label: "HOJE", icon: "◈" },
  history: { label: "HISTÓRICO", icon: "◎" },
  profile: { label: "PERFIL", icon: "◉" },
};

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-row bg-bg border-t border-border-subtle"
      style={{ paddingBottom: Math.max(insets.bottom, 12), paddingTop: 10 }}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const meta = LABELS[route.name] ?? { label: route.name.toUpperCase(), icon: "·" };

        function onPress() {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            haptics.tap();
            navigation.navigate(route.name, route.params);
          }
        }

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            className="flex-1 items-center justify-center gap-1 py-1"
          >
            {/* Active indicator dot above icon */}
            <View className={`w-1 h-1 rounded-full mb-0.5 ${isFocused ? "bg-ember-500" : "bg-transparent"}`} />
            <Text
              className={`text-base leading-none ${isFocused ? "text-ember-500" : "text-text-disabled"}`}
            >
              {meta.icon}
            </Text>
            <Text
              className={`text-2xs font-bold tracking-widest ${isFocused ? "text-ember-400" : "text-text-tertiary"}`}
            >
              {meta.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
