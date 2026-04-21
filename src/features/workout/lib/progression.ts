import type { MovementPattern } from "@/types/domain";

export type ProgressionReason =
  | "first_time"
  | "increase_weight"
  | "increase_reps"
  | "hold"
  | "deload";

export interface ProgressionSuggestion {
  weight: number;
  reps: number;
  reason: ProgressionReason;
}

export interface PreviousSet {
  weight: number;
  reps: number;
  rir: number | null;
}

const UPPER_PATTERNS: MovementPattern[] = [
  "push_h",
  "push_v",
  "pull_h",
  "pull_v",
  "isolation",
];

export function isUpperBody(pattern: MovementPattern): boolean {
  return UPPER_PATTERNS.includes(pattern);
}

export function weightIncrement(pattern: MovementPattern): number {
  return isUpperBody(pattern) ? 2.5 : 5;
}

export function suggestNextSet(opts: {
  lastSets: readonly PreviousSet[];
  repRangeMin: number;
  repRangeMax: number;
  targetRir: number;
  pattern: MovementPattern;
}): ProgressionSuggestion {
  const { lastSets, repRangeMin, repRangeMax, targetRir, pattern } = opts;
  const working = lastSets.filter((s) => s.reps > 0);

  if (!working.length) {
    return { weight: 0, reps: repRangeMin, reason: "first_time" };
  }

  const topWeight = Math.max(...working.map((s) => s.weight));
  const allAtTop = working.every(
    (s) => s.reps >= repRangeMax && (s.rir ?? 0) >= targetRir,
  );

  if (allAtTop) {
    return {
      weight: topWeight + weightIncrement(pattern),
      reps: repRangeMin,
      reason: "increase_weight",
    };
  }

  const lastSet = working[working.length - 1]!;
  if (lastSet.reps < repRangeMax && (lastSet.rir ?? 0) >= 1) {
    return {
      weight: lastSet.weight,
      reps: Math.min(lastSet.reps + 1, repRangeMax),
      reason: "increase_reps",
    };
  }

  return {
    weight: topWeight,
    reps: lastSet.reps,
    reason: "hold",
  };
}
