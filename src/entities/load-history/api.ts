import { z } from "zod";
import { apiRequest } from "@shared/lib/api/client";

const WeekSummarySchema = z.object({
  weekStart: z.string(),
  totalVolume: z.number(),
  maxWeight: z.number(),
});
export type WeekSummary = z.infer<typeof WeekSummarySchema>;

const LoadHistorySummaryResponseSchema = z.object({
  weeks: z.array(WeekSummarySchema),
});

export async function fetchLoadHistorySummary(weeks = 12): Promise<WeekSummary[]> {
  const raw = await apiRequest<unknown>(`/load-history/summary?weeks=${weeks}`);
  return LoadHistorySummaryResponseSchema.parse(raw).weeks;
}

const PersonalRecordEntrySchema = z.object({
  exerciseId: z.string(),
  weight: z.number(),
  reps: z.number(),
  performedAt: z.string(),
});
export type PersonalRecordEntry = z.infer<typeof PersonalRecordEntrySchema>;

export async function fetchPersonalRecords(): Promise<PersonalRecordEntry[]> {
  const raw = await apiRequest<unknown>("/load-history/personal-records");
  return z.array(PersonalRecordEntrySchema).parse(raw);
}
