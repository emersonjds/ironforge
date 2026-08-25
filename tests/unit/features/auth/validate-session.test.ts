import { ApiError } from "@shared/lib/api/client";
import { useAuthStore, validateSession } from "@features/auth/store";
import { fetchMe } from "@features/auth/api";
import type { User } from "@/types/domain";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

jest.mock("@features/auth/api", () => ({
  ...jest.requireActual("@features/auth/api"),
  fetchMe: jest.fn(),
}));

const fetchMeMock = fetchMe as jest.MockedFunction<typeof fetchMe>;

const EXISTING_USER: User = {
  id: "user-1",
  email: "aluno@ironforge.test",
  displayName: "Bruno Aluno",
  avatarUrl: null,
  createdAt: "2026-01-01T00:00:00.000Z",
};

describe("validateSession", () => {
  beforeEach(() => {
    fetchMeMock.mockReset();
    useAuthStore.setState({
      user: EXISTING_USER,
      role: "athlete",
      token: "stale-or-valid-token",
      isAuthenticated: true,
      hasCompletedOnboarding: true,
    });
  });

  it("não faz nada quando não há token persistido", async () => {
    useAuthStore.setState({ token: null, isAuthenticated: false });

    await validateSession();

    expect(fetchMeMock).not.toHaveBeenCalled();
  });

  it("token válido: mantém a sessão e atualiza o usuário com a resposta da API", async () => {
    fetchMeMock.mockResolvedValue({
      id: "user-1",
      email: "aluno@ironforge.test",
      displayName: "Bruno Aluno Atualizado",
      avatarUrl: null,
      coachId: "coach-1",
      athleteId: "athlete-1",
      createdAt: "2026-01-01T00:00:00.000Z",
    });

    await validateSession();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBe("stale-or-valid-token");
    expect(state.user?.displayName).toBe("Bruno Aluno Atualizado");
  });

  it("token inválido (401): derruba a sessão local", async () => {
    fetchMeMock.mockRejectedValue(new ApiError("Não autorizado", 401, "UNAUTHORIZED"));

    await validateSession();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it("erro transiente (não 401): mantém a sessão local", async () => {
    fetchMeMock.mockRejectedValue(new Error("Network request failed"));

    await validateSession();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBe("stale-or-valid-token");
  });
});
