import { useRestTimerStore, getRemainingSeconds } from "../store-rest-timer";

export interface RestTimerState {
  active: boolean;
  remainingSeconds: number;
  totalSeconds: number;
  elapsedRatio: number;
  start: (seconds: number) => void;
  stop: () => void;
  adjust: (deltaSeconds: number) => void;
}

export function useRestTimer(): RestTimerState {
  const endsAt = useRestTimerStore((s) => s.endsAt);
  const totalSeconds = useRestTimerStore((s) => s.totalSeconds);
  const start = useRestTimerStore((s) => s.start);
  const stop = useRestTimerStore((s) => s.stop);
  const adjust = useRestTimerStore((s) => s.adjust);
  useRestTimerStore((s) => s.tick);

  const remainingSeconds = getRemainingSeconds({ endsAt });
  const active = remainingSeconds > 0;
  const elapsedRatio = totalSeconds > 0 ? 1 - remainingSeconds / totalSeconds : 0;

  return { active, remainingSeconds, totalSeconds, elapsedRatio, start, stop, adjust };
}
