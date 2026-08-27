import type { WeekSummary } from "../api";

export function activeWeeksCount(weeks: WeekSummary[]): number {
  return weeks.filter((w) => w.totalVolume > 0).length;
}

export function averageWeeklyVolume(weeks: WeekSummary[]): number {
  const active = weeks.filter((w) => w.totalVolume > 0);
  if (!active.length) return 0;
  return active.reduce((sum, w) => sum + w.totalVolume, 0) / active.length;
}
