import type { Session, SetLog } from "@/types/domain";
import { bestE1RM } from "./e1rm";

export interface ExerciseDelta {
  planExerciseId: string;
  currentBestWeight: number;
  currentBestReps: number;
  currentE1RM: number;
  deltaKg: number | null;
  deltaReps: number | null;
  deltaE1RM: number | null;
  status: "increase_weight" | "increase_reps" | "same" | "regression" | "first_time";
}

export function sessionTotalVolume(session: Session): number {
  return session.sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
}

export function sessionDurationSeconds(session: Session): number {
  if (!session.endedAt) return 0;
  return Math.floor(
    (new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 1000,
  );
}

export function sessionTopSetPerExercise(session: Session): Map<string, SetLog> {
  const map = new Map<string, SetLog>();
  for (const s of session.sets) {
    const current = map.get(s.planExerciseId);
    if (!current || s.weight * s.reps > current.weight * current.reps) {
      map.set(s.planExerciseId, s);
    }
  }
  return map;
}

export function deltaVsPrevious(opts: {
  currentSets: readonly SetLog[];
  previousSets: readonly { weight: number; reps: number }[];
  planExerciseId: string;
}): ExerciseDelta {
  const { currentSets, previousSets, planExerciseId } = opts;
  const current = currentSets.filter((s) => s.planExerciseId === planExerciseId);

  const currentE1RM = bestE1RM(current.map((s) => ({ weight: s.weight, reps: s.reps })));
  const topWeight = current.reduce((m, s) => Math.max(m, s.weight), 0);
  const topWeightSet = current.find((s) => s.weight === topWeight);
  const currentTopReps = topWeightSet?.reps ?? 0;

  if (!previousSets.length) {
    return {
      planExerciseId,
      currentBestWeight: topWeight,
      currentBestReps: currentTopReps,
      currentE1RM,
      deltaKg: null,
      deltaReps: null,
      deltaE1RM: null,
      status: "first_time",
    };
  }

  const previousE1RM = bestE1RM(previousSets);
  const previousTopWeight = previousSets.reduce((m, s) => Math.max(m, s.weight), 0);
  const previousTopSet = previousSets.find((s) => s.weight === previousTopWeight);
  const previousTopReps = previousTopSet?.reps ?? 0;

  const deltaKg = topWeight - previousTopWeight;
  const deltaReps = currentTopReps - previousTopReps;
  const deltaE1RM = currentE1RM - previousE1RM;

  let status: ExerciseDelta["status"] = "same";
  if (deltaKg > 0) status = "increase_weight";
  else if (deltaKg === 0 && deltaReps > 0) status = "increase_reps";
  else if (deltaE1RM < -0.5) status = "regression";

  return {
    planExerciseId,
    currentBestWeight: topWeight,
    currentBestReps: currentTopReps,
    currentE1RM,
    deltaKg,
    deltaReps,
    deltaE1RM,
    status,
  };
}
