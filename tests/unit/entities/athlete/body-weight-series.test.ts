import { toBodyWeightSeries } from "@entities/athlete/lib/body-weight-series";
import type { Measurement } from "@entities/athlete/api";

function measurement(overrides: Partial<Measurement>): Measurement {
  return {
    id: "m-1",
    athleteId: "athlete-1",
    recordedBy: "coach-1",
    measuredAt: "2026-06-01T00:00:00.000Z",
    weightKg: null,
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
    ...overrides,
  };
}

describe("toBodyWeightSeries", () => {
  it("sem medidas: retorna série vazia", () => {
    expect(toBodyWeightSeries([])).toEqual([]);
  });

  it("descarta medidas sem peso registrado", () => {
    const series = toBodyWeightSeries([measurement({ weightKg: null })]);
    expect(series).toEqual([]);
  });

  it("ordena por data e mapeia peso", () => {
    const series = toBodyWeightSeries([
      measurement({ measuredAt: "2026-06-15T00:00:00.000Z", weightKg: 82 }),
      measurement({ measuredAt: "2026-05-01T00:00:00.000Z", weightKg: 80 }),
    ]);

    expect(series.map((p) => p.kg)).toEqual([80, 82]);
    expect(series[0]!.measuredAt).toBe("2026-05-01T00:00:00.000Z");
  });
});
