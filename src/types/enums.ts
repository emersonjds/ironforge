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
  "band",
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

export const SetTypeSchema = z.enum(["warmup", "working", "backoff", "dropset", "myorep"]);
export type SetType = z.infer<typeof SetTypeSchema>;

export const MuscleEmphasisSchema = z.enum(["stretch", "peak", "mid_range"]);
export type MuscleEmphasis = z.infer<typeof MuscleEmphasisSchema>;

export const ExperienceSchema = z.enum(["beginner", "intermediate", "advanced"]);
export type Experience = z.infer<typeof ExperienceSchema>;

export const GoalSchema = z.enum(["hypertrophy", "strength", "cutting", "recomp"]);
export type Goal = z.infer<typeof GoalSchema>;

export const UnitSystemSchema = z.enum(["kg", "lb"]);
export type UnitSystem = z.infer<typeof UnitSystemSchema>;

export const PerformerGenderSchema = z.enum(["male", "female", "all"]);
export type PerformerGender = z.infer<typeof PerformerGenderSchema>;
