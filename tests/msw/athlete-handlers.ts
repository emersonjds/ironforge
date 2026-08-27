import { http, HttpResponse } from "msw";
import { API_BASE_URL } from "@shared/lib/api/client";

interface MeasurementRow {
  id: string;
  athleteId: string;
  recordedBy: string;
  measuredAt: string;
  weightKg: number | null;
  bodyFatPercent: number | null;
  chestCm: number | null;
  waistCm: number | null;
  hipCm: number | null;
  rightArmCm: number | null;
  leftArmCm: number | null;
  rightThighCm: number | null;
  leftThighCm: number | null;
  calfCm: number | null;
  notes: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

interface CoachPaymentRow {
  coachDisplayName: string;
  pixKey: string | null;
  pixKeyType: "cpf" | "cnpj" | "email" | "phone" | "random" | null;
  monthlyPriceCents: number | null;
  paymentNotes: string | null;
}

let measurements: MeasurementRow[] = [];
let coachPayment: CoachPaymentRow | null = null;

export function resetAthleteHandlerState(): void {
  measurements = [];
  coachPayment = null;
}

export function seedMeasurement(overrides: Partial<MeasurementRow> = {}): MeasurementRow {
  const now = new Date().toISOString();
  const row: MeasurementRow = {
    id: `measurement-${measurements.length + 1}`,
    athleteId: "athlete-1",
    recordedBy: "coach-1",
    measuredAt: now,
    weightKg: null,
    bodyFatPercent: null,
    chestCm: null,
    waistCm: null,
    hipCm: null,
    rightArmCm: null,
    leftArmCm: null,
    rightThighCm: null,
    leftThighCm: null,
    calfCm: null,
    notes: null,
    version: 1,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
  measurements.push(row);
  return row;
}

export function setCoachPayment(payment: CoachPaymentRow | null): void {
  coachPayment = payment;
}

function errorBody(code: string, message: string) {
  return { error: { code, message, details: {} } };
}

export const athleteHandlers = [
  http.get(`${API_BASE_URL}/athletes/me/measurements`, () => {
    return HttpResponse.json(measurements);
  }),

  http.get(`${API_BASE_URL}/athletes/me/coach-payment`, () => {
    if (!coachPayment) {
      return HttpResponse.json(errorBody("COACH_NOT_FOUND", "No active coach found for this athlete."), {
        status: 404,
      });
    }
    return HttpResponse.json(coachPayment);
  }),
];
