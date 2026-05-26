/** Dados mockados de Progresso (peso corporal, volume semanal, recordes). */

export interface BodyWeightPoint {
  month: string;
  kg: number;
}

export const mockBodyWeightSeries: BodyWeightPoint[] = [
  { month: "JAN", kg: 78.0 },
  { month: "FEV", kg: 78.8 },
  { month: "MAR", kg: 79.6 },
  { month: "ABR", kg: 80.5 },
  { month: "MAI", kg: 81.4 },
  { month: "JUN", kg: 82.0 },
];

export interface MuscleVolume {
  muscle: string;
  sets: number;
  target: number;
}

export const mockWeeklyVolume: MuscleVolume[] = [
  { muscle: "Peito", sets: 14, target: 18 },
  { muscle: "Costas", sets: 16, target: 18 },
  { muscle: "Ombros", sets: 12, target: 16 },
  { muscle: "Pernas", sets: 18, target: 20 },
  { muscle: "Braços", sets: 10, target: 14 },
];

export interface PrEntry {
  id: string;
  exercise: string;
  weightKg: number;
  reps: number;
  date: string;
}

export const mockPrHistory: PrEntry[] = [
  { id: "pr-1", exercise: "Supino Reto", weightKg: 120, reps: 3, date: "28/03" },
  { id: "pr-2", exercise: "Agachamento Livre", weightKg: 160, reps: 5, date: "15/03" },
  { id: "pr-3", exercise: "Levantamento Terra", weightKg: 200, reps: 1, date: "02/03" },
  { id: "pr-4", exercise: "Desenvolvimento", weightKg: 70, reps: 6, date: "20/02" },
];

/**
 * Grid de consistência (26 semanas × 7 dias), nível 0–4 — mock determinístico.
 * Foco em consistência (não streak): 0 = sem treino, 4 = treino mais completo.
 */
export const mockConsistencyWeeks: number[][] = Array.from({ length: 26 }, (_, w) =>
  Array.from({ length: 7 }, (_, d) => {
    const trainsToday = d === 0 || d === 2 || d === 4 || d === 5; // seg/qua/sex/sáb
    if (!trainsToday) return 0;
    if ((w * 7 + d) % 11 === 0) return 0; // alguns furos realistas
    return Math.min(1 + Math.floor((w / 26) * 3), 4); // mais consistente nas últimas semanas
  }),
);
