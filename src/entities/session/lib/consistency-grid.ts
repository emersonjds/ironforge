import type { Session } from "../schema";

// 0 = no session, 1-4 = increasing consistency level
export type ConsistencyLevel = 0 | 1 | 2 | 3 | 4;

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function startOfDay(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

export function buildConsistencyGrid(sessions: Session[], weeks = 26): ConsistencyLevel[][] {
  // Index sessions by date key
  const byDate = new Map<string, number>();
  for (const s of sessions) {
    if (!s.endedAt) continue;
    const key = dateKey(new Date(s.endedAt));
    byDate.set(key, (byDate.get(key) ?? 0) + 1);
  }

  // Volume counts for quartile calculation (non-zero days only)
  const counts = [...byDate.values()].filter((n) => n > 0);
  counts.sort((a, b) => a - b);
  const q1 = counts[Math.floor(counts.length * 0.25)] ?? 1;
  const q2 = counts[Math.floor(counts.length * 0.5)] ?? 1;
  const q3 = counts[Math.floor(counts.length * 0.75)] ?? 1;

  function toLevel(count: number): ConsistencyLevel {
    if (count === 0) return 0;
    if (count <= q1) return 1;
    if (count <= q2) return 2;
    if (count <= q3) return 3;
    return 4;
  }

  // Build grid: week 0 is the oldest, col 0 is Sunday
  const today = startOfDay(new Date());
  const grid: ConsistencyLevel[][] = [];

  for (let w = weeks - 1; w >= 0; w--) {
    const weekCols: ConsistencyLevel[] = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(today);
      // Go back w weeks + (6-d) days from today's day of week to fill columns Sun→Sat
      const daysBack = w * 7 + (today.getDay() - d + 7) % 7;
      day.setDate(today.getDate() - daysBack);
      const key = dateKey(day);
      const count = byDate.get(key) ?? 0;
      weekCols.push(toLevel(count));
    }
    grid.push(weekCols);
  }

  return grid;
}
