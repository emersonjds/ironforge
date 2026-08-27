import type { Measurement } from "../api";

export interface BodyWeightPoint {
  measuredAt: string;
  kg: number;
}

export function toBodyWeightSeries(measurements: Measurement[]): BodyWeightPoint[] {
  return measurements
    .filter((m): m is Measurement & { weightKg: number } => m.weightKg !== null)
    .map((m) => ({ measuredAt: m.measuredAt, kg: m.weightKg }))
    .sort((a, b) => a.measuredAt.localeCompare(b.measuredAt));
}
