import { Tabs } from "expo-router";
import { TabBar } from "@shared/tab-bar";
import { colors } from "@theme/colors";

export default function AppLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bg.DEFAULT },
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="workouts" />
      <Tabs.Screen name="progress" />
      <Tabs.Screen name="profile" />
      {/* histórico continua navegável, mas fora da tab bar */}
      <Tabs.Screen name="history" options={{ href: null }} />
    </Tabs>
  );
}
