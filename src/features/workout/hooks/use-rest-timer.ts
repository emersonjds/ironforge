import { useEffect, useRef, useState } from "react";
import { haptics } from "@lib/haptics";

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
  const [totalSeconds, setTotal] = useState(0);
  const [remainingSeconds, setRemaining] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const didFireRef = useRef(false);

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  function clear() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function start(seconds: number) {
    clear();
    didFireRef.current = false;
    setTotal(seconds);
    setRemaining(seconds);
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        const next = r - 1;
        if (next <= 0) {
          clear();
          if (!didFireRef.current) {
            didFireRef.current = true;
            haptics.pr();
          }
          return 0;
        }
        return next;
      });
    }, 1000);
  }

  function stop() {
    clear();
    setRemaining(0);
    setTotal(0);
  }

  function adjust(delta: number) {
    setRemaining((r) => Math.max(0, r + delta));
    setTotal((t) => Math.max(0, t + delta));
  }

  const active = remainingSeconds > 0;
  const elapsedRatio = totalSeconds > 0 ? 1 - remainingSeconds / totalSeconds : 0;

  return { active, remainingSeconds, totalSeconds, elapsedRatio, start, stop, adjust };
}
