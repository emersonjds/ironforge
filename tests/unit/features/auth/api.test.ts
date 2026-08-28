import { login, fetchMe } from "@features/auth/api";

describe("auth api", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  function mockFetchOk(payload: unknown) {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => payload,
    }) as unknown as typeof fetch;
  }

  describe("login", () => {
    const validUser = {
      id: "user-1",
      email: "aluno@ironforge.test",
      displayName: "Bruno Aluno",
      avatarUrl: null,
      coachId: "coach-1",
      athleteId: "athlete-1",
      createdAt: "2026-01-01T00:00:00.000Z",
    };

    it("faz POST em /auth/login e retorna a resposta parseada", async () => {
      mockFetchOk({ accessToken: "access", refreshToken: "refresh", user: validUser });

      const result = await login("aluno@ironforge.test", "senha-123");

      expect(result).toEqual({ accessToken: "access", refreshToken: "refresh", user: validUser });
      const [url, init] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
      expect(url).toContain("/auth/login");
      expect(init.method).toBe("POST");
      expect(init.body).toBe(JSON.stringify({ email: "aluno@ironforge.test", password: "senha-123" }));
    });

    it("lança quando a resposta não bate com o schema esperado", async () => {
      mockFetchOk({ accessToken: "access", user: validUser });

      await expect(login("aluno@ironforge.test", "senha-123")).rejects.toThrow();
    });
  });

  describe("fetchMe", () => {
    it("faz GET em /auth/me e retorna o usuário parseado", async () => {
      const user = {
        id: "user-1",
        email: "aluno@ironforge.test",
        displayName: "Bruno Aluno",
        avatarUrl: null,
        coachId: null,
        athleteId: null,
        createdAt: "2026-01-01T00:00:00.000Z",
      };
      mockFetchOk(user);

      const result = await fetchMe();

      expect(result).toEqual(user);
      const [url] = (global.fetch as jest.Mock).mock.calls[0] as [string];
      expect(url).toContain("/auth/me");
    });

    it("lança quando o e-mail retornado é inválido", async () => {
      mockFetchOk({
        id: "user-1",
        email: "não-é-email",
        displayName: "Bruno",
        avatarUrl: null,
        coachId: null,
        athleteId: null,
        createdAt: "2026-01-01T00:00:00.000Z",
      });

      await expect(fetchMe()).rejects.toThrow();
    });
  });
});
