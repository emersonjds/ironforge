import { http, HttpResponse } from "msw";
import { server } from "../../../msw/server";
import { ATHLETE_ACCOUNT, COACH_ONLY_ACCOUNT, VALID_PASSWORD } from "../../../msw/auth-handlers";
import { API_BASE_URL } from "@shared/lib/api/client";
import { setApiAuthToken } from "@shared/lib/api/auth-token";
import { AuthUserSchema } from "@features/auth/api";
import { useAuthStore, validateSession } from "@features/auth/store";
import { resolveRootRoute } from "@shared/lib/routing/resolve-root-route";
import { UserSchema } from "@/types/domain";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

beforeEach(() => {
  useAuthStore.setState({
    user: null,
    role: null,
    athleteProfile: null,
    token: null,
    isAuthenticated: false,
    hasCompletedOnboarding: false,
  });
  setApiAuthToken(null);
});

describe("login de aluno", () => {
  it("autentica, guarda o token e resolve para o app do aluno", async () => {
    expect(AuthUserSchema.parse(ATHLETE_ACCOUNT.user)).toMatchObject({
      athleteId: "athlete-1",
      coachId: null,
    });

    await useAuthStore.getState().loginWithPassword(ATHLETE_ACCOUNT.user.email, VALID_PASSWORD, "athlete");

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBe(ATHLETE_ACCOUNT.accessToken);
    expect(state.role).toBe("athlete");
    expect(UserSchema.safeParse(state.user).success).toBe(true);

    const route = resolveRootRoute({
      isAuthenticated: state.isAuthenticated,
      hasCompletedOnboarding: state.hasCompletedOnboarding,
      role: state.role,
    });
    expect(route).toBe("/(app)");
  });
});

describe("login de personal puro", () => {
  it("autentica e resolve para a tela de orientação do personal", async () => {
    expect(AuthUserSchema.parse(COACH_ONLY_ACCOUNT.user)).toMatchObject({
      coachId: "coach-1",
      athleteId: null,
    });

    await useAuthStore.getState().loginWithPassword(COACH_ONLY_ACCOUNT.user.email, VALID_PASSWORD, "coach");

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.role).toBe("coach");

    const route = resolveRootRoute({
      isAuthenticated: state.isAuthenticated,
      hasCompletedOnboarding: state.hasCompletedOnboarding,
      role: state.role,
    });
    expect(route).toBe("/coach-guidance");
    expect(route).not.toBe("/(app)");
  });
});

describe("credencial inválida", () => {
  it("mantém a sessão deslogada e mostra a mensagem de credencial inválida", async () => {
    await expect(
      useAuthStore.getState().loginWithPassword(ATHLETE_ACCOUNT.user.email, "senha-errada", "athlete"),
    ).rejects.toThrow("E-mail ou senha inválidos.");

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.token).toBeNull();
  });
});

describe("sessão inválida no boot", () => {
  it("derruba a sessão local quando a api rejeita o token persistido", async () => {
    server.use(
      http.get(`${API_BASE_URL}/auth/me`, () =>
        HttpResponse.json({ error: { code: "UNAUTHORIZED", message: "Sessão inválida", details: {} } }, { status: 401 }),
      ),
    );

    useAuthStore.setState({
      user: {
        id: ATHLETE_ACCOUNT.user.id,
        email: ATHLETE_ACCOUNT.user.email,
        displayName: ATHLETE_ACCOUNT.user.displayName,
        avatarUrl: ATHLETE_ACCOUNT.user.avatarUrl,
        createdAt: ATHLETE_ACCOUNT.user.createdAt,
      },
      role: "athlete",
      token: "token-que-a-api-nao-reconhece-mais",
      isAuthenticated: true,
    });
    setApiAuthToken("token-que-a-api-nao-reconhece-mais");

    await validateSession();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });
});

describe("falha de rede", () => {
  it("mostra a mensagem de conexão, não a de credencial inválida", async () => {
    server.use(http.post(`${API_BASE_URL}/auth/login`, () => HttpResponse.error()));

    await expect(
      useAuthStore.getState().loginWithPassword(ATHLETE_ACCOUNT.user.email, VALID_PASSWORD, "athlete"),
    ).rejects.toThrow("Não foi possível entrar agora. Verifique sua conexão.");

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
  });
});
