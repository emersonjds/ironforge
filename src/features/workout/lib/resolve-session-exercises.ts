import type { PlanDay, PlanExercise } from "@entities/plan";
import type { Exercise } from "@entities/exercise";

export interface SessionExerciseView {
  planExercise: PlanExercise;
  exercise: Exercise | null;
}

export function resolveSessionExercises(
  planDay: PlanDay,
  exercisesById: Map<string, Exercise>,
): SessionExerciseView[] {
  return [...planDay.exercises]
    .sort((a, b) => a.order - b.order)
    .map((planExercise) => ({
      planExercise,
      exercise: exercisesById.get(planExercise.exerciseId) ?? null,
    }));
}
