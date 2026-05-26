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
export interface TabConfig {
  label: string;
  icon: IoniconName;
  iconActive: IoniconName;
}

export const ATHLETE_TABS: Record<string, TabConfig> = {
  index: { label: "Início", icon: "home-outline", iconActive: "home" },
  workouts: { label: "Treinos", icon: "barbell-outline", iconActive: "barbell" },
  progress: { label: "Progresso", icon: "stats-chart-outline", iconActive: "stats-chart" },
  profile: { label: "Perfil", icon: "person-outline", iconActive: "person" },
};

interface TabBarProps extends BottomTabBarProps {
  config?: Record<string, TabConfig>;
}

export function TabBar({ state, navigation, config = ATHLETE_TABS }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const tabRoutes = state.routes.filter((r) => config[r.name]);

  return (
    <View
      className="flex-row bg-bg-raised border-t border-border"
      style={{ paddingBottom: Math.max(insets.bottom, 10), paddingTop: 10 }}
    >
      {tabRoutes.map((route) => {
        const realIndex = state.routes.findIndex((r) => r.key === route.key);
        const isFocused = state.index === realIndex;
        const meta = config[route.name]!;

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
