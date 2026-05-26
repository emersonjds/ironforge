import { Redirect } from "expo-router";
import { useAuthStore } from "@features/auth/store";

export default function Index() {
  const { isAuthenticated, hasCompletedOnboarding, role } = useAuthStore();

  if (!isAuthenticated) return <Redirect href="/(auth)/welcome" />;
  if (role === "coach") return <Redirect href="/(coach)" />;
  if (!hasCompletedOnboarding) return <Redirect href="/(onboarding)/goal" />;
  return <Redirect href="/(app)" />;
}
