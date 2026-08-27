import {
  toApiSetIndex,
  fromApiSetIndex,
  mapApiSessionToLocal,
  mapApiSetToLocal,
  startSessionRequest,
  finishSessionRequest,
  logSetRequest,
  updateSetRequest,
  deleteSetRequest,
  fetchResumableSession,
  fetchSessions,
} from "@entities/session/api";
import type { ApiSetLog } from "@entities/session/api";
import type { SetLog } from "@entities/session";

function mockFetchOk(payload: unknown, status = 200) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status,
    json: async () => payload,
  }) as unknown as typeof fetch;
}

function mockFetchSequence(payloads: unknown[]) {
  const fn = jest.fn();
  for (const payload of payloads) {
    fn.mockResolvedValueOnce({ ok: true, status: 200, json: async () => payload });
  }
  global.fetch = fn as unknown as typeof fetch;
}

const API_SESSION = {
  id: "b7f0b6a2-6b0e-4c9a-9e2b-5f1a1c2d3e4f",
  athleteId: "athlete-1",
  assignedPlanId: null,
  planDayId: null,
  startedAt: "2026-08-27T10:00:00.000Z",
  endedAt: null,
  bodyweightKg: null,
  perceivedFatigue: null,
  notes: null,
  version: 1,
  createdAt: "2026-08-27T10:00:00.000Z",
  updatedAt: "2026-08-27T10:00:00.000Z",
};

const API_SET: ApiSetLog = {
  id: "c1d2e3f4-6b0e-4c9a-9e2b-5f1a1c2d3e4f",
  sessionId: API_SESSION.id,
  exerciseId: "exercise-1",
  planExerciseId: null,
  assignedPlanId: null,
  setIndex: 0,
  type: "working",
  weight: 100,
  reps: 8,
  rir: 2,
  restTakenSeconds: 90,
  completedAt: "2026-08-27T10:05:00.000Z",
  notes: null,
  editedAt: null,
  originalWeight: null,
  version: 1,
  createdAt: "2026-08-27T10:05:00.000Z",
  updatedAt: "2026-08-27T10:05:00.000Z",
};

describe("off-by-one do índice de série", () => {
  it("converte o índice local (1-based) para o da api (0-based)", () => {
    expect(toApiSetIndex(1)).toBe(0);
    expect(toApiSetIndex(2)).toBe(1);
  });

  it("converte o índice da api (0-based) de volta para o local (1-based)", () => {
    expect(fromApiSetIndex(0)).toBe(1);
    expect(fromApiSetIndex(1)).toBe(2);
  });

  it("a primeira série do exercício (local 1) chega na api como 0, nunca -1 nem 1", () => {
    const set: SetLog = {
      id: "set-1",
      sessionId: "session-1",
      exerciseId: "exercise-1",
      planExerciseId: "plan-exercise-1",
      assignedPlanId: null,
      setIndex: 1,
      type: "working",
      weight: 100,
      reps: 8,
      rir: 2,
      restTakenSeconds: 90,
      completedAt: "2026-08-27T10:05:00.000Z",
      notes: null,
      editedAt: null,
      originalWeight: null,
      deletedAt: null,
      syncedAt: null,
    };
    mockFetchOk(API_SET);

    return logSetRequest("session-1", set).then(() => {
      const [, init] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
      const body = JSON.parse(init.body as string) as { setIndex: number };
      expect(body.setIndex).toBe(0);
    });
  });
});

describe("mapeamento api -> domínio local", () => {
  it("mapApiSessionToLocal preserva os campos e marca syncedAt", () => {
    const session = mapApiSessionToLocal(API_SESSION);
    expect(session.id).toBe(API_SESSION.id);
    expect(session.athleteId).toBe(API_SESSION.athleteId);
    expect(session.syncedAt).not.toBeNull();
  });

  it("mapApiSetToLocal reindexa a série para 1-based e nunca vem deletado", () => {
    const set = mapApiSetToLocal(API_SET);
    expect(set.setIndex).toBe(1);
    expect(set.deletedAt).toBeNull();
    expect(set.syncedAt).not.toBeNull();
  });
});

