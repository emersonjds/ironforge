import { z } from "zod";
import { MuscleSchema, EquipmentSchema, MovementPatternSchema, MuscleEmphasisSchema, ExperienceSchema } from "@/types/enums";

export const ExerciseSchema = z.object({
  id: z.string(),
  name: z.string(),
  primaryMuscle: MuscleSchema,
  secondaryMuscles: z.array(MuscleSchema).default([]),
  equipment: EquipmentSchema,
  movementPattern: MovementPatternSchema,
  isUnilateral: z.boolean().default(false),
  baseExerciseId: z.string().nullable().default(null),
  variationType: z.string().nullable().default(null),
  equipmentDetail: z.string().nullable().default(null),
  muscleEmphasis: MuscleEmphasisSchema.nullable().default(null),
  difficultyLevel: ExperienceSchema.default("intermediate"),
  requiresSpotter: z.boolean().default(false),
  riskFlags: z.array(z.string()).default([]),
  ownerCoachId: z.string().nullable().default(null),
});
export type Exercise = z.infer<typeof ExerciseSchema>;
