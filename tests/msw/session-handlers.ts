import { http, HttpResponse } from "msw";
import { API_BASE_URL } from "@shared/lib/api/client";

export const TEST_ATHLETE_ID = "athlete-1";

interface StoredApiSession {
  id: string;
  athleteId: string;
  assignedPlanId: string | null;
  planDayId: string | null;
  startedAt: string;
  endedAt: string | null;
  bodyweightKg: number | null;
  perceivedFatigue: number | null;
  notes: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

interface StoredApiSet {
  id: string;
  sessionId: string;
  exerciseId: string;
  planExerciseId: string | null;
  assignedPlanId: string | null;
  setIndex: number;
  type: string;
  weight: number;
  reps: number;
  rir: number | null;
  restTakenSeconds: number | null;
  completedAt: string;
  notes: string | null;
  editedAt: string | null;
  originalWeight: number | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

let sessions: StoredApiSession[] = [];
let sets: StoredApiSet[] = [];
let nextSessionSeq = 1;
let nextSetSeq = 1;

export function resetSessionHandlerState(): void {
  sessions = [];
  sets = [];
  nextSessionSeq = 1;
  nextSetSeq = 1;
}

export function seedOpenSession(overrides: Partial<StoredApiSession> = {}): StoredApiSession {
  const now = new Date().toISOString();
  const session: StoredApiSession = {
    id: `seeded-session-${nextSessionSeq++}`,
    athleteId: TEST_ATHLETE_ID,
    assignedPlanId: null,
    planDayId: null,
    startedAt: now,
    endedAt: null,
    bodyweightKg: null,
    perceivedFatigue: null,
    notes: null,
    version: 1,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
  sessions.unshift(session);
  return session;
}

export function seedSetForSession(sessionId: string, overrides: Partial<StoredApiSet> = {}): StoredApiSet {
  const now = new Date().toISOString();
  const set: StoredApiSet = {
    id: `seeded-set-${nextSetSeq++}`,
    sessionId,
    exerciseId: "exercise-1",
    planExerciseId: null,
    assignedPlanId: null,
    setIndex: 0,
    type: "working",
    weight: 100,
    reps: 8,
    rir: 2,
    restTakenSeconds: 90,
    completedAt: now,
    notes: null,
    editedAt: null,
    originalWeight: null,
    version: 1,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
  sets.push(set);
  return set;
}

function errorBody(code: string, message: string) {
  return { error: { code, message, details: {} } };
}

export const sessionHandlers = [
  http.post(`${API_BASE_URL}/sessions`, async ({ request }) => {
    const body = (await request.json()) as {
      assignedPlanId?: string;
      planDayId?: string;
      startedAt: string;
      bodyweightKg?: number;
    };
    const now = new Date().toISOString();
    const session: StoredApiSession = {
      id: `server-session-${nextSessionSeq++}`,
      athleteId: TEST_ATHLETE_ID,
      assignedPlanId: body.assignedPlanId ?? null,
      planDayId: body.planDayId ?? null,
      startedAt: body.startedAt,
      endedAt: null,
      bodyweightKg: body.bodyweightKg ?? null,
      perceivedFatigue: null,
      notes: null,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };
    sessions.unshift(session);
    return HttpResponse.json(session, { status: 201 });
  }),

  http.get(`${API_BASE_URL}/sessions`, ({ request }) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? "50");
    const offset = Number(url.searchParams.get("offset") ?? "0");
    const items = sessions.slice(offset, offset + limit);
    return HttpResponse.json({ items, total: sessions.length, limit, offset });
  }),

  http.get(`${API_BASE_URL}/sessions/:id`, ({ params }) => {
    const session = sessions.find((s) => s.id === params.id);
    if (!session) {
      return HttpResponse.json(errorBody("NOT_FOUND", "Sessão não encontrada"), { status: 404 });
    }
    const sessionSets = sets.filter((s) => s.sessionId === session.id);
    return HttpResponse.json({ ...session, sets: sessionSets });
  }),

  http.patch(`${API_BASE_URL}/sessions/:id`, async ({ params, request }) => {
    const session = sessions.find((s) => s.id === params.id);
    if (!session) {
      return HttpResponse.json(errorBody("NOT_FOUND", "Sessão não encontrada"), { status: 404 });
    }
    const patch = (await request.json()) as Partial<StoredApiSession>;
    Object.assign(session, patch, { updatedAt: new Date().toISOString() });
    return HttpResponse.json(session);
  }),

  http.post(`${API_BASE_URL}/sessions/:id/sets`, async ({ params, request }) => {
    const session = sessions.find((s) => s.id === params.id);
    if (!session) {
      return HttpResponse.json(errorBody("NOT_FOUND", "Sessão não encontrada"), { status: 404 });
    }
    const body = (await request.json()) as {
      id?: string;
      exerciseId: string;
      setIndex: number;
      type?: string;
      weight: number;
      reps: number;
      rir?: number;
      restTakenSeconds?: number;
      completedAt: string;
      notes?: string;
      planExerciseId?: string;
      assignedPlanId?: string;
    };
    const now = new Date().toISOString();
    const set: StoredApiSet = {
      id: body.id ?? `server-set-${nextSetSeq++}`,
      sessionId: session.id,
      exerciseId: body.exerciseId,
      planExerciseId: body.planExerciseId ?? null,
      assignedPlanId: body.assignedPlanId ?? null,
      setIndex: body.setIndex,
      type: body.type ?? "working",
      weight: body.weight,
      reps: body.reps,
      rir: body.rir ?? null,
      restTakenSeconds: body.restTakenSeconds ?? null,
      completedAt: body.completedAt,
      notes: body.notes ?? null,
      editedAt: null,
      originalWeight: null,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };
    sets.push(set);
    return HttpResponse.json(set, { status: 201 });
  }),

  http.patch(`${API_BASE_URL}/sets/:id`, async ({ params, request }) => {
    const set = sets.find((s) => s.id === params.id);
    if (!set) {
      return HttpResponse.json(errorBody("NOT_FOUND", "Série não encontrada"), { status: 404 });
    }
    const patch = (await request.json()) as Partial<StoredApiSet>;
    Object.assign(set, patch, { editedAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    return HttpResponse.json(set);
  }),

  http.delete(`${API_BASE_URL}/sets/:id`, ({ params }) => {
    const idx = sets.findIndex((s) => s.id === params.id);
    if (idx === -1) {
      return HttpResponse.json(errorBody("NOT_FOUND", "Série não encontrada"), { status: 404 });
    }
    sets.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
