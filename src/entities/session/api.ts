import { z } from "zod";
import { apiRequest } from "@shared/lib/api/client";
import { SetTypeSchema } from "@/types/enums";
import type { Session, SetLog } from "./schema";

const ApiSessionSchema = z.object({
  id: z.string(),
  athleteId: z.string(),
  assignedPlanId: z.string().nullable(),
  planDayId: z.string().nullable(),
  startedAt: z.string(),
  endedAt: z.string().nullable(),
  bodyweightKg: z.number().nullable(),
  perceivedFatigue: z.number().int().nullable(),
  notes: z.string().nullable(),
  version: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ApiSession = z.infer<typeof ApiSessionSchema>;

const ApiSetLogSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  exerciseId: z.string(),
  planExerciseId: z.string().nullable(),
  assignedPlanId: z.string().nullable(),
  setIndex: z.number().int(),
  type: SetTypeSchema,
  weight: z.number(),
  reps: z.number().int(),
  rir: z.number().int().nullable(),
  restTakenSeconds: z.number().int().nullable(),
  completedAt: z.string(),
  notes: z.string().nullable(),
  editedAt: z.string().nullable(),
  originalWeight: z.number().nullable(),
  version: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ApiSetLog = z.infer<typeof ApiSetLogSchema>;

const ApiSessionDetailSchema = ApiSessionSchema.extend({ sets: z.array(ApiSetLogSchema) });
export type ApiSessionDetail = z.infer<typeof ApiSessionDetailSchema>;

const ApiSessionListSchema = z.object({
  items: z.array(ApiSessionSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

/**
 * A API indexa séries a partir de 0; o domínio local mostra "série 1, 2, 3..."
 * na UI e persiste esse mesmo valor. A conversão fica só aqui, na borda.
 */
export function toApiSetIndex(localSetIndex: number): number {
  return localSetIndex - 1;
}

export function fromApiSetIndex(apiSetIndex: number): number {
  return apiSetIndex + 1;
}

export function mapApiSessionToLocal(api: ApiSession): Session {
  return {
    id: api.id,
    athleteId: api.athleteId,
    assignedPlanId: api.assignedPlanId,
    planDayId: api.planDayId,
    startedAt: api.startedAt,
    endedAt: api.endedAt,
    bodyweightKg: api.bodyweightKg,
    perceivedFatigue: api.perceivedFatigue,
    notes: api.notes,
    syncedAt: new Date().toISOString(),
  };
}

export function mapApiSetToLocal(api: ApiSetLog): SetLog {
  return {
    id: api.id,
    sessionId: api.sessionId,
    exerciseId: api.exerciseId,
    planExerciseId: api.planExerciseId,
    assignedPlanId: api.assignedPlanId,
    setIndex: fromApiSetIndex(api.setIndex),
    type: api.type,
    weight: api.weight,
    reps: api.reps,
    rir: api.rir,
    restTakenSeconds: api.restTakenSeconds,
    completedAt: api.completedAt,
    notes: api.notes,
    editedAt: api.editedAt,
    originalWeight: api.originalWeight,
    deletedAt: null,
    syncedAt: new Date().toISOString(),
  };
}

export interface StartSessionInput {
  assignedPlanId: string | null;
  planDayId: string | null;
  startedAt: string;
  bodyweightKg?: number | null;
}

function toStartSessionBody(input: StartSessionInput) {
  return {
    ...(input.assignedPlanId ? { assignedPlanId: input.assignedPlanId } : {}),
    ...(input.planDayId ? { planDayId: input.planDayId } : {}),
    startedAt: input.startedAt,
    ...(input.bodyweightKg != null ? { bodyweightKg: input.bodyweightKg } : {}),
  };
}

export async function startSessionRequest(input: StartSessionInput): Promise<ApiSession> {
  const raw = await apiRequest<unknown>("/sessions", {
    method: "POST",
    body: toStartSessionBody(input),
  });
  return ApiSessionSchema.parse(raw);
}

export interface FinishSessionInput {
  endedAt: string;
  bodyweightKg?: number | null;
  perceivedFatigue?: number | null;
  notes?: string | null;
}

function toFinishSessionBody(input: FinishSessionInput) {
  return {
    endedAt: input.endedAt,
    ...(input.bodyweightKg != null ? { bodyweightKg: input.bodyweightKg } : {}),
    ...(input.perceivedFatigue != null ? { perceivedFatigue: input.perceivedFatigue } : {}),
    ...(input.notes ? { notes: input.notes } : {}),
  };
}

export async function finishSessionRequest(
  sessionId: string,
  input: FinishSessionInput,
): Promise<ApiSession> {
  const raw = await apiRequest<unknown>(`/sessions/${sessionId}`, {
    method: "PATCH",
    body: toFinishSessionBody(input),
  });
  return ApiSessionSchema.parse(raw);
}

function toLogSetBody(set: SetLog) {
  return {
    id: set.id,
    exerciseId: set.exerciseId,
    setIndex: toApiSetIndex(set.setIndex),
    type: set.type,
    weight: set.weight,
    reps: set.reps,
    completedAt: set.completedAt,
    ...(set.rir != null ? { rir: set.rir } : {}),
    ...(set.restTakenSeconds != null ? { restTakenSeconds: set.restTakenSeconds } : {}),
    ...(set.notes ? { notes: set.notes } : {}),
    ...(set.planExerciseId ? { planExerciseId: set.planExerciseId } : {}),
    ...(set.assignedPlanId ? { assignedPlanId: set.assignedPlanId } : {}),
  };
}

export async function logSetRequest(sessionId: string, set: SetLog): Promise<ApiSetLog> {
  const raw = await apiRequest<unknown>(`/sessions/${sessionId}/sets`, {
    method: "POST",
    body: toLogSetBody(set),
  });
  return ApiSetLogSchema.parse(raw);
}

export interface UpdateSetInput {
  weight?: number;
  reps?: number;
  rir?: number | null;
  restTakenSeconds?: number | null;
  completedAt?: string;
  notes?: string | null;
}

function toUpdateSetBody(input: UpdateSetInput) {
  return {
    ...(input.weight !== undefined ? { weight: input.weight } : {}),
    ...(input.reps !== undefined ? { reps: input.reps } : {}),
    ...(input.rir != null ? { rir: input.rir } : {}),
    ...(input.restTakenSeconds != null ? { restTakenSeconds: input.restTakenSeconds } : {}),
    ...(input.completedAt !== undefined ? { completedAt: input.completedAt } : {}),
    ...(input.notes ? { notes: input.notes } : {}),
  };
}

export async function updateSetRequest(setId: string, input: UpdateSetInput): Promise<ApiSetLog> {
  const raw = await apiRequest<unknown>(`/sets/${setId}`, {
    method: "PATCH",
    body: toUpdateSetBody(input),
  });
  return ApiSetLogSchema.parse(raw);
}

export async function deleteSetRequest(setId: string): Promise<void> {
  await apiRequest<void>(`/sets/${setId}`, { method: "DELETE" });
}

export interface FetchSessionsParams {
  limit?: number;
  offset?: number;
  from?: string;
  to?: string;
}

export interface SessionsPage {
  items: Session[];
  total: number;
  limit: number;
  offset: number;
}

export async function fetchSessions(params: FetchSessionsParams = {}): Promise<SessionsPage> {
  const search = new URLSearchParams();
  search.set("limit", String(params.limit ?? 20));
  search.set("offset", String(params.offset ?? 0));
  if (params.from) search.set("from", params.from);
  if (params.to) search.set("to", params.to);

  const raw = await apiRequest<unknown>(`/sessions?${search.toString()}`);
  const parsed = ApiSessionListSchema.parse(raw);
  return {
    items: parsed.items.map(mapApiSessionToLocal),
    total: parsed.total,
    limit: parsed.limit,
    offset: parsed.offset,
  };
}

/**
 * Busca a sessão mais recente do aluno autenticado; se ainda estiver aberta
 * (endedAt nulo), retorna com os sets para o app retomá-la. GET /sessions já
 * volta ordenado por startedAt desc, então a primeira página basta.
 */
export async function fetchResumableSession(): Promise<ApiSessionDetail | null> {
  const listRaw = await apiRequest<unknown>("/sessions?limit=1");
  const list = ApiSessionListSchema.parse(listRaw);
  const latest = list.items[0];
  if (!latest || latest.endedAt !== null) return null;

  const detailRaw = await apiRequest<unknown>(`/sessions/${latest.id}`);
  return ApiSessionDetailSchema.parse(detailRaw);
}
