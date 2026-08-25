import { create } from "zustand";
import { haptics } from "@lib/haptics";

interface RestTimerStore {
  endsAt: number | null;
  totalSeconds: number;
  tick: number;
  start: (seconds: number) => void;
  stop: () => void;
  adjust: (deltaSeconds: number) => void;
}

let intervalRef: ReturnType<typeof setInterval> | null = null;
let hapticFired = false;

function clearGlobalInterval() {
  if (intervalRef) {
    clearInterval(intervalRef);
    intervalRef = null;
  }
}

/**
 * Timer de descanso por relógio de parede (endsAt em epoch ms), não por decremento.
 * Um único setInterval, dono do estado, fora de qualquer árvore de tela — sobrevive
 * a bloqueio de tela e não mente sobre o tempo passado em background.
 */
export const useRestTimerStore = create<RestTimerStore>((set, get) => ({
  endsAt: null,
  totalSeconds: 0,
  tick: 0,

  start: (seconds) => {
    clearGlobalInterval();
    hapticFired = false;
    set({ endsAt: Date.now() + seconds * 1000, totalSeconds: seconds, tick: 0 });
    intervalRef = setInterval(() => {
      const { endsAt } = get();
      if (endsAt !== null && endsAt - Date.now() <= 0 && !hapticFired) {
        hapticFired = true;
        haptics.pr();
      }
      set((s) => ({ tick: s.tick + 1 }));
    }, 1000);
  },

  stop: () => {
    clearGlobalInterval();
    hapticFired = false;
    set({ endsAt: null, totalSeconds: 0, tick: 0 });
  },

  adjust: (deltaSeconds) => {
    const { endsAt, totalSeconds } = get();
    if (endsAt === null) return;
    const nextEndsAt = Math.max(Date.now(), endsAt + deltaSeconds * 1000);
    if (nextEndsAt - Date.now() > 0) hapticFired = false;
    set({ endsAt: nextEndsAt, totalSeconds: Math.max(0, totalSeconds + deltaSeconds) });
  },
}));

export function getRemainingSeconds(state: Pick<RestTimerStore, "endsAt">): number {
  if (state.endsAt === null) return 0;
  return Math.max(0, Math.ceil((state.endsAt - Date.now()) / 1000));
}
