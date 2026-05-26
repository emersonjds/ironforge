import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "@lib/storage/keys";
import { SessionWithSetsSchema, type SessionWithSets } from "@entities/session";
import { withoutDeleted } from "@entities/load-history";
import { persistSessionToHistory } from "./use-session-history";

export type StoredSession = SessionWithSets;

const LAST_SESSION_KEY = `${STORAGE_KEYS.activeSession}:last-finished`;

/**
 * Valida no limite do storage com o schema v2 e descarta sets soft-deleted.
 * Retorna null se o JSON estiver corrompido ou fora do schema.
 */
export function parseStoredSession(raw: string): StoredSession | null {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return null;
  }
  const result = SessionWithSetsSchema.safeParse(json);
  if (!result.success) return null;
  return { ...result.data, sets: withoutDeleted(result.data.sets) };
}

export async function persistLastFinishedSession(session: StoredSession): Promise<void> {
  await AsyncStorage.setItem(LAST_SESSION_KEY, JSON.stringify(session));
  await persistSessionToHistory(session);
}

export function useLastFinishedSession(): StoredSession | null {
  const [session, setSession] = useState<StoredSession | null>(null);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(LAST_SESSION_KEY).then((raw) => {
      if (cancelled || !raw) return;
      setSession(parseStoredSession(raw));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return session;
}
