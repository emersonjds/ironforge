import { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "@lib/storage/keys";
import type { Session } from "@/types/domain";

// Record<"YYYY-MM-DD", Session>
export type SessionHistoryMap = Record<string, Session>;

function toDateKey(isoString: string): string {
  return isoString.slice(0, 10); // "YYYY-MM-DD"
}

export async function persistSessionToHistory(session: Session): Promise<void> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.sessionHistory);
  const history: SessionHistoryMap = raw ? (JSON.parse(raw) as SessionHistoryMap) : {};
  const key = toDateKey(session.startedAt);
  history[key] = session;
  await AsyncStorage.setItem(STORAGE_KEYS.sessionHistory, JSON.stringify(history));
}

export function useSessionHistory(): SessionHistoryMap {
  const [history, setHistory] = useState<SessionHistoryMap>({});

  const load = useCallback(() => {
    AsyncStorage.getItem(STORAGE_KEYS.sessionHistory).then((raw) => {
      if (!raw) return;
      try {
        setHistory(JSON.parse(raw) as SessionHistoryMap);
      } catch {
        // ignore
      }
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return history;
}
