import { apiRequest, ApiError, setUnauthorizedHandler } from "@shared/lib/api/client";

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
});
