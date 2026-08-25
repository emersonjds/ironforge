import { apiRequest } from "@shared/lib/api/client";
import { ExerciseDemoListSchema, type ExerciseDemo } from "./schema";

export async function fetchExerciseDemos(exerciseId: string): Promise<ExerciseDemo[]> {
  const raw = await apiRequest<unknown>(`/exercises/${exerciseId}/demos`);
  return ExerciseDemoListSchema.parse(raw);
}
