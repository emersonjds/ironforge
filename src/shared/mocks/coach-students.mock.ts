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

export interface CoachStudent {
  id: string;
  name: string;
  avatarUrl: string | null;
  planName: string;
  sessionsThisWeek: number;
  weeklyGoal: number;
  daysSinceLastSession: number;
  lastSession: StudentLastSession | null;
}

export const mockCoachName = "Amanda";

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
    lastSession: {
      dayName: "Legs A",
      whenLabel: "ontem",
      logs: [
        { name: "Agachamento Livre", topSet: "120kg × 6" },
        { name: "Leg Press", topSet: "300kg × 10" },
        { name: "Cadeira Flexora", topSet: "60kg × 12" },
      ],
    },
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
    lastSession: {
      dayName: "Upper A",
      whenLabel: "hoje",
      logs: [
        { name: "Supino Inclinado", topSet: "40kg × 10" },
        { name: "Remada Curvada", topSet: "50kg × 8" },
      ],
    },
  },
  {
    id: "st-3",
    name: "Bruno Almeida",
    avatarUrl: null,
    planName: "Full Body 3x",
    sessionsThisWeek: 0,
    weeklyGoal: 3,
    daysSinceLastSession: 4,
    lastSession: {
      dayName: "Full Body B",
      whenLabel: "há 4 dias",
      logs: [{ name: "Levantamento Terra", topSet: "140kg × 5" }],
    },
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
    lastSession: {
      dayName: "Treino B · Costas",
      whenLabel: "há 2 dias",
      logs: [
        { name: "Puxada Frente", topSet: "55kg × 10" },
        { name: "Rosca Direta", topSet: "30kg × 12" },
      ],
    },
  },
];

export function getStudent(id: string): CoachStudent | undefined {
  return mockStudents.find((s) => s.id === id);
}
