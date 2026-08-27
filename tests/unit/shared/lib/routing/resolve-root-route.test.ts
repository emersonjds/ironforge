import { resolveRootRoute } from "@shared/lib/routing/resolve-root-route";

describe("resolveRootRoute", () => {
  it("não autenticado vai para o welcome", () => {
    const route = resolveRootRoute({
      isAuthenticated: false,
      hasCompletedOnboarding: false,
      role: null,
    });
    expect(route).toBe("/(auth)/welcome");
  });

  it("aluno sem onboarding vai para o onboarding", () => {
    const route = resolveRootRoute({
      isAuthenticated: true,
      hasCompletedOnboarding: false,
      role: "athlete",
    });
    expect(route).toBe("/(onboarding)/goal");
  });

  it("aluno com onboarding completo vai para o app", () => {
    const route = resolveRootRoute({
      isAuthenticated: true,
      hasCompletedOnboarding: true,
      role: "athlete",
    });
    expect(route).toBe("/(app)");
  });

  it("personal puro vai para a tela de orientação, mesmo sem onboarding", () => {
    const route = resolveRootRoute({
      isAuthenticated: true,
      hasCompletedOnboarding: false,
      role: "coach",
    });
    expect(route).toBe("/coach-guidance");
  });
});
