import { useMemo } from "react";
import { useExercises } from "./use-exercises";
import type { Exercise } from "../schema";

interface UseExerciseResult {
  exercise: Exercise | null;
  isLoading: boolean;
  isError: boolean;
}

export function useExercise(exerciseId: string | null): UseExerciseResult {
  const { data, isLoading, isError } = useExercises();
  const exercise = useMemo(
    () => (exerciseId ? (data?.find((e) => e.id === exerciseId) ?? null) : null),
    [data, exerciseId],
  );
  return { exercise, isLoading, isError };
}
