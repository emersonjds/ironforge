import { http, HttpResponse } from "msw";
import { API_BASE_URL } from "@shared/lib/api/client";

interface WeekSummaryRow {
  weekStart: string;
  totalVolume: number;
  maxWeight: number;
}

interface PersonalRecordRow {
  exerciseId: string;
  weight: number;
  reps: number;
  performedAt: string;
}

let weeks: WeekSummaryRow[] = [];
let personalRecords: PersonalRecordRow[] = [];

export function resetLoadHistoryHandlerState(): void {
  weeks = [];
  personalRecords = [];
}

export function seedWeekSummary(row: WeekSummaryRow): void {
  weeks.push(row);
}

export function seedPersonalRecord(row: PersonalRecordRow): void {
  personalRecords.push(row);
}

export const loadHistoryHandlers = [
  http.get(`${API_BASE_URL}/load-history/summary`, () => {
    return HttpResponse.json({ weeks });
  }),

  http.get(`${API_BASE_URL}/load-history/personal-records`, () => {
    return HttpResponse.json(personalRecords);
  }),
];
