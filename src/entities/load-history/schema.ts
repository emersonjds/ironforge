import { z } from "zod";
import { SetTypeSchema } from "@/types/enums";

export const LoadHistoryEntrySchema = z.object({
  id: z.string(),
  athleteId: z.string(),
  exerciseId: z.string(),
  weight: z.number().min(0).multipleOf(0.5),
  reps: z.number().int().min(1),
  rir: z.number().int().min(0).max(10).nullable(),
  setType: SetTypeSchema,
  performedAt: z.string().datetime(),
  sessionId: z.string(),
  invalidatedAt: z.string().datetime().nullable().default(null),
  invalidationReason: z
    .enum(["manual_override", "weight_change_requested", "coach_reset"])
    .nullable()
    .default(null),
});
export type LoadHistoryEntry = z.infer<typeof LoadHistoryEntrySchema>;

export const AdaptationLogSchema = z.object({
  id: z.string(),
  assignedPlanId: z.string(),
  templateId: z.string().nullable(),
  coachId: z.string(),
  adaptedAt: z.string().datetime(),
  reason: z.string(),
  changes: z
    .array(z.object({ field: z.string(), from: z.unknown(), to: z.unknown() }))
    .default([]),
});
export type AdaptationLog = z.infer<typeof AdaptationLogSchema>;

export function withoutDeleted<T extends { deletedAt?: string | null; invalidatedAt?: string | null }>(
  rows: T[],
): T[] {
  return rows.filter((r) => !r.deletedAt && !r.invalidatedAt);
}
