import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "@shared/lib/storage/keys";
import { LoadHistoryEntrySchema } from "./schema";
import type { LoadHistoryEntry } from "./schema";

function storageKey(athleteId: string, exerciseId: string) {
  return `${STORAGE_KEYS.loadHistoryPrefix}:${athleteId}:${exerciseId}`;
}

interface LoadHistoryState {
  // In-memory cache: `athleteId:exerciseId` → entries
  entries: Record<string, LoadHistoryEntry[]>;

  hydrateForExercise: (athleteId: string, exerciseId: string) => Promise<void>;
  upsert: (entry: LoadHistoryEntry) => Promise<void>;
  invalidate: (
    id: string,
    athleteId: string,
    exerciseId: string,
    reason: NonNullable<LoadHistoryEntry["invalidationReason"]>,
  ) => Promise<void>;
  getLastEntry: (athleteId: string, exerciseId: string) => LoadHistoryEntry | null;
  getEntriesFor: (athleteId: string, exerciseId: string) => LoadHistoryEntry[];
}

async function readFromStorage(key: string): Promise<LoadHistoryEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown[];
    return (Array.isArray(parsed) ? parsed : [])
      .map((item) => LoadHistoryEntrySchema.safeParse(item))
      .filter((r) => r.success)
      .map((r) => (r as { success: true; data: LoadHistoryEntry }).data);
  } catch {
    return [];
  }
}

async function writeToStorage(key: string, entries: LoadHistoryEntry[]): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(entries));
  } catch {
    // Storage write failure is non-fatal
  }
}

export const useLoadHistoryStore = create<LoadHistoryState>()((set, get) => ({
  entries: {},

  hydrateForExercise: async (athleteId, exerciseId) => {
    const cacheKey = `${athleteId}:${exerciseId}`;
    // Already hydrated
    if (get().entries[cacheKey] !== undefined) return;
    const loaded = await readFromStorage(storageKey(athleteId, exerciseId));
    set((state) => ({
      entries: { ...state.entries, [cacheKey]: loaded },
    }));
  },

  upsert: async (entry) => {
    const cacheKey = `${entry.athleteId}:${entry.exerciseId}`;
    set((state) => {
      const existing = state.entries[cacheKey] ?? [];
      const idx = existing.findIndex((e) => e.id === entry.id);
      const next = idx >= 0
        ? existing.map((e, i) => (i === idx ? entry : e))
        : [...existing, entry];
      return { entries: { ...state.entries, [cacheKey]: next } };
    });
    // Persist async, fire-and-forget
    const updated = get().entries[cacheKey] ?? [];
    writeToStorage(storageKey(entry.athleteId, entry.exerciseId), updated).catch(() => {});
  },

  invalidate: async (id, athleteId, exerciseId, reason) => {
    const cacheKey = `${athleteId}:${exerciseId}`;
    const now = new Date().toISOString();
    set((state) => {
      const existing = state.entries[cacheKey] ?? [];
      const next = existing.map((e) =>
        e.id === id ? { ...e, invalidatedAt: now, invalidationReason: reason } : e,
      );
      return { entries: { ...state.entries, [cacheKey]: next } };
    });
    const updated = get().entries[cacheKey] ?? [];
    writeToStorage(storageKey(athleteId, exerciseId), updated).catch(() => {});
  },

  getLastEntry: (athleteId, exerciseId) => {
    const cacheKey = `${athleteId}:${exerciseId}`;
    const list = get().entries[cacheKey] ?? [];
    const valid = list
      .filter((e) => !e.invalidatedAt && e.setType === "working")
      .sort((a, b) => b.performedAt.localeCompare(a.performedAt));
    return valid[0] ?? null;
  },

  getEntriesFor: (athleteId, exerciseId) => {
    const cacheKey = `${athleteId}:${exerciseId}`;
    return (get().entries[cacheKey] ?? []).filter((e) => !e.invalidatedAt);
  },
}));
