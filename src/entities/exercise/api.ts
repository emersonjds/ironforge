import { z } from "zod";
import { apiRequest } from "@shared/lib/api/client";
import { ExerciseSchema } from "./schema";

const ExerciseListResponseSchema = z.object({
  items: z.array(ExerciseSchema),
  total: z.number(),
});

export async function fetchExercises(limit = 200) {
  const raw = await apiRequest<unknown>(`/exercises?limit=${limit}`);
  return ExerciseListResponseSchema.parse(raw).items;
}
