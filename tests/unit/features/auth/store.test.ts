import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "@features/auth/store";
import { getApiAuthToken } from "@shared/lib/api/auth-token";
import { login, fetchMe } from "@features/auth/api";
import { ApiError, apiRequest } from "@shared/lib/api/client";
import { STORAGE_KEYS } from "@shared/lib/storage/keys";
import type { User } from "@/types/domain";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

jest.mock("@features/auth/api", () => ({
  ...jest.requireActual("@features/auth/api"),
  login: jest.fn(),
  fetchMe: jest.fn(),
}));

const loginMock = login as jest.MockedFunction<typeof login>;
const fetchMeMock = fetchMe as jest.MockedFunction<typeof fetchMe>;

const BASE_USER: User = {
  id: "user-1",
  email: "aluno@ironforge.test",
  displayName: "Bruno Aluno",
  avatarUrl: null,
  createdAt: "2026-01-01T00:00:00.000Z",
};

describe("useAuthStore", () => {
  beforeEach(() => {
    loginMock.mockReset();
    fetchMeMock.mockReset();
    useAuthStore.setState({
      user: null,
      role: null,
      athleteProfile: null,
      token: null,
      isAuthenticated: false,
      hasCompletedOnboarding: false,
    });
  });

  describe("signIn", () => {
    it("aluno sem athleteProfile: monta perfil default com o coach do mock e onboarding pendente", () => {
      useAuthStore.getState().signIn(BASE_USER, "token-1");

      const state = useAuthStore.getState();
      expect(state.role).toBe("athlete");
      expect(state.athleteProfile?.coachId).toBe("coach-amanda");
      expect(state.hasCompletedOnboarding).toBe(false);
      expect(getApiAuthToken()).toBe("token-1");
    });

    it("coach sem athleteProfile: coachId nulo e onboarding sempre completo", () => {
      useAuthStore.getState().signIn(BASE_USER, "token-1", undefined, "coach");

      const state = useAuthStore.getState();
      expect(state.role).toBe("coach");
      expect(state.athleteProfile?.coachId).toBeNull();
      expect(state.hasCompletedOnboarding).toBe(true);
    });

    it("com athleteProfile explícito: usa o onboardingCompleted do perfil recebido", () => {
      useAuthStore.getState().signIn(BASE_USER, "token-1", {
        userId: BASE_USER.id,
        coachId: "coach-x",
        goal: "hypertrophy",
        experienceLevel: "intermediate",
        unitSystem: "kg",
        bodyweightKg: null,
        restrictions: [],
        videoPerformerPref: "any",
        onboardingCompleted: true,
      });

      const state = useAuthStore.getState();
      expect(state.athleteProfile?.coachId).toBe("coach-x");
      expect(state.hasCompletedOnboarding).toBe(true);
    });
  });

  describe("signOut", () => {
    it("limpa o estado e o token da API", () => {
      useAuthStore.getState().signIn(BASE_USER, "token-1");

      useAuthStore.getState().signOut();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(getApiAuthToken()).toBeNull();
    });
  });

  describe("setUser", () => {
    it("substitui apenas o usuário mantendo o resto do estado", () => {
      useAuthStore.getState().signIn(BASE_USER, "token-1");
      const updated: User = { ...BASE_USER, displayName: "Novo Nome" };

      useAuthStore.getState().setUser(updated);

      expect(useAuthStore.getState().user?.displayName).toBe("Novo Nome");
      expect(useAuthStore.getState().token).toBe("token-1");
    });
  });

  describe("completeOnboarding", () => {
    it("com athleteProfile presente: aplica o patch e marca onboarding completo", () => {
      useAuthStore.getState().signIn(BASE_USER, "token-1");

      useAuthStore.getState().completeOnboarding({ goal: "strength" });

      const state = useAuthStore.getState();
      expect(state.athleteProfile?.goal).toBe("strength");
      expect(state.athleteProfile?.onboardingCompleted).toBe(true);
      expect(state.hasCompletedOnboarding).toBe(true);
    });

    it("sem athleteProfile (ex.: coach): mantém athleteProfile nulo mas marca onboarding completo", () => {
      useAuthStore.setState({ athleteProfile: null });

      useAuthStore.getState().completeOnboarding({ goal: "strength" });

      const state = useAuthStore.getState();
      expect(state.athleteProfile).toBeNull();
      expect(state.hasCompletedOnboarding).toBe(true);
    });
  });

  describe("loginWithPassword", () => {
    it("sucesso: chama signIn com o usuário retornado pela API", async () => {
      loginMock.mockResolvedValue({
        accessToken: "access-1",
        refreshToken: "refresh-1",
        user: {
          id: "user-1",
          email: "aluno@ironforge.test",
          displayName: "Bruno Aluno",
          avatarUrl: null,
          coachId: "coach-real",
          athleteId: "athlete-1",
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      });

      await useAuthStore.getState().loginWithPassword("aluno@ironforge.test", "senha-123", "athlete");

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.token).toBe("access-1");
      expect(state.athleteProfile?.coachId).toBe("coach-real");
      expect(state.athleteProfile?.onboardingCompleted).toBe(true);
    });

    it("sucesso com role coach: não define athleteProfile explícito, signIn monta o default de coach", async () => {
      loginMock.mockResolvedValue({
        accessToken: "access-1",
        refreshToken: "refresh-1",
        user: {
          id: "coach-1",
          email: "personal@ironforge.test",
          displayName: "Amanda Personal",
          avatarUrl: null,
          coachId: null,
          athleteId: null,
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      });

      await useAuthStore.getState().loginWithPassword("personal@ironforge.test", "senha-123", "coach");

      const state = useAuthStore.getState();
      expect(state.role).toBe("coach");
      expect(state.athleteProfile?.coachId).toBeNull();
      expect(state.hasCompletedOnboarding).toBe(true);
    });

    it("401: lança mensagem de credenciais inválidas e não altera o estado", async () => {
      loginMock.mockRejectedValue(new ApiError("Não autorizado", 401, "UNAUTHORIZED"));

      await expect(
        useAuthStore.getState().loginWithPassword("aluno@ironforge.test", "errada", "athlete"),
      ).rejects.toThrow("E-mail ou senha inválidos.");
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it("falha de rede: lança mensagem de conexão", async () => {
      loginMock.mockRejectedValue(new Error("Network request failed"));

      await expect(
        useAuthStore.getState().loginWithPassword("aluno@ironforge.test", "senha-123", "athlete"),
      ).rejects.toThrow("Não foi possível entrar agora. Verifique sua conexão.");
    });
  });

  describe("handler global de 401", () => {
    const originalFetch = global.fetch;

    afterEach(() => {
      global.fetch = originalFetch;
    });

    it("qualquer chamada à API que responda 401 derruba a sessão via signOut", async () => {
      useAuthStore.getState().signIn(BASE_USER, "token-1");
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ message: "Token expirado" }),
      }) as unknown as typeof fetch;

      await expect(apiRequest("/plans")).rejects.toThrow(ApiError);

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().token).toBeNull();
    });
  });

  describe("onRehydrateStorage", () => {
    afterEach(async () => {
      await AsyncStorage.removeItem(STORAGE_KEYS.auth);
    });

    it("com token persistido: registra o token na API e valida a sessão", async () => {
      fetchMeMock.mockResolvedValue({
        id: "user-1",
        email: "aluno@ironforge.test",
        displayName: "Bruno Atualizado",
        avatarUrl: null,
        coachId: "coach-amanda",
        athleteId: "athlete-1",
        createdAt: "2026-01-01T00:00:00.000Z",
      });
      await AsyncStorage.setItem(
        STORAGE_KEYS.auth,
        JSON.stringify({
          state: { token: "persisted-token", user: BASE_USER, isAuthenticated: true },
          version: 0,
        }),
      );

      await useAuthStore.persist.rehydrate();

      expect(getApiAuthToken()).toBe("persisted-token");
      expect(fetchMeMock).toHaveBeenCalledTimes(1);
    });

    it("sem token persistido: limpa o token da API e não valida sessão", async () => {
      await AsyncStorage.setItem(
        STORAGE_KEYS.auth,
        JSON.stringify({ state: { token: null, isAuthenticated: false }, version: 0 }),
      );

      await useAuthStore.persist.rehydrate();

      expect(getApiAuthToken()).toBeNull();
      expect(fetchMeMock).not.toHaveBeenCalled();
    });
  });
});
