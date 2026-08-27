interface ResolveRootRouteInput {
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  role: "athlete" | "coach" | null;
}

export type RootRoute =
  | "/(auth)/welcome"
  | "/coach-guidance"
  | "/(onboarding)/goal"
  | "/(app)";

export function resolveRootRoute(input: ResolveRootRouteInput): RootRoute {
  if (!input.isAuthenticated) return "/(auth)/welcome";
  if (input.role === "coach") return "/coach-guidance";
  if (!input.hasCompletedOnboarding) return "/(onboarding)/goal";
  return "/(app)";
}
