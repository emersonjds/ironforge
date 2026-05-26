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
      <Tabs.Screen name="reels" />
      {/* rotas navegáveis fora da tab bar (perfil via avatar do header) */}
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="history" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
    </Tabs>
  );
}
