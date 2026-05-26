/** Alunos mockados para o modo professor (companion). */

export interface StudentExerciseLog {
  name: string;
  topSet: string; // ex.: "100kg × 8"
}

export interface StudentLastSession {
  dayName: string;
  whenLabel: string;
  logs: StudentExerciseLog[];
}

export interface PlanDayLite {
  label: string;
  name: string;
  exercises: string[];
}

export interface SwapRequest {
  fromExercise: string;
  toExercise: string;
  reason: string;
}

export interface SessionHistoryItem {
  whenLabel: string;
  dayName: string;
  topSet: string;
}

export interface CoachStudent {
  id: string;
  name: string;
  avatarUrl: string | null;
  planName: string;
  sessionsThisWeek: number;
  weeklyGoal: number;
  daysSinceLastSession: number;
  /** sessões por semana nas últimas 6 semanas */
  adherenceWeeks: number[];
  plan: PlanDayLite[];
  pendingSwap: SwapRequest | null;
  lastSession: StudentLastSession | null;
  history: SessionHistoryItem[];
}

export const mockCoachName = "Amanda";

const PPL_PLAN: PlanDayLite[] = [
  { label: "A", name: "Push", exercises: ["Supino Reto", "Desenvolvimento", "Tríceps Corda"] },
  { label: "B", name: "Pull", exercises: ["Puxada Frente", "Remada Curvada", "Rosca Direta"] },
  { label: "C", name: "Legs", exercises: ["Agachamento Livre", "Leg Press", "Cadeira Flexora"] },
];

export const mockStudents: CoachStudent[] = [
  {
    id: "st-1",
    name: "Ricardo Silva",
    avatarUrl:
      "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=160&h=160&fit=crop",
    planName: "Push Pull Legs",
    sessionsThisWeek: 3,
    weeklyGoal: 4,
    daysSinceLastSession: 1,
    adherenceWeeks: [3, 4, 2, 4, 3, 3],
    plan: PPL_PLAN,
    pendingSwap: {
      fromExercise: "Leg Press",
      toExercise: "Hack Squat",
      reason: "Sentindo desconforto no joelho no Leg Press.",
    },
    lastSession: {
      dayName: "Legs A",
      whenLabel: "ontem",
      logs: [
        { name: "Agachamento Livre", topSet: "120kg × 6" },
        { name: "Leg Press", topSet: "300kg × 10" },
        { name: "Cadeira Flexora", topSet: "60kg × 12" },
      ],
    },
    history: [
      { whenLabel: "ontem", dayName: "Legs A", topSet: "Agachamento 120kg × 6" },
      { whenLabel: "há 3 dias", dayName: "Pull A", topSet: "Puxada 75kg × 8" },
      { whenLabel: "há 5 dias", dayName: "Push A", topSet: "Supino 100kg × 7" },
    ],
  },
  {
    id: "st-2",
    name: "Marina Costa",
    avatarUrl:
      "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=160&h=160&fit=crop",
    planName: "Upper / Lower",
    sessionsThisWeek: 4,
    weeklyGoal: 4,
    daysSinceLastSession: 0,
    adherenceWeeks: [4, 4, 3, 4, 4, 4],
    plan: [
      { label: "A", name: "Upper", exercises: ["Supino Inclinado", "Remada Baixa", "Elevação Lateral"] },
      { label: "B", name: "Lower", exercises: ["Agachamento", "Stiff", "Panturrilha"] },
    ],
    pendingSwap: null,
    lastSession: {
      dayName: "Upper A",
      whenLabel: "hoje",
      logs: [
        { name: "Supino Inclinado", topSet: "40kg × 10" },
        { name: "Remada Curvada", topSet: "50kg × 8" },
      ],
    },
    history: [
      { whenLabel: "hoje", dayName: "Upper A", topSet: "Supino incl. 40kg × 10" },
      { whenLabel: "há 2 dias", dayName: "Lower A", topSet: "Agachamento 90kg × 8" },
    ],
  },
  {
    id: "st-3",
    name: "Bruno Almeida",
    avatarUrl: null,
    planName: "Full Body 3x",
    sessionsThisWeek: 0,
    weeklyGoal: 3,
    daysSinceLastSession: 4,
    adherenceWeeks: [3, 2, 3, 1, 2, 0],
    plan: [
      { label: "A", name: "Full Body A", exercises: ["Levantamento Terra", "Supino", "Barra Fixa"] },
      { label: "B", name: "Full Body B", exercises: ["Agachamento", "Desenvolvimento", "Remada"] },
    ],
    pendingSwap: null,
    lastSession: {
      dayName: "Full Body B",
      whenLabel: "há 4 dias",
      logs: [{ name: "Levantamento Terra", topSet: "140kg × 5" }],
    },
    history: [{ whenLabel: "há 4 dias", dayName: "Full Body B", topSet: "Terra 140kg × 5" }],
  },
  {
    id: "st-4",
    name: "Carla Mendes",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&h=160&fit=crop",
    planName: "Hipertrofia A/B/C",
    sessionsThisWeek: 2,
    weeklyGoal: 5,
    daysSinceLastSession: 2,
    adherenceWeeks: [5, 4, 5, 3, 4, 2],
    plan: [
      { label: "A", name: "Peito & Tríceps", exercises: ["Supino", "Crucifixo", "Tríceps Testa"] },
      { label: "B", name: "Costas & Bíceps", exercises: ["Puxada Frente", "Remada", "Rosca Direta"] },
      { label: "C", name: "Pernas", exercises: ["Agachamento", "Leg Press", "Flexora"] },
    ],
    pendingSwap: {
      fromExercise: "Supino",
      toExercise: "Supino com Halteres",
      reason: "Quero focar mais em amplitude.",
    },
    lastSession: {
      dayName: "Treino B · Costas",
      whenLabel: "há 2 dias",
      logs: [
        { name: "Puxada Frente", topSet: "55kg × 10" },
        { name: "Rosca Direta", topSet: "30kg × 12" },
      ],
    },
    history: [
      { whenLabel: "há 2 dias", dayName: "Costas & Bíceps", topSet: "Puxada 55kg × 10" },
      { whenLabel: "há 4 dias", dayName: "Peito & Tríceps", topSet: "Supino 45kg × 9" },
    ],
  },
];

export function getStudent(id: string): CoachStudent | undefined {
  return mockStudents.find((s) => s.id === id);
}
