import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "@lib/storage/keys";
import { randomUuidV4 } from "@lib/utils/uuid";
import {
  SessionWithSetsSchema,
  startSessionRequest,
  finishSessionRequest,
  logSetRequest,
  updateSetRequest,
  deleteSetRequest,
  fetchResumableSession,
  mapApiSessionToLocal,
  mapApiSetToLocal,
  type ApiSessionDetail,
} from "@entities/session";
import { PlanDaySchema } from "@entities/plan";
import type { AssignedPlan } from "@entities/plan";
import { withoutDeleted, useLoadHistoryStore } from "@entities/load-history";
import type { PlanDay, Session, SetLog } from "@/types/domain";

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export interface DraftSetInput {
  planExerciseId: string;
  exerciseId: string;
  setIndex: number;
  weight: number;
  reps: number;
  rir: number | null;
  restTakenSeconds: number | null;
  notes?: string | null;
}

export interface EditSetPatch {
  weight?: number;
  reps?: number;
  rir?: number | null;
  restTakenSeconds?: number | null;
  notes?: string | null;
}

interface SessionWithSets extends Session {
  sets: SetLog[];
}

export interface PendingAction {
  type: "openKeypad";
  planExerciseId: string;
  setIndex: number;
}

interface ActiveSessionState {
  session: SessionWithSets | null;
  planDay: PlanDay | null;
  currentExerciseIndex: number;
  pendingAction: PendingAction | null;

  startSession: (planDay: PlanDay, athleteId: string, assignedPlanId?: string) => void;
  setPendingAction: (action: PendingAction) => void;
  clearPendingAction: () => void;
  logSet: (input: DraftSetInput) => SetLog;
  editSet: (id: string, patch: EditSetPatch) => void;
  deleteSet: (id: string) => void;
  removeLastSet: (planExerciseId: string) => void;
  setExerciseIndex: (index: number) => void;
  nextExercise: () => void;
  prevExercise: () => void;
  endSession: () => SessionWithSets | null;
  cancelSession: () => void;
  adoptResumableSession: (detail: ApiSessionDetail, planDay: PlanDay) => void;

  setsForExercise: (planExerciseId: string) => SetLog[];
}

/**
 * Sessão criada localmente antes da api confirmar: id temporário até
 * startSessionRequest resolver e o app adotar o id real do servidor.
 * Fica fora do estado do zustand para não ser serializado no AsyncStorage.
 */
let pendingSessionCreate: Promise<string> | null = null;

