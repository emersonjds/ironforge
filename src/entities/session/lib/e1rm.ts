export type E1RMFormula = "epley" | "brzycki";

export function epley1RM(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

export function brzycki1RM(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return weight;
  if (reps >= 37) return 0;
  return (weight * 36) / (37 - reps);
}

export function estimated1RM(
  weight: number,
  reps: number,
  formula: E1RMFormula = "epley",
): number {
  return formula === "epley" ? epley1RM(weight, reps) : brzycki1RM(weight, reps);
}

export function bestE1RM(
  sets: readonly { weight: number; reps: number }[],
  formula: E1RMFormula = "epley",
): number {
  if (!sets.length) return 0;
  let best = 0;
  for (const s of sets) {
    const e = estimated1RM(s.weight, s.reps, formula);
    if (e > best) best = e;
  }
  return best;
}
