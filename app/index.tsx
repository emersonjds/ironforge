import { Redirect } from "expo-router";
import { useAuthStore } from "@features/auth/store";

export default function Index() {
  const { isAuthenticated, hasCompletedOnboarding } = useAuthStore();

  if (!isAuthenticated) return <Redirect href="/(auth)/welcome" />;
  if (!hasCompletedOnboarding) return <Redirect href="/(onboarding)/goal" />;
  return <Redirect href="/(app)" />;
}
