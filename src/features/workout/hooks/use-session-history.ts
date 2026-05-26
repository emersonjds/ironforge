import { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "@lib/storage/keys";
import { SessionWithSetsSchema } from "@entities/session";
import { withoutDeleted } from "@entities/load-history";
import type { StoredSession } from "./use-last-finished-session";

// Record<"YYYY-MM-DD", StoredSession>
export type SessionHistoryMap = Record<string, StoredSession>;

function toDateKey(isoString: string): string {
  return isoString.slice(0, 10); // "YYYY-MM-DD"
}

/**
 * Valida cada entrada no limite do storage com o schema v2, descartando
 * entradas corrompidas/fora do schema e sets soft-deleted.
 */
function parseHistory(raw: string): SessionHistoryMap {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return {};
  }
  if (typeof json !== "object" || json === null) return {};
  const out: SessionHistoryMap = {};
  for (const [key, value] of Object.entries(json)) {
    const result = SessionWithSetsSchema.safeParse(value);
    if (result.success) {
      out[key] = { ...result.data, sets: withoutDeleted(result.data.sets) };
    }
  }
  return out;
}

export async function persistSessionToHistory(session: StoredSession): Promise<void> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.sessionHistory);
  const history: SessionHistoryMap = raw ? parseHistory(raw) : {};
  const key = toDateKey(session.startedAt);
  history[key] = session;
  await AsyncStorage.setItem(STORAGE_KEYS.sessionHistory, JSON.stringify(history));
}

export function useSessionHistory(): SessionHistoryMap {
  const [history, setHistory] = useState<SessionHistoryMap>({});

  const load = useCallback(() => {
    AsyncStorage.getItem(STORAGE_KEYS.sessionHistory).then((raw) => {
      if (!raw) return;
      setHistory(parseHistory(raw));
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return history;
}
