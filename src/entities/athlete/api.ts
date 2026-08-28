import { z } from "zod";
import { apiRequest, ApiError } from "@shared/lib/api/client";

const MeasurementSchema = z.object({
  id: z.string(),
  athleteId: z.string(),
  recordedBy: z.string(),
  measuredAt: z.string(),
  weightKg: z.number().nullable(),
  bodyFatPercent: z.number().nullable(),
  chestCm: z.number().nullable(),
  waistCm: z.number().nullable(),
  hipCm: z.number().nullable(),
  rightArmCm: z.number().nullable(),
  leftArmCm: z.number().nullable(),
  rightThighCm: z.number().nullable(),
  leftThighCm: z.number().nullable(),
  calfCm: z.number().nullable(),
  notes: z.string().nullable(),
  version: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Measurement = z.infer<typeof MeasurementSchema>;

export async function fetchMeasurements(): Promise<Measurement[]> {
  const raw = await apiRequest<unknown>("/athletes/me/measurements");
  return z.array(MeasurementSchema).parse(raw);
}

const CoachPaymentSchema = z.object({
  coachDisplayName: z.string(),
  pixKey: z.string().nullable(),
  pixKeyType: z.enum(["cpf", "cnpj", "email", "phone", "random"]).nullable(),
  monthlyPriceCents: z.number().int().nullable(),
  paymentNotes: z.string().nullable(),
});
export type CoachPayment = z.infer<typeof CoachPaymentSchema>;

/**
 * 404 é caso normal (aluno sem personal ativo agora) — vira null em vez de
 * lançar, pra tela tratar como "sem cobrança configurada" e não como erro.
 */
export async function fetchCoachPayment(): Promise<CoachPayment | null> {
  try {
    const raw = await apiRequest<unknown>("/athletes/me/coach-payment");
    return CoachPaymentSchema.parse(raw);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}
