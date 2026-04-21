import { z } from "zod";

export const MuscleSchema = z.enum([
  "chest",
  "back_lats",
  "back_upper",
  "back_lower",
  "quads",
  "hamstrings",
  "glutes",
  "calves",
  "shoulders_front",
  "shoulders_side",
  "shoulders_rear",
  "biceps",
  "triceps",
  "forearms",
  "core",
]);
export type Muscle = z.infer<typeof MuscleSchema>;

export const EquipmentSchema = z.enum([
  "barbell",
  "dumbbell",
  "machine",
  "cable",
  "bodyweight",
  "kettlebell",
  "smith",
]);
export type Equipment = z.infer<typeof EquipmentSchema>;

export const MovementPatternSchema = z.enum([
  "push_h",
  "push_v",
  "pull_h",
  "pull_v",
  "squat",
  "hinge",
  "lunge",
  "carry",
  "isolation",
]);
export type MovementPattern = z.infer<typeof MovementPatternSchema>;

export const ExerciseSchema = z.object({
  id: z.string(),
  name: z.string(),
  primaryMuscle: MuscleSchema,
  secondaryMuscles: z.array(MuscleSchema).default([]),
  equipment: EquipmentSchema,
  movementPattern: MovementPatternSchema,
  isUnilateral: z.boolean().default(false),
});
export type Exercise = z.infer<typeof ExerciseSchema>;

export const SetTypeSchema = z.enum(["warmup", "working", "backoff", "dropset", "myorep"]);
export type SetType = z.infer<typeof SetTypeSchema>;

export const SetLogSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  planExerciseId: z.string(),
  setIndex: z.number().int().min(1),
  type: SetTypeSchema.default("working"),
  weight: z.number().min(0).multipleOf(0.5),
  reps: z.number().int().min(0),
  rir: z.number().int().min(0).max(10).nullable(),
  restTakenSeconds: z.number().int().min(0).nullable(),
  completedAt: z.string().datetime(),
  notes: z.string().max(500).nullable(),
  syncedAt: z.string().datetime().nullable(),
});
export type SetLog = z.infer<typeof SetLogSchema>;

export const PlanExerciseSchema = z.object({
  id: z.string(),
  planDayId: z.string(),
  exerciseId: z.string(),
  order: z.number().int().min(0),
  targetSets: z.number().int().min(1).max(20),
  repRangeMin: z.number().int().min(1),
  repRangeMax: z.number().int().min(1),
  restSeconds: z.number().int().min(30),
  targetRir: z.number().int().min(0).max(5),
});
export type PlanExercise = z.infer<typeof PlanExerciseSchema>;

export const PlanDaySchema = z.object({
  id: z.string(),
  mesocycleId: z.string(),
  dayIndex: z.number().int().min(1).max(7),
  name: z.string(),
  exercises: z.array(PlanExerciseSchema).default([]),
});
export type PlanDay = z.infer<typeof PlanDaySchema>;

export const MesocycleSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  weeks: z.number().int().min(1).max(16),
  startDate: z.string().datetime(),
  status: z.enum(["active", "archived", "completed"]),
  days: z.array(PlanDaySchema).default([]),
});
export type Mesocycle = z.infer<typeof MesocycleSchema>;

export const SessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  planDayId: z.string(),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime().nullable(),
  bodyweightAtSession: z.number().min(0).nullable(),
  notes: z.string().max(1000).nullable(),
  perceivedFatigue: z.number().int().min(1).max(10).nullable(),
  sets: z.array(SetLogSchema).default([]),
});
export type Session = z.infer<typeof SessionSchema>;

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  unitSystem: z.enum(["kg", "lb"]).default("kg"),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]).default("intermediate"),
  goal: z.enum(["hypertrophy", "strength", "cutting", "recomp"]).default("hypertrophy"),
  onboardingCompleted: z.boolean().default(false),
});
export type User = z.infer<typeof UserSchema>;
