import { Tabs } from "expo-router";
import { TabBar, type TabConfig } from "@shared/tab-bar";

const COACH_TABS: Record<string, TabConfig> = {
  index: { label: "Alunos", icon: "people-outline", iconActive: "people" },
  financeiro: { label: "Financeiro", icon: "card-outline", iconActive: "card" },
  perfil: { label: "Perfil", icon: "person-outline", iconActive: "person" },
};

export default function CoachLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} config={COACH_TABS} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="financeiro" />
      <Tabs.Screen name="perfil" />
      <Tabs.Screen name="student/[id]" options={{ href: null }} />
    </Tabs>
  );
}
