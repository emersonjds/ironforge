import { http, HttpResponse } from "msw";
import { API_BASE_URL, apiRequest } from "@shared/lib/api/client";
import { useActiveSessionStore, reconcileActiveSession } from "@features/workout/store";
import { server } from "../../../msw/server";
import {
  resetSessionHandlerState,
  seedOpenSession,
  seedSetForSession,
  TEST_ATHLETE_ID,
} from "../../../msw/session-handlers";
import type { PlanDay, AssignedPlan } from "@entities/plan";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

const PLAN_DAY: PlanDay = {
  id: "day-1",
  slotLabel: "A",
  slotIndex: 0,
  name: "Peito e tríceps",
  targetDaysOfWeek: [],
  exercises: [],
};

function assignmentsWith(planDay: PlanDay): AssignedPlan[] {
  return [
    {
      id: "assigned-1",
      athleteId: TEST_ATHLETE_ID,
      coachId: "coach-1",
      templateId: null,
      name: "Plano ativo",
      weeks: 8,
      startDate: "2026-08-01",
      status: "active",
      days: [planDay],
      weekConfigs: [],
      weekVisibility: "current_and_next",
      coachNotes: null,
      version: 1,
      deletedAt: null,
      createdAt: "2026-08-01T00:00:00.000Z",
      syncedAt: null,
    },
  ];
}

function flush() {
  return new Promise((resolve) => setImmediate(resolve));
}

interface ApiSessionDetailPayload {
  id: string;
  endedAt: string | null;
  sets: Array<{ id: string; setIndex: number; weight: number; reps: number }>;
}

beforeEach(() => {
  resetSessionHandlerState();
  useActiveSessionStore.setState({
    session: null,
    planDay: null,
    currentExerciseIndex: 0,
    pendingAction: null,
  });
});

describe("treino completo: iniciar, registrar séries, finalizar e ler de volta", () => {
  it("persiste sessão e séries na api no formato real do openapi", async () => {
    useActiveSessionStore.getState().startSession(PLAN_DAY, "athlete-local", "assigned-1");
    await flush();

    const sessionId = useActiveSessionStore.getState().session!.id;
    expect(sessionId).toMatch(/^server-session-/);

    useActiveSessionStore.getState().logSet({
      planExerciseId: "pe-1",
      exerciseId: "ex-1",
      setIndex: 1,
      weight: 100,
      reps: 8,
      rir: 2,
      restTakenSeconds: 90,
    });
    await flush();

    useActiveSessionStore.getState().logSet({
      planExerciseId: "pe-1",
      exerciseId: "ex-1",
      setIndex: 2,
      weight: 102.5,
      reps: 7,
      rir: 1,
      restTakenSeconds: 90,
    });
    await flush();

    const localSetsBeforeFinish = useActiveSessionStore.getState().session!.sets;
    expect(localSetsBeforeFinish.every((s) => s.syncedAt !== null)).toBe(true);

    const finished = useActiveSessionStore.getState().endSession();
    await flush();

    expect(finished?.sets).toHaveLength(2);
    expect(finished?.endedAt).not.toBeNull();

    const detail = await apiRequest<ApiSessionDetailPayload>(`/sessions/${sessionId}`);
    expect(detail.endedAt).not.toBeNull();
    expect(detail.sets).toHaveLength(2);
    expect(detail.sets.map((s) => s.setIndex).sort()).toEqual([0, 1]);
    expect(detail.sets.map((s) => s.weight).sort()).toEqual([100, 102.5]);
  });
});

describe("resiliência: erro da api no meio do treino não perde a série local", () => {
  it("mantém a série registrada localmente quando o POST do set falha", async () => {
    useActiveSessionStore.getState().startSession(PLAN_DAY, "athlete-local");
    await flush();
    const sessionId = useActiveSessionStore.getState().session!.id;

    server.use(http.post(`${API_BASE_URL}/sessions/${sessionId}/sets`, () => HttpResponse.error()));

    const logged = useActiveSessionStore.getState().logSet({
      planExerciseId: "pe-1",
      exerciseId: "ex-1",
      setIndex: 1,
      weight: 100,
      reps: 8,
      rir: 2,
      restTakenSeconds: 90,
    });
    await flush();

    const session = useActiveSessionStore.getState().session!;
    expect(session.sets).toHaveLength(1);
    expect(session.sets[0]!.id).toBe(logged.id);
    expect(session.sets[0]!.syncedAt).toBeNull();
  });
});

describe("reconciliação: sessão em aberto no servidor volta a ser retomável", () => {
  it("adota a sessão aberta do servidor quando não há sessão local", async () => {
    const openSession = seedOpenSession({ planDayId: PLAN_DAY.id, assignedPlanId: "assigned-1" });
    seedSetForSession(openSession.id, { setIndex: 0, weight: 100, reps: 8 });

    await reconcileActiveSession(assignmentsWith(PLAN_DAY));

    const session = useActiveSessionStore.getState().session!;
    expect(session.id).toBe(openSession.id);
    expect(session.sets).toHaveLength(1);
    expect(session.sets[0]!.setIndex).toBe(1);
    expect(useActiveSessionStore.getState().planDay?.id).toBe(PLAN_DAY.id);
  });

  it("sessão mais recente já encerrada: não é retomada", async () => {
    seedOpenSession({ planDayId: PLAN_DAY.id, endedAt: "2026-08-27T12:00:00.000Z" });

    await reconcileActiveSession(assignmentsWith(PLAN_DAY));

    expect(useActiveSessionStore.getState().session).toBeNull();
  });
});
