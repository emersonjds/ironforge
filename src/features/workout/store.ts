import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "@lib/storage/keys";
import { SessionWithSetsSchema } from "@entities/session";
import { PlanDaySchema } from "@entities/plan";
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

interface SessionWithSets extends Session {
  sets: SetLog[];
}

interface ActiveSessionState {
  session: SessionWithSets | null;
  planDay: PlanDay | null;
  currentExerciseIndex: number;

  startSession: (planDay: PlanDay, athleteId: string, assignedPlanId?: string) => void;
  logSet: (input: DraftSetInput) => SetLog;
  removeLastSet: (planExerciseId: string) => void;
  setExerciseIndex: (index: number) => void;
  nextExercise: () => void;
  prevExercise: () => void;
  endSession: () => SessionWithSets | null;
  cancelSession: () => void;

  setsForExercise: (planExerciseId: string) => SetLog[];
}

export const useActiveSessionStore = create<ActiveSessionState>()(
  persist(
    (set, get) => ({
      session: null,
      planDay: null,
      currentExerciseIndex: 0,

      startSession: (planDay, athleteId, assignedPlanId) => {
        const session: SessionWithSets = {
          id: makeId("sess"),
          athleteId,
          assignedPlanId: assignedPlanId ?? null,
          planDayId: planDay.id,
          startedAt: new Date().toISOString(),
          endedAt: null,
          bodyweightKg: null,
          notes: null,
          perceivedFatigue: null,
          syncedAt: null,
          sets: [],
        };
        set({ session, planDay, currentExerciseIndex: 0 });
      },

      logSet: (input) => {
        const { session } = get();
        if (!session) throw new Error("no active session");
        const newSet: SetLog = {
          id: makeId("set"),
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

        return newSet;
      },

      removeLastSet: (planExerciseId) => {
        const { session } = get();
        if (!session) return;
        const filtered = [...session.sets];
        for (let i = filtered.length - 1; i >= 0; i--) {
          if (filtered[i]!.planExerciseId === planExerciseId) {
            filtered.splice(i, 1);
            break;
          }
        }
        set({ session: { ...session, sets: filtered } });
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
        return finished;
      },

      cancelSession: () => {
        set({ session: null, planDay: null, currentExerciseIndex: 0 });
      },

      setsForExercise: (planExerciseId) => {
        const { session } = get();
        if (!session) return [];
        return session.sets.filter((s) => s.planExerciseId === planExerciseId);
      },
    }),
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
          return { ...current, session: null, planDay: null, currentExerciseIndex: 0 };
        }
        return {
          ...current,
          session: { ...sessionResult.data, sets: withoutDeleted(sessionResult.data.sets) },
          planDay: planDayResult.data,
          currentExerciseIndex:
            typeof p.currentExerciseIndex === "number" ? p.currentExerciseIndex : 0,
        };
      },
    },
  ),
);
