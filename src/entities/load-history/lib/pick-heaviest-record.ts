import type { PersonalRecordEntry } from "../api";

export function pickHeaviestRecord(records: PersonalRecordEntry[]): PersonalRecordEntry | null {
  if (!records.length) return null;
  return records.reduce((best, r) => (r.weight > best.weight ? r : best));
}
