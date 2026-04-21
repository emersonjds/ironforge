import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "@lib/storage/keys";
import type { PlanDay, Session, SetLog } from "@/types/domain";

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export interface DraftSetInput {
  planExerciseId: string;
  setIndex: number;
  weight: number;
  reps: number;
  rir: number | null;
  restTakenSeconds: number | null;
  notes?: string | null;
}

interface ActiveSessionState {
  session: Session | null;
  planDay: PlanDay | null;
  currentExerciseIndex: number;

  startSession: (planDay: PlanDay, userId: string) => void;
  logSet: (input: DraftSetInput) => SetLog;
  removeLastSet: (planExerciseId: string) => void;
  setExerciseIndex: (index: number) => void;
  nextExercise: () => void;
  prevExercise: () => void;
  endSession: () => Session | null;
  cancelSession: () => void;

  setsForExercise: (planExerciseId: string) => SetLog[];
}

export const useActiveSessionStore = create<ActiveSessionState>()(
  persist(
    (set, get) => ({
      session: null,
      planDay: null,
      currentExerciseIndex: 0,

      startSession: (planDay, userId) => {
        const session: Session = {
          id: makeId("sess"),
          userId,
          planDayId: planDay.id,
          startedAt: new Date().toISOString(),
          endedAt: null,
          bodyweightAtSession: null,
          notes: null,
          perceivedFatigue: null,
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
          planExerciseId: input.planExerciseId,
          setIndex: input.setIndex,
          type: "working",
          weight: input.weight,
          reps: input.reps,
          rir: input.rir,
          restTakenSeconds: input.restTakenSeconds,
          completedAt: new Date().toISOString(),
          notes: input.notes ?? null,
          syncedAt: null,
        };
        set({
          session: { ...session, sets: [...session.sets, newSet] },
        });
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
        const finished: Session = { ...session, endedAt: new Date().toISOString() };
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
    },
  ),
);
