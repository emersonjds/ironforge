import { Pressable, View } from "react-native";
import { cssInterop } from "nativewind";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { type BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Text } from "@ui/text";
import { colors } from "@theme/colors";
import { haptics } from "@lib/haptics";

cssInterop(Pressable, { className: "style" });
cssInterop(View, { className: "style" });

type IoniconName = keyof typeof Ionicons.glyphMap;

const TABS: Record<string, { label: string; icon: IoniconName; iconActive: IoniconName }> = {
  index: { label: "Dashboard", icon: "home-outline", iconActive: "home" },
  workouts: { label: "Workouts", icon: "barbell-outline", iconActive: "barbell" },
  progress: { label: "Progress", icon: "stats-chart-outline", iconActive: "stats-chart" },
  profile: { label: "Profile", icon: "person-outline", iconActive: "person" },
};

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  // só as rotas que têm config de tab (history fica oculta)
  const tabRoutes = state.routes.filter((r) => TABS[r.name]);

  return (
    <View
      className="flex-row bg-bg-raised border-t border-border"
      style={{ paddingBottom: Math.max(insets.bottom, 10), paddingTop: 10 }}
    >
      {tabRoutes.map((route) => {
        const realIndex = state.routes.findIndex((r) => r.key === route.key);
        const isFocused = state.index === realIndex;
        const meta = TABS[route.name]!;

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
            accessibilityLabel={meta.label}
            className="flex-1 items-center justify-center gap-1 py-1"
          >
            <Ionicons
              name={isFocused ? meta.iconActive : meta.icon}
              size={24}
              color={isFocused ? colors.forest[500] : colors.text.tertiary}
            />
            <Text
              className={`text-2xs font-semibold tracking-wide ${
                isFocused ? "text-forest-500" : "text-text-tertiary"
              }`}
            >
              {meta.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
