import { useActiveSessionStore, reconcileActiveSession } from "@features/workout/store";
import {
  startSessionRequest,
  finishSessionRequest,
  logSetRequest,
  updateSetRequest,
  deleteSetRequest,
  fetchResumableSession,
  type ApiSession,
  type ApiSetLog,
} from "@entities/session";
import type { PlanDay, AssignedPlan } from "@entities/plan";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

jest.mock("@entities/session", () => ({
  ...jest.requireActual("@entities/session"),
  startSessionRequest: jest.fn(),
  finishSessionRequest: jest.fn(),
  logSetRequest: jest.fn(),
  updateSetRequest: jest.fn(),
  deleteSetRequest: jest.fn(),
  fetchResumableSession: jest.fn(),
}));

const startSessionMock = startSessionRequest as jest.MockedFunction<typeof startSessionRequest>;
const finishSessionMock = finishSessionRequest as jest.MockedFunction<typeof finishSessionRequest>;
const logSetMock = logSetRequest as jest.MockedFunction<typeof logSetRequest>;
const updateSetMock = updateSetRequest as jest.MockedFunction<typeof updateSetRequest>;
const deleteSetMock = deleteSetRequest as jest.MockedFunction<typeof deleteSetRequest>;
const fetchResumableMock = fetchResumableSession as jest.MockedFunction<typeof fetchResumableSession>;

const PLAN_DAY: PlanDay = {
  id: "day-1",
  slotLabel: "A",
  slotIndex: 0,
  name: "Peito e tríceps",
  targetDaysOfWeek: [],
  exercises: [],
};

function flush() {
  return new Promise((resolve) => setImmediate(resolve));
}

function apiSessionFor(planDay: PlanDay, id = "server-session-1"): ApiSession {
  return {
    id,
    athleteId: "athlete-1",
    assignedPlanId: null,
    planDayId: planDay.id,
    startedAt: "2026-08-27T10:00:00.000Z",
    endedAt: null,
    bodyweightKg: null,
    perceivedFatigue: null,
    notes: null,
    version: 1,
    createdAt: "2026-08-27T10:00:00.000Z",
    updatedAt: "2026-08-27T10:00:00.000Z",
  };
}

function apiSetFor(overrides: Partial<ApiSetLog> = {}): ApiSetLog {
  return {
    id: overrides.id ?? "server-set-1",
    sessionId: "server-session-1",
    exerciseId: "ex-1",
    planExerciseId: "pe-1",
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
    ...overrides,
  };
}

function draftSet(setIndex = 1) {
  return {
    planExerciseId: "pe-1",
    exerciseId: "ex-1",
    setIndex,
    weight: 100,
    reps: 8,
    rir: 2,
    restTakenSeconds: 90,
  };
}

