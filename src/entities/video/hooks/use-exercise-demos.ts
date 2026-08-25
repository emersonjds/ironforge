import { useQuery } from "@tanstack/react-query";
import { sortDemos } from "../lib/sort-demos";
import { fetchExerciseDemos } from "../api";

export function useExerciseDemos(exerciseId: string | null) {
  return useQuery({
    queryKey: ["exercise-demos", exerciseId],
    queryFn: () => fetchExerciseDemos(exerciseId as string),
    enabled: exerciseId !== null,
    select: sortDemos,
  });
}
