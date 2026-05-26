import { z } from "zod";
import { GoalSchema, ExperienceSchema, UnitSystemSchema } from "@/types/enums";

export const AthleteProfileSchema = z.object({
  userId: z.string(),
  coachId: z.string().nullable(),
  goal: GoalSchema.default("hypertrophy"),
  experienceLevel: ExperienceSchema.default("intermediate"),
  unitSystem: UnitSystemSchema.default("kg"),
  bodyweightKg: z.number().min(0).nullable(),
  restrictions: z.array(z.string()).default([]),
  videoPerformerPref: z.enum(["same", "any"]).default("any"),
  onboardingCompleted: z.boolean().default(false),
});
export type AthleteProfile = z.infer<typeof AthleteProfileSchema>;
