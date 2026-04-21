import { useEffect, useState } from "react";

export function useSessionTimer(startedAt: string | null): number {
  const [elapsed, setElapsed] = useState(() =>
    startedAt ? Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000) : 0,
  );

  useEffect(() => {
    if (!startedAt) {
      setElapsed(0);
      return;
    }
    const startMs = new Date(startedAt).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - startMs) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  return elapsed;
}
