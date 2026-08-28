import { apiRequest, ApiError, setUnauthorizedHandler } from "@shared/lib/api/client";
import { setApiAuthToken } from "@shared/lib/api/auth-token";

describe("apiRequest - resposta 401", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    setUnauthorizedHandler(null);
  });

  function mockFetchResponse(status: number, payload: unknown) {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status,
      json: async () => payload,
    }) as unknown as typeof fetch;
  }

  it("dispara o handler de unauthorized e lança ApiError quando a API responde 401", async () => {
    const handler = jest.fn();
    setUnauthorizedHandler(handler);
    mockFetchResponse(401, { message: "Token expirado", code: "UNAUTHORIZED" });

    await expect(apiRequest("/auth/me")).rejects.toThrow(ApiError);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("não dispara o handler quando o erro não é 401", async () => {
    const handler = jest.fn();
    setUnauthorizedHandler(handler);
    mockFetchResponse(500, { message: "Erro interno" });

    await expect(apiRequest("/plans")).rejects.toThrow(ApiError);
    expect(handler).not.toHaveBeenCalled();
  });

  it("não quebra quando nenhum handler foi registrado", async () => {
    setUnauthorizedHandler(null);
    mockFetchResponse(401, { message: "Token expirado" });

    await expect(apiRequest("/auth/me")).rejects.toThrow(ApiError);
  });

  it("usa a mensagem padrão quando o corpo do erro não é JSON válido", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error("corpo vazio");
      },
    }) as unknown as typeof fetch;

    await expect(apiRequest("/plans")).rejects.toMatchObject({
      message: "Erro ao chamar /plans",
      status: 500,
      code: null,
    });
  });

  it("lê code/message do formato antigo (sem wrapper error)", async () => {
    mockFetchResponse(400, { code: "BAD_INPUT", message: "Dado inválido" });

    await expect(apiRequest("/plans")).rejects.toMatchObject({
      message: "Dado inválido",
      code: "BAD_INPUT",
    });
  });
});

describe("apiRequest - resposta com sucesso", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    setApiAuthToken(null);
  });

  it("envia Authorization quando há token e retorna o corpo parseado", async () => {
    setApiAuthToken("token-123");
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: "plan-1" }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await apiRequest<{ id: string }>("/plans/plan-1");

    expect(result).toEqual({ id: "plan-1" });
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer token-123");
  });

  it("não envia Authorization quando não há token", async () => {
    setApiAuthToken(null);
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await apiRequest("/plans");

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>).Authorization).toBeUndefined();
  });

  it("serializa o body em POST", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await apiRequest("/auth/login", { method: "POST", body: { email: "a@b.com" } });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify({ email: "a@b.com" }));
  });

  it("retorna undefined para resposta 204 sem corpo", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 204,
      json: async () => {
        throw new Error("não deveria ser chamado em 204");
      },
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await apiRequest("/sets/set-1");

    expect(result).toBeUndefined();
  });
});
