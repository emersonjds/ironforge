import { Redirect } from "expo-router";
import { useAuthStore } from "@features/auth/store";
import { resolveRootRoute } from "@shared/lib/routing/resolve-root-route";

export default function Index() {
  const { isAuthenticated, hasCompletedOnboarding, role } = useAuthStore();
  return <Redirect href={resolveRootRoute({ isAuthenticated, hasCompletedOnboarding, role })} />;
}