describe("useActiveSessionStore — sincronização com a api", () => {
  beforeEach(() => {
    startSessionMock.mockReset();
    finishSessionMock.mockReset();
    logSetMock.mockReset();
    updateSetMock.mockReset();
    deleteSetMock.mockReset();
    fetchResumableMock.mockReset();
    useActiveSessionStore.setState({
      session: null,
      planDay: null,
      currentExerciseIndex: 0,
      pendingAction: null,
    });
  });

  describe("startSession", () => {
    it("cria a sessão local na hora, com uuid real, sem esperar a api", () => {
      startSessionMock.mockReturnValue(new Promise(() => {}));

      useActiveSessionStore.getState().startSession(PLAN_DAY, "athlete-1");

      const session = useActiveSessionStore.getState().session;
      expect(session).not.toBeNull();
      expect(session?.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
      expect(session?.syncedAt).toBeNull();
      expect(startSessionMock).toHaveBeenCalledTimes(1);
    });

    it("ao resolver, adota o id real do servidor e realoca os sets já registrados no meio tempo", async () => {
      let resolveCreate!: (value: ApiSession) => void;
      startSessionMock.mockReturnValue(
        new Promise((resolve) => {
          resolveCreate = resolve;
        }),
      );
      logSetMock.mockReturnValue(new Promise(() => {}));

      useActiveSessionStore.getState().startSession(PLAN_DAY, "athlete-1");
      const localId = useActiveSessionStore.getState().session!.id;

      useActiveSessionStore.getState().logSet(draftSet());
      expect(useActiveSessionStore.getState().session!.sets).toHaveLength(1);

      resolveCreate(apiSessionFor(PLAN_DAY));
      await flush();

      const session = useActiveSessionStore.getState().session!;
      expect(session.id).toBe("server-session-1");
      expect(session.id).not.toBe(localId);
      expect(session.sets[0]!.sessionId).toBe("server-session-1");
    });
  });

  describe("logSet", () => {
    it("grava local na hora e sincroniza depois, marcando syncedAt quando a api confirma", async () => {
      startSessionMock.mockResolvedValue(apiSessionFor(PLAN_DAY));
      logSetMock.mockImplementation((sessionId, sentSet) =>
        Promise.resolve(apiSetFor({ id: sentSet.id, sessionId })),
      );

      useActiveSessionStore.getState().startSession(PLAN_DAY, "athlete-1");
      await flush();

      const logged = useActiveSessionStore.getState().logSet(draftSet(1));
      expect(logged.syncedAt).toBeNull();

      await flush();

      expect(logSetMock).toHaveBeenCalledTimes(1);
      const [sessionId, sentSet] = logSetMock.mock.calls[0]!;
      expect(sessionId).toBe("server-session-1");
      expect(sentSet.setIndex).toBe(1);

      const persisted = useActiveSessionStore.getState().session!.sets[0]!;
      expect(persisted.syncedAt).not.toBeNull();
    });

    it("erro da api no meio do treino não perde a série já registrada localmente", async () => {
      startSessionMock.mockResolvedValue(apiSessionFor(PLAN_DAY));
      logSetMock.mockRejectedValue(new Error("network down"));

      useActiveSessionStore.getState().startSession(PLAN_DAY, "athlete-1");
      await flush();

      useActiveSessionStore.getState().logSet(draftSet(1));
      await flush();

      const session = useActiveSessionStore.getState().session!;
      expect(session.sets).toHaveLength(1);
      expect(session.sets[0]!.syncedAt).toBeNull();
    });
  });

  describe("editSet", () => {
    it("atualiza local na hora e dispara PATCH /sets/{id}", async () => {
      startSessionMock.mockResolvedValue(apiSessionFor(PLAN_DAY));
      logSetMock.mockResolvedValue(apiSetFor());
      updateSetMock.mockResolvedValue(apiSetFor({ weight: 105 }));

      useActiveSessionStore.getState().startSession(PLAN_DAY, "athlete-1");
      await flush();
      const logged = useActiveSessionStore.getState().logSet(draftSet(1));
      await flush();

      useActiveSessionStore.getState().editSet(logged.id, { weight: 105 });

      const editedLocally = useActiveSessionStore.getState().session!.sets[0]!;
      expect(editedLocally.weight).toBe(105);
      expect(editedLocally.editedAt).not.toBeNull();
      expect(editedLocally.originalWeight).toBe(100);

      await flush();
      expect(updateSetMock).toHaveBeenCalledWith(logged.id, expect.objectContaining({ weight: 105 }));
    });
  });

  describe("deleteSet e removeLastSet", () => {
    it("deleteSet remove local na hora e dispara DELETE /sets/{id}", async () => {
      startSessionMock.mockResolvedValue(apiSessionFor(PLAN_DAY));
      logSetMock.mockResolvedValue(apiSetFor());
      deleteSetMock.mockResolvedValue(undefined);

      useActiveSessionStore.getState().startSession(PLAN_DAY, "athlete-1");
      await flush();
      const logged = useActiveSessionStore.getState().logSet(draftSet(1));
      await flush();

      useActiveSessionStore.getState().deleteSet(logged.id);

      expect(useActiveSessionStore.getState().session!.sets).toHaveLength(0);
      await flush();
      expect(deleteSetMock).toHaveBeenCalledWith(logged.id);
    });

    it("removeLastSet remove a última série do exercício e sincroniza a exclusão", async () => {
      startSessionMock.mockResolvedValue(apiSessionFor(PLAN_DAY));
      logSetMock.mockResolvedValue(apiSetFor());
      deleteSetMock.mockResolvedValue(undefined);

      useActiveSessionStore.getState().startSession(PLAN_DAY, "athlete-1");
      await flush();
      const logged = useActiveSessionStore.getState().logSet(draftSet(1));
      await flush();

      useActiveSessionStore.getState().removeLastSet("pe-1");

      expect(useActiveSessionStore.getState().session!.sets).toHaveLength(0);
      await flush();
      expect(deleteSetMock).toHaveBeenCalledWith(logged.id);
    });
  });

  describe("endSession", () => {
    it("encerra local na hora e sincroniza em segundo plano com o id real", async () => {
      startSessionMock.mockResolvedValue(apiSessionFor(PLAN_DAY));
      finishSessionMock.mockResolvedValue(apiSessionFor(PLAN_DAY, "server-session-1"));

      useActiveSessionStore.getState().startSession(PLAN_DAY, "athlete-1");
      await flush();

      const finished = useActiveSessionStore.getState().endSession();

      expect(finished?.endedAt).not.toBeNull();
      expect(useActiveSessionStore.getState().session).toBeNull();

      await flush();
      expect(finishSessionMock).toHaveBeenCalledWith(
        "server-session-1",
        expect.objectContaining({ endedAt: finished!.endedAt }),
      );
    });

    it("falha da api ao finalizar não afeta o encerramento local", async () => {
      startSessionMock.mockResolvedValue(apiSessionFor(PLAN_DAY));
      finishSessionMock.mockRejectedValue(new Error("network down"));

      useActiveSessionStore.getState().startSession(PLAN_DAY, "athlete-1");
      await flush();

      const finished = useActiveSessionStore.getState().endSession();

      expect(finished).not.toBeNull();
      await flush();
    });
  });

  describe("adoptResumableSession", () => {
    it("instala a sessão do servidor quando não há sessão local ativa", () => {
      const detail = { ...apiSessionFor(PLAN_DAY), sets: [apiSetFor()] };

      useActiveSessionStore.getState().adoptResumableSession(detail, PLAN_DAY);

      const session = useActiveSessionStore.getState().session!;
      expect(session.id).toBe("server-session-1");
      expect(session.sets).toHaveLength(1);
      expect(session.sets[0]!.setIndex).toBe(1);
      expect(useActiveSessionStore.getState().planDay?.id).toBe(PLAN_DAY.id);
    });

    it("não sobrescreve uma sessão local já em andamento", () => {
      startSessionMock.mockReturnValue(new Promise(() => {}));
      useActiveSessionStore.getState().startSession(PLAN_DAY, "athlete-1");
      const localId = useActiveSessionStore.getState().session!.id;

      const detail = { ...apiSessionFor(PLAN_DAY, "server-session-2"), sets: [] };
      useActiveSessionStore.getState().adoptResumableSession(detail, PLAN_DAY);

      expect(useActiveSessionStore.getState().session!.id).toBe(localId);
    });
  });

  describe("reconcileActiveSession", () => {
    const ASSIGNMENTS: AssignedPlan[] = [
      {
        id: "assigned-1",
        athleteId: "athlete-1",
        coachId: "coach-1",
        templateId: null,
        name: "Plano ativo",
        weeks: 8,
        startDate: "2026-08-01",
        status: "active",
        days: [PLAN_DAY],
        weekConfigs: [],
        weekVisibility: "current_and_next",
        coachNotes: null,
        version: 1,
        deletedAt: null,
        createdAt: "2026-08-01T00:00:00.000Z",
        syncedAt: null,
      },
    ];

    it("sem sessão resumível no servidor: não faz nada", async () => {
      fetchResumableMock.mockResolvedValue(null);

      await reconcileActiveSession(ASSIGNMENTS);

      expect(useActiveSessionStore.getState().session).toBeNull();
    });

    it("sessão aberta no servidor: retoma com o plano correspondente", async () => {
      fetchResumableMock.mockResolvedValue({ ...apiSessionFor(PLAN_DAY), sets: [apiSetFor()] });

      await reconcileActiveSession(ASSIGNMENTS);

      const session = useActiveSessionStore.getState().session!;
      expect(session.id).toBe("server-session-1");
      expect(session.sets).toHaveLength(1);
      expect(useActiveSessionStore.getState().planDay?.id).toBe(PLAN_DAY.id);
    });

    it("sessão aberta mas sem o dia do plano nos assignments: não retoma", async () => {
      fetchResumableMock.mockResolvedValue({
        ...apiSessionFor(PLAN_DAY, "server-session-orphan"),
        planDayId: "day-inexistente",
        sets: [],
      });

      await reconcileActiveSession(ASSIGNMENTS);

      expect(useActiveSessionStore.getState().session).toBeNull();
    });

    it("já há sessão local ativa: não consulta a api", async () => {
      startSessionMock.mockReturnValue(new Promise(() => {}));
      useActiveSessionStore.getState().startSession(PLAN_DAY, "athlete-1");

      await reconcileActiveSession(ASSIGNMENTS);

      expect(fetchResumableMock).not.toHaveBeenCalled();
    });

    it("erro de rede: não derruba o boot, apenas segue sem sessão resumida", async () => {
      fetchResumableMock.mockRejectedValue(new Error("network down"));

      await expect(reconcileActiveSession(ASSIGNMENTS)).resolves.toBeUndefined();
      expect(useActiveSessionStore.getState().session).toBeNull();
    });
  });
});