export const useActiveSessionStore = create<ActiveSessionState>()(
  persist(
    (set, get) => {
      function markSetSynced(setId: string) {
        const { session } = get();
        if (!session) return;
        const idx = session.sets.findIndex((s) => s.id === setId);
        if (idx === -1) return;
        const sets = [...session.sets];
        sets[idx] = { ...sets[idx]!, syncedAt: new Date().toISOString() };
        set({ session: { ...session, sets } });
      }

      async function resolveSessionId(fallback: string): Promise<string> {
        return pendingSessionCreate ? pendingSessionCreate : fallback;
      }

      async function syncNewSet(newSet: SetLog) {
        try {
          const sessionId = await resolveSessionId(newSet.sessionId);
          const apiSet = await logSetRequest(sessionId, newSet);
          markSetSynced(apiSet.id);
        } catch {
          // Sem fila offline aqui (SPA-106): a série fica local com syncedAt nulo.
        }
      }

      async function syncEditSet(setLog: SetLog) {
        try {
          const apiSet = await updateSetRequest(setLog.id, {
            weight: setLog.weight,
            reps: setLog.reps,
            rir: setLog.rir,
            restTakenSeconds: setLog.restTakenSeconds,
            completedAt: setLog.completedAt,
            notes: setLog.notes,
          });
          markSetSynced(apiSet.id);
        } catch {
          // idem: sem retry automático, edição fica marcada como não sincronizada
        }
      }

      async function syncEndSession(finished: SessionWithSets) {
        try {
          const sessionId = await resolveSessionId(finished.id);
          await finishSessionRequest(sessionId, {
            endedAt: finished.endedAt ?? new Date().toISOString(),
            bodyweightKg: finished.bodyweightKg,
            perceivedFatigue: finished.perceivedFatigue,
            notes: finished.notes,
          });
        } catch {
          // A cópia local já foi persistida (persistLastFinishedSession); sem retry aqui.
        }
      }

      return {
        session: null,
        planDay: null,
        currentExerciseIndex: 0,
        pendingAction: null,

        setPendingAction: (action) => set({ pendingAction: action }),
        clearPendingAction: () => set({ pendingAction: null }),

        startSession: (planDay, athleteId, assignedPlanId) => {
          const localId = randomUuidV4();
          const startedAt = new Date().toISOString();
          const resolvedAssignedPlanId = assignedPlanId ?? null;
          const session: SessionWithSets = {
            id: localId,
            athleteId,
            assignedPlanId: resolvedAssignedPlanId,
            planDayId: planDay.id,
            startedAt,
            endedAt: null,
            bodyweightKg: null,
            notes: null,
            perceivedFatigue: null,
            syncedAt: null,
            sets: [],
          };
          set({ session, planDay, currentExerciseIndex: 0 });

          pendingSessionCreate = startSessionRequest({
            assignedPlanId: resolvedAssignedPlanId,
            planDayId: planDay.id,
            startedAt,
          })
            .then((apiSession) => {
              const current = get().session;
              if (current?.id === localId) {
                set({
                  session: {
                    ...mapApiSessionToLocal(apiSession),
                    sets: current.sets.map((s) => ({ ...s, sessionId: apiSession.id })),
                  },
                });
              }
              return apiSession.id;
            })
            .catch(() => localId);
        },

        logSet: (input) => {
          const { session } = get();
          if (!session) throw new Error("no active session");
          const newSet: SetLog = {
            id: randomUuidV4(),
            sessionId: session.id,
            exerciseId: input.exerciseId,
            planExerciseId: input.planExerciseId,
            assignedPlanId: session.assignedPlanId,
            setIndex: input.setIndex,
            type: "working",
            weight: input.weight,
            reps: input.reps,
            rir: input.rir,
            restTakenSeconds: input.restTakenSeconds,
            completedAt: new Date().toISOString(),
            notes: input.notes ?? null,
            editedAt: null,
            originalWeight: null,
            deletedAt: null,
            syncedAt: null,
          };
          set({
            session: { ...session, sets: [...session.sets, newSet] },
          });

          // Persist load history entry (fire-and-forget, non-blocking)
          useLoadHistoryStore.getState().upsert({
            id: makeId("lh"),
            athleteId: session.athleteId,
            exerciseId: input.exerciseId,
            weight: input.weight,
            reps: input.reps,
            rir: input.rir,
            setType: "working",
            performedAt: newSet.completedAt,
            sessionId: session.id,
            invalidatedAt: null,
            invalidationReason: null,
          }).catch(() => {});

          void syncNewSet(newSet);

          return newSet;
        },

        editSet: (id, patch) => {
          const { session } = get();
          if (!session) return;
          const idx = session.sets.findIndex((s) => s.id === id);
          if (idx === -1) return;
          const original = session.sets[idx]!;
          const updated: SetLog = {
            ...original,
            ...patch,
            editedAt: new Date().toISOString(),
            originalWeight: original.originalWeight ?? original.weight,
            syncedAt: null,
          };
          const sets = [...session.sets];
          sets[idx] = updated;
          set({ session: { ...session, sets } });
          void syncEditSet(updated);
        },

        deleteSet: (id) => {
          const { session } = get();
          if (!session) return;
          const sets = session.sets.filter((s) => s.id !== id);
          set({ session: { ...session, sets } });
          void deleteSetRequest(id).catch(() => {});
        },

        removeLastSet: (planExerciseId) => {
          const { session, deleteSet } = get();
          if (!session) return;
          for (let i = session.sets.length - 1; i >= 0; i--) {
            if (session.sets[i]!.planExerciseId === planExerciseId) {
              deleteSet(session.sets[i]!.id);
              return;
            }
          }
        },

        setExerciseIndex: (index) => set({ currentExerciseIndex: index }),

        nextExercise: () => {
          const { planDay, currentExerciseIndex } = get();
          if (!planDay) return;
          const max = planDay.exercises.length - 1;
          set({ currentExerciseIndex: Math.min(currentExerciseIndex + 1, max) });
        },

        prevExercise: () => {
          const { currentExerciseIndex } = get();
          set({ currentExerciseIndex: Math.max(currentExerciseIndex - 1, 0) });
        },

        endSession: () => {
          const { session } = get();
          if (!session) return null;
          const finished: SessionWithSets = { ...session, endedAt: new Date().toISOString() };
          set({ session: null, planDay: null, currentExerciseIndex: 0 });
          void syncEndSession(finished);
          return finished;
        },

        cancelSession: () => {
          set({ session: null, planDay: null, currentExerciseIndex: 0 });
        },

        adoptResumableSession: (detail, planDay) => {
          if (get().session) return;
          pendingSessionCreate = Promise.resolve(detail.id);
          set({
            session: {
              ...mapApiSessionToLocal(detail),
              sets: detail.sets.map(mapApiSetToLocal),
            },
            planDay,
            currentExerciseIndex: 0,
          });
        },

        setsForExercise: (planExerciseId) => {
          const { session } = get();
          if (!session) return [];
          return session.sets.filter((s) => s.planExerciseId === planExerciseId);
        },
      };
    },
    {
      name: STORAGE_KEYS.activeSession,
      storage: createJSONStorage(() => AsyncStorage),
      // Valida o estado persistido no limite do storage com os schemas v2.
      // Se a sessão ou o plano persistidos estiverem corrompidos/fora do schema,
      // descarta a sessão ativa de forma consistente (sem quebrar o app).
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<ActiveSessionState>;
        const sessionResult = p.session ? SessionWithSetsSchema.safeParse(p.session) : null;
        const planDayResult = p.planDay ? PlanDaySchema.safeParse(p.planDay) : null;
        const valid = sessionResult?.success && planDayResult?.success;
        if (!valid) {
          return { ...current, session: null, planDay: null, currentExerciseIndex: 0, pendingAction: null };
        }
        return {
          ...current,
          session: { ...sessionResult.data, sets: withoutDeleted(sessionResult.data.sets) },
          planDay: planDayResult.data,
          currentExerciseIndex:
            typeof p.currentExerciseIndex === "number" ? p.currentExerciseIndex : 0,
          pendingAction: null,
        };
      },
    },
  ),
);

/**
 * Roda no boot (ou quando os planos do aluno carregam): se o servidor tem
 * uma sessão aberta e não há nenhuma sessão ativa localmente, retoma-a.
 * Sem sessão resumível ou sem o plano correspondente, é um no-op silencioso —
 * o aluno segue o fluxo normal de "iniciar treino".
 */
export async function reconcileActiveSession(assignments: AssignedPlan[]): Promise<void> {
  if (useActiveSessionStore.getState().session) return;

  try {
    const detail = await fetchResumableSession();
    if (!detail) return;
    const planDay = assignments.flatMap((a) => a.days).find((d) => d.id === detail.planDayId);
    if (!planDay) return;
    useActiveSessionStore.getState().adoptResumableSession(detail, planDay);
  } catch {
    // Sem sessão resumível agora; o aluno segue o fluxo normal de início.
  }
}
