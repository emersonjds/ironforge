import { fetchMeasurements, fetchCoachPayment } from "@entities/athlete/api";

function mockFetchOk(payload: unknown, status = 200) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status,
    json: async () => payload,
  }) as unknown as typeof fetch;
}

function mockFetchError(status: number, body: unknown = { error: { code: "NOT_FOUND", message: "not found" } }) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: false,
    status,
    json: async () => body,
  }) as unknown as typeof fetch;
}

const MEASUREMENT = {
  id: "m-1",
  athleteId: "athlete-1",
  recordedBy: "coach-1",
  measuredAt: "2026-06-01T00:00:00.000Z",
  weightKg: 82,
  bodyFatPercent: null,
  chestCm: null,
  waistCm: null,
  hipCm: null,
  rightArmCm: null,
  leftArmCm: null,
  rightThighCm: null,
  leftThighCm: null,
  calfCm: null,
  notes: null,
  version: 1,
  createdAt: "2026-06-01T00:00:00.000Z",
  updatedAt: "2026-06-01T00:00:00.000Z",
};

describe("fetchMeasurements", () => {
  it("busca /athletes/me/measurements e retorna a lista parseada", async () => {
    mockFetchOk([MEASUREMENT]);

    const result = await fetchMeasurements();

    expect(result).toHaveLength(1);
    expect(result[0]!.weightKg).toBe(82);
    const [url] = (global.fetch as jest.Mock).mock.calls[0] as [string];
    expect(url).toContain("/athletes/me/measurements");
  });

  it("resposta vazia: retorna lista vazia (seed ainda não popula medidas)", async () => {
    mockFetchOk([]);

    await expect(fetchMeasurements()).resolves.toEqual([]);
  });
});

describe("fetchCoachPayment", () => {
  it("busca /athletes/me/coach-payment e retorna os dados parseados", async () => {
    mockFetchOk({
      coachDisplayName: "Coach Amanda",
      pixKey: "amanda@pix.com",
      pixKeyType: "email",
      monthlyPriceCents: 25000,
      paymentNotes: "Vencimento todo dia 5",
    });

    const result = await fetchCoachPayment();

    expect(result).toEqual({
      coachDisplayName: "Coach Amanda",
      pixKey: "amanda@pix.com",
      pixKeyType: "email",
      monthlyPriceCents: 25000,
      paymentNotes: "Vencimento todo dia 5",
    });
  });

  it("404 (sem personal ativo): retorna null em vez de lançar", async () => {
    mockFetchError(404);

    await expect(fetchCoachPayment()).resolves.toBeNull();
  });

  it("outros erros: propaga a exceção", async () => {
    mockFetchError(500, { error: { code: "INTERNAL", message: "boom" } });

    await expect(fetchCoachPayment()).rejects.toThrow();
  });
});
