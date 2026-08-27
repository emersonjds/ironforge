import { fetchLoadHistorySummary, fetchPersonalRecords } from "@entities/load-history/api";

function mockFetchOk(payload: unknown, status = 200) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status,
    json: async () => payload,
  }) as unknown as typeof fetch;
}

describe("fetchLoadHistorySummary", () => {
  it("busca /load-history/summary e retorna as semanas parseadas", async () => {
    mockFetchOk({
      weeks: [
        { weekStart: "2026-08-03T00:00:00.000Z", totalVolume: 4200, maxWeight: 120 },
        { weekStart: "2026-08-10T00:00:00.000Z", totalVolume: 4600, maxWeight: 125 },
      ],
    });

    const weeks = await fetchLoadHistorySummary(12);

    expect(weeks).toHaveLength(2);
    expect(weeks[0]).toEqual({
      weekStart: "2026-08-03T00:00:00.000Z",
      totalVolume: 4200,
      maxWeight: 120,
    });
    const [url] = (global.fetch as jest.Mock).mock.calls[0] as [string];
    expect(url).toContain("/load-history/summary");
    expect(url).toContain("weeks=12");
  });

  it("resposta vazia: retorna lista vazia sem lançar", async () => {
    mockFetchOk({ weeks: [] });

    const weeks = await fetchLoadHistorySummary();

    expect(weeks).toEqual([]);
  });

  it("lança quando a resposta não bate com o schema esperado", async () => {
    mockFetchOk({ weeks: [{ weekStart: "2026-08-03T00:00:00.000Z" }] });

    await expect(fetchLoadHistorySummary()).rejects.toThrow();
  });
});

describe("fetchPersonalRecords", () => {
  it("busca /load-history/personal-records e retorna a lista parseada", async () => {
    mockFetchOk([
      { exerciseId: "ex-1", weight: 120, reps: 3, performedAt: "2026-03-28T12:00:00.000Z" },
    ]);

    const records = await fetchPersonalRecords();

    expect(records).toHaveLength(1);
    expect(records[0]).toEqual({
      exerciseId: "ex-1",
      weight: 120,
      reps: 3,
      performedAt: "2026-03-28T12:00:00.000Z",
    });
    const [url] = (global.fetch as jest.Mock).mock.calls[0] as [string];
    expect(url).toContain("/load-history/personal-records");
  });

  it("resposta vazia: retorna lista vazia sem lançar", async () => {
    mockFetchOk([]);

    await expect(fetchPersonalRecords()).resolves.toEqual([]);
  });
});
