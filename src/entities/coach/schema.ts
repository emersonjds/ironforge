import { z } from "zod";
import { MuscleSchema } from "@/types/enums";

export const CoachProfileSchema = z.object({
  userId: z.string(),
  slug: z.string(),
  bio: z.string().max(500).nullable(),
  cref: z.string().nullable(),
  specialties: z.array(MuscleSchema).default([]),
  maxAthletes: z.number().int().positive().nullable(),
  createdAt: z.string().datetime(),
});
export type CoachProfile = z.infer<typeof CoachProfileSchema>;

export const CoachAthleteRelationSchema = z.object({
  id: z.string(),
  coachId: z.string(),
  athleteId: z.string(),
  status: z.enum(["pending", "active", "suspended", "terminated"]),
  startedAt: z.string().datetime(),
  terminatedAt: z.string().datetime().nullable().default(null),
});
export type CoachAthleteRelation = z.infer<typeof CoachAthleteRelationSchema>;
