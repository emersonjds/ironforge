import { z } from "zod";
import { ExperienceSchema, GoalSchema } from "@/types/enums";

export const PlanExerciseSchema = z.object({
  id: z.string(),
  exerciseId: z.string(),
  order: z.number().int().min(0),
  targetSets: z.number().int().min(1),
  repRangeMin: z.number().int().min(1),
  repRangeMax: z.number().int().min(1),
  restSeconds: z.number().int().min(0),
  targetRir: z.number().int().min(0).max(10),
  isSupersetWith: z.string().nullable().default(null),
  coachNote: z.string().max(500).nullable().default(null),
});
export type PlanExercise = z.infer<typeof PlanExerciseSchema>;

export const PlanDaySchema = z.object({
  id: z.string(),
  slotLabel: z.string(),
  slotIndex: z.number().int().min(0),
  name: z.string(),
  targetDaysOfWeek: z.array(z.number().int().min(0).max(6)).default([]),
  exercises: z.array(PlanExerciseSchema).default([]),
});
export type PlanDay = z.infer<typeof PlanDaySchema>;

export const PlanTemplateSchema = z.object({
  id: z.string(),
  coachId: z.string(),
  name: z.string(),
  weeks: z.number().int().min(1).max(16),
  targetLevel: ExperienceSchema.default("intermediate"),
  targetGoal: GoalSchema.default("hypertrophy"),
  description: z.string().nullable().default(null),
  days: z.array(PlanDaySchema).default([]),
  deletedAt: z.string().datetime().nullable().default(null),
  createdAt: z.string().datetime(),
});
export type PlanTemplate = z.infer<typeof PlanTemplateSchema>;

export const WeekConfigSchema = z.object({
  weekNumber: z.number().int().min(1),
  volumeMultiplier: z.number().min(0.5).max(1.5).default(1),
  rir: z.number().int().min(0).max(10).nullable().default(null),
  intensityNote: z.string().nullable().default(null),
});
export type WeekConfig = z.infer<typeof WeekConfigSchema>;

export const AssignedPlanSchema = z.object({
  id: z.string(),
  athleteId: z.string(),
  coachId: z.string().nullable(),
  templateId: z.string().nullable(),
  name: z.string(),
  weeks: z.number().int().min(1).max(16),
  startDate: z.string().date(),
  status: z.enum(["active", "paused", "completed", "archived"]),
  days: z.array(PlanDaySchema).default([]),
  weekConfigs: z.array(WeekConfigSchema).default([]),
  weekVisibility: z.enum(["current_only", "current_and_next", "all"]).default("current_and_next"),
  coachNotes: z.string().max(2000).nullable().default(null),
  version: z.number().int().default(1),
  deletedAt: z.string().datetime().nullable().default(null),
  createdAt: z.string().datetime(),
  syncedAt: z.string().datetime().nullable().default(null),
});
export type AssignedPlan = z.infer<typeof AssignedPlanSchema>;