describe("startSessionRequest", () => {
  it("faz POST em /sessions e retorna a sessão parseada", async () => {
    mockFetchOk(API_SESSION, 201);

    const result = await startSessionRequest({
      assignedPlanId: null,
      planDayId: null,
      startedAt: API_SESSION.startedAt,
    });

    expect(result.id).toBe(API_SESSION.id);
    const [url, init] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/sessions");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).not.toHaveProperty("id");
  });

  it("lança quando a resposta não bate com o schema esperado", async () => {
    mockFetchOk({ id: "only-id" }, 201);

    await expect(
      startSessionRequest({ assignedPlanId: null, planDayId: null, startedAt: "2026-08-27T10:00:00.000Z" }),
    ).rejects.toThrow();
  });
});

describe("finishSessionRequest", () => {
  it("faz PATCH em /sessions/{id}", async () => {
    mockFetchOk({ ...API_SESSION, endedAt: "2026-08-27T11:00:00.000Z" });

    await finishSessionRequest(API_SESSION.id, { endedAt: "2026-08-27T11:00:00.000Z" });

    const [url, init] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect(url).toContain(`/sessions/${API_SESSION.id}`);
    expect(init.method).toBe("PATCH");
  });
});

describe("updateSetRequest e deleteSetRequest", () => {
  it("PATCH em /sets/{id} manda só os campos informados", async () => {
    mockFetchOk(API_SET);

    await updateSetRequest(API_SET.id, { weight: 105 });

    const [url, init] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect(url).toContain(`/sets/${API_SET.id}`);
    expect(JSON.parse(init.body as string)).toEqual({ weight: 105 });
  });

  it("DELETE em /sets/{id}", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 204, json: async () => null }) as unknown as typeof fetch;

    await deleteSetRequest(API_SET.id);

    const [url, init] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect(url).toContain(`/sets/${API_SET.id}`);
    expect(init.method).toBe("DELETE");
  });
});

describe("fetchResumableSession", () => {
  it("sem sessões: retorna null", async () => {
    mockFetchOk({ items: [], total: 0, limit: 1, offset: 0 });

    const result = await fetchResumableSession();

    expect(result).toBeNull();
  });

  it("sessão mais recente já encerrada: retorna null sem buscar detalhe", async () => {
    mockFetchOk({ items: [{ ...API_SESSION, endedAt: "2026-08-27T11:00:00.000Z" }], total: 1, limit: 1, offset: 0 });

    const result = await fetchResumableSession();

    expect(result).toBeNull();
    expect((global.fetch as jest.Mock).mock.calls).toHaveLength(1);
  });

  it("sessão em aberto: busca o detalhe com os sets", async () => {
    mockFetchSequence([
      { items: [API_SESSION], total: 1, limit: 1, offset: 0 },
      { ...API_SESSION, sets: [API_SET] },
    ]);

    const result = await fetchResumableSession();

    expect(result?.id).toBe(API_SESSION.id);
    expect(result?.sets).toHaveLength(1);
    const [detailUrl] = (global.fetch as jest.Mock).mock.calls[1] as [string];
    expect(detailUrl).toContain(`/sessions/${API_SESSION.id}`);
  });
});

describe("fetchSessions", () => {
  it("busca /sessions com limit e offset e mapeia para o domínio local", async () => {
    mockFetchOk({ items: [API_SESSION], total: 5, limit: 2, offset: 2 });

    const page = await fetchSessions({ limit: 2, offset: 2 });

    expect(page.items).toHaveLength(1);
    expect(page.items[0]!.id).toBe(API_SESSION.id);
    expect(page.total).toBe(5);
    expect(page.limit).toBe(2);
    expect(page.offset).toBe(2);
    const [url] = (global.fetch as jest.Mock).mock.calls[0] as [string];
    expect(url).toContain("limit=2");
    expect(url).toContain("offset=2");
  });

  it("aceita from/to para filtrar por período", async () => {
    mockFetchOk({ items: [], total: 0, limit: 200, offset: 0 });

    await fetchSessions({ from: "2026-01-01T00:00:00.000Z", to: "2026-08-27T00:00:00.000Z", limit: 200 });

    const [url] = (global.fetch as jest.Mock).mock.calls[0] as [string];
    expect(url).toContain("from=2026-01-01T00%3A00%3A00.000Z");
    expect(url).toContain("to=2026-08-27T00%3A00%3A00.000Z");
  });

  it("sem parâmetros: usa limit/offset padrão", async () => {
    mockFetchOk({ items: [], total: 0, limit: 20, offset: 0 });

    await fetchSessions();

    const [url] = (global.fetch as jest.Mock).mock.calls[0] as [string];
    expect(url).toContain("limit=20");
    expect(url).toContain("offset=0");
  });
});
