import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "@lib/storage/keys";
import { persistSessionToHistory } from "./use-session-history";
import type { Session } from "@/types/domain";

const LAST_SESSION_KEY = `${STORAGE_KEYS.activeSession}:last-finished`;

export async function persistLastFinishedSession(session: Session): Promise<void> {
  await AsyncStorage.setItem(LAST_SESSION_KEY, JSON.stringify(session));
  await persistSessionToHistory(session);
}

export function useLastFinishedSession(): Session | null {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(LAST_SESSION_KEY).then((raw) => {
      if (cancelled || !raw) return;
      try {
        setSession(JSON.parse(raw) as Session);
      } catch {
        // ignore parse error
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return session;
}
