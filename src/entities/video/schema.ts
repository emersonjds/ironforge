import { z } from "zod";
import { PerformerGenderSchema } from "@/types/enums";

export const VideoSchema = z.object({
  id: z.string(),
  coachId: z.string(),
  title: z.string(),
  status: z.enum(["pending", "processing", "ready", "error"]),
  durationSeconds: z.number().int().positive().nullable(),
  thumbnailUrl: z.string().url().nullable(),
  hlsUrl: z.string().url().nullable(),
  gifUrl: z.string().url().nullable(),
  performerGender: PerformerGenderSchema.default("all"),
  verifiedBy: z.string().nullable().default(null),
  verifiedAt: z.string().datetime().nullable().default(null),
  createdAt: z.string().datetime(),
});
export type Video = z.infer<typeof VideoSchema>;

export const ExerciseDemoSchema = z.object({
  exerciseId: z.string(),
  videoId: z.string(),
  isPrimary: z.boolean().default(false),
  coachNote: z.string().max(280).nullable().default(null),
});
export type ExerciseDemo = z.infer<typeof ExerciseDemoSchema>;
