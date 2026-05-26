import { z } from "zod";
import { SetTypeSchema } from "@/types/enums";

export const SessionSchema = z.object({
  id: z.string(),
  athleteId: z.string(),
  assignedPlanId: z.string().nullable(),
  planDayId: z.string().nullable(),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime().nullable(),
  bodyweightKg: z.number().min(0).nullable(),
  perceivedFatigue: z.number().int().min(1).max(10).nullable(),
  notes: z.string().max(1000).nullable().default(null),
  syncedAt: z.string().datetime().nullable().default(null),
});
export type Session = z.infer<typeof SessionSchema>;

export const SetLogSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  exerciseId: z.string(),
  planExerciseId: z.string().nullable(),
  assignedPlanId: z.string().nullable(),
  setIndex: z.number().int().min(1),
  type: SetTypeSchema.default("working"),
  weight: z.number().min(0).multipleOf(0.5),
  reps: z.number().int().min(0),
  rir: z.number().int().min(0).max(10).nullable(),
  restTakenSeconds: z.number().int().min(0).nullable(),
  completedAt: z.string().datetime(),
  notes: z.string().max(500).nullable().default(null),
  editedAt: z.string().datetime().nullable().default(null),
  originalWeight: z.number().min(0).nullable().default(null),
  deletedAt: z.string().datetime().nullable().default(null),
  syncedAt: z.string().datetime().nullable().default(null),
});
export type SetLog = z.infer<typeof SetLogSchema>;

/**
 * Sessão com seus sets embarcados — read-model usado na fronteira de storage
 * (histórico, última sessão). É o formato persistido em AsyncStorage.
 */
export const SessionWithSetsSchema = SessionSchema.extend({
  sets: z.array(SetLogSchema).default([]),
});
export type SessionWithSets = z.infer<typeof SessionWithSetsSchema>;
