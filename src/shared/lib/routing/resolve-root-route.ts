interface ResolveRootRouteInput {
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  role: "athlete" | "coach" | null;
}

export function resolveRootRoute(input: ResolveRootRouteInput): string {
  if (!input.isAuthenticated) return "/(auth)/welcome";
  if (input.role === "coach") return "/coach-guidance";
  if (!input.hasCompletedOnboarding) return "/(onboarding)/goal";
  return "/(app)";
}
