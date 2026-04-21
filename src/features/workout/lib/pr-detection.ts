import { estimated1RM, type E1RMFormula } from "./e1rm";

export type PRType = "e1rm" | "rep_max";

export interface PRResult {
  type: PRType;
  weight: number;
  reps: number;
  previousBest: number;
  delta: number;
}

export interface SetSnapshot {
  weight: number;
  reps: number;
}

export function detectPRs(opts: {
  currentSet: SetSnapshot;
  history: readonly SetSnapshot[];
  formula?: E1RMFormula;
}): PRResult[] {
  const { currentSet, history, formula = "epley" } = opts;
  const prs: PRResult[] = [];

  if (currentSet.weight <= 0 || currentSet.reps <= 0) return prs;

  const currentE1RM = estimated1RM(currentSet.weight, currentSet.reps, formula);
  const bestE1RM = history.reduce(
    (max, h) => Math.max(max, estimated1RM(h.weight, h.reps, formula)),
    0,
  );
  if (currentE1RM > bestE1RM) {
    prs.push({
      type: "e1rm",
      weight: currentE1RM,
      reps: currentSet.reps,
      previousBest: bestE1RM,
      delta: currentE1RM - bestE1RM,
    });
  }

  const sameReps = history.filter((h) => h.reps === currentSet.reps);
  const bestAtReps = sameReps.reduce((max, h) => Math.max(max, h.weight), 0);
  if (currentSet.weight > bestAtReps) {
    prs.push({
      type: "rep_max",
      weight: currentSet.weight,
      reps: currentSet.reps,
      previousBest: bestAtReps,
      delta: currentSet.weight - bestAtReps,
    });
  }

  return prs;
}
