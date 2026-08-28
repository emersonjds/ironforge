import { activeWeeksCount, averageWeeklyVolume } from "@entities/load-history/lib/summary-stats";
import type { WeekSummary } from "@entities/load-history/api";

function week(totalVolume: number): WeekSummary {
  return { weekStart: "2026-08-03T00:00:00.000Z", totalVolume, maxWeight: 100 };
}

describe("activeWeeksCount", () => {
  it("conta só semanas com volume maior que zero", () => {
    expect(activeWeeksCount([week(0), week(4200), week(0), week(3900)])).toBe(2);
  });

  it("sem semanas: zero", () => {
    expect(activeWeeksCount([])).toBe(0);
  });
});

describe("averageWeeklyVolume", () => {
  it("calcula a média só das semanas ativas", () => {
    expect(averageWeeklyVolume([week(4000), week(0), week(6000)])).toBe(5000);
  });

  it("sem semanas ativas: zero", () => {
    expect(averageWeeklyVolume([week(0), week(0)])).toBe(0);
  });
});
