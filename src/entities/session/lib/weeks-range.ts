export interface WeeksRange {
  from: string;
  to: string;
}

export function weeksRangeEndingNow(weeks: number, now = new Date()): WeeksRange {
  const from = new Date(now);
  from.setDate(from.getDate() - weeks * 7);
  return { from: from.toISOString(), to: now.toISOString() };
}
