import { http, HttpResponse } from "msw";
import { API_BASE_URL, ApiError } from "@shared/lib/api/client";
import { fetchLoadHistorySummary, fetchPersonalRecords } from "@entities/load-history/api";
import { fetchMeasurements } from "@entities/athlete/api";
import { toBodyWeightSeries } from "@entities/athlete/lib/body-weight-series";
import { server } from "../../msw/server";
import {
  resetLoadHistoryHandlerState,
  seedWeekSummary,
  seedPersonalRecord,
} from "../../msw/load-history-handlers";
import { resetAthleteHandlerState, seedMeasurement } from "../../msw/athlete-handlers";

beforeEach(() => {
  resetLoadHistoryHandlerState();
  resetAthleteHandlerState();
});

describe("progresso: dado real vindo do resumo agregado", () => {
  it("desenha o volume semanal e recordes a partir de /load-history/summary e /personal-records", async () => {
    seedWeekSummary({ weekStart: "2026-08-03T00:00:00.000Z", totalVolume: 4200, maxWeight: 120 });
    seedWeekSummary({ weekStart: "2026-08-10T00:00:00.000Z", totalVolume: 4600, maxWeight: 125 });
    seedPersonalRecord({
      exerciseId: "ex-supino",
      weight: 120,
      reps: 3,
      performedAt: "2026-03-28T12:00:00.000Z",
    });

    const weeks = await fetchLoadHistorySummary(12);
    const records = await fetchPersonalRecords();

    expect(weeks).toHaveLength(2);
    expect(weeks[1]!.totalVolume).toBe(4600);
    expect(records).toHaveLength(1);
    expect(records[0]!.weight).toBe(120);
  });

  it("evolução corporal real: mede a partir de /athletes/me/measurements", async () => {
    seedMeasurement({ measuredAt: "2026-05-01T00:00:00.000Z", weightKg: 80 });
    seedMeasurement({ measuredAt: "2026-06-01T00:00:00.000Z", weightKg: 82 });

    const measurements = await fetchMeasurements();
    const series = toBodyWeightSeries(measurements);

    expect(series).toHaveLength(2);
    expect(series.map((p) => p.kg)).toEqual([80, 82]);
  });
});

describe("progresso: resposta vazia mostra estado vazio, não gráfico zerado", () => {
  it("sem medidas cadastradas (caso comum hoje): série vazia, não zero", async () => {
    const measurements = await fetchMeasurements();
    const series = toBodyWeightSeries(measurements);

    expect(measurements).toEqual([]);
    expect(series).toEqual([]);
  });

  it("sem semanas no resumo: lista de volume vazia", async () => {
    const weeks = await fetchLoadHistorySummary();

    expect(weeks).toEqual([]);
  });
});

describe("progresso: erro de rede mostra estado de erro com repetição", () => {
  it("primeira tentativa falha, repetir depois de reconectar dá certo", async () => {
    server.use(http.get(`${API_BASE_URL}/load-history/summary`, () => HttpResponse.error()));

    await expect(fetchLoadHistorySummary()).rejects.toThrow();

    server.resetHandlers();
    seedWeekSummary({ weekStart: "2026-08-03T00:00:00.000Z", totalVolume: 4200, maxWeight: 120 });

    const weeks = await fetchLoadHistorySummary();
    expect(weeks).toHaveLength(1);
  });

  it("erro 500 do servidor propaga ApiError para a tela decidir o estado de erro", async () => {
    server.use(
      http.get(`${API_BASE_URL}/load-history/personal-records`, () =>
        HttpResponse.json({ error: { code: "INTERNAL", message: "boom" } }, { status: 500 }),
      ),
    );

    await expect(fetchPersonalRecords()).rejects.toBeInstanceOf(ApiError);
  });
});
