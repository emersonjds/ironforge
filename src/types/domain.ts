/**
 * Fachada pública do domínio v2.
 * Cada entidade vive em src/entities/<name>/schema.ts.
 * Este arquivo reexporta tudo para não quebrar imports existentes
 * enquanto a migração incremental de imports ocorre.
 */

// Enums compartilhados
export {
  MuscleSchema,
  EquipmentSchema,
  MovementPatternSchema,
  SetTypeSchema,
  MuscleEmphasisSchema,
  ExperienceSchema,
  GoalSchema,
  UnitSystemSchema,
  PerformerGenderSchema,
} from "./enums";
export type {
  Muscle,
  Equipment,
  MovementPattern,
  SetType,
  MuscleEmphasis,
  Experience,
  Goal,
  UnitSystem,
  PerformerGender,
} from "./enums";

// Identidade
export { UserSchema } from "./user";
export type { User } from "./user";

// Perfis
export { AthleteProfileSchema } from "@/entities/athlete/schema";
export type { AthleteProfile } from "@/entities/athlete/schema";
export { CoachProfileSchema, CoachAthleteRelationSchema } from "@/entities/coach/schema";
export type { CoachProfile, CoachAthleteRelation } from "@/entities/coach/schema";

// Exercício e vídeo
export { ExerciseSchema } from "@/entities/exercise/schema";
export type { Exercise } from "@/entities/exercise/schema";
export { VideoSchema, ExerciseDemoSchema } from "@/entities/video/schema";
export type { Video, ExerciseDemo } from "@/entities/video/schema";

// Planos
export {
  PlanExerciseSchema,
  PlanDaySchema,
  PlanTemplateSchema,
  WeekConfigSchema,
  AssignedPlanSchema,
} from "@/entities/plan/schema";
export type {
  PlanExercise,
  PlanDay,
  PlanTemplate,
  WeekConfig,
  AssignedPlan,
} from "@/entities/plan/schema";

// Sessão e sets
export { SessionSchema, SetLogSchema } from "@/entities/session/schema";
export type { Session, SetLog } from "@/entities/session/schema";

// Histórico de carga
export { LoadHistoryEntrySchema, AdaptationLogSchema, withoutDeleted } from "@/entities/load-history/schema";
export type { LoadHistoryEntry, AdaptationLog } from "@/entities/load-history/schema";
