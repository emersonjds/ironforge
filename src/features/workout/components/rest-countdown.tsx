import { Text } from "@ui/index";
import { formatDuration } from "@lib/utils/format";
import { useRestTimerStore, getRemainingSeconds } from "../store-rest-timer";

/** Único assinante do tique de 1Hz do descanso — isola o re-render do resto do modal. */
export function RestCountdown() {
  const remaining = useRestTimerStore((s) => getRemainingSeconds(s));

  if (remaining <= 0) {
    return (
      <Text className="text-xs font-mono font-bold text-warning" numberOfLines={1}>
        DESCANSO ACABOU
      </Text>
    );
  }

  return (
    <Text className="text-xs font-mono font-semibold text-text-secondary" numberOfLines={1}>
      DESCANSO {formatDuration(remaining)}
    </Text>
  );
}

export function useRestTimerIsDone(): boolean {
  return useRestTimerStore((s) => getRemainingSeconds(s) <= 0 && s.endsAt !== null);
}
