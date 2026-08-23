import { mockRelation } from "@shared/mocks";
import type { AthleteProfile, User } from "@/types/domain";
import type { UserRole } from "./store";

export interface DevAccount {
  id: string;
  label: string;
  hint: string;
  role: UserRole;
  user: User;
  athleteProfile: AthleteProfile;
}

const CREATED_AT = "2024-01-15T09:00:00.000Z";

const baseProfile = {
  goal: "hypertrophy",
  experienceLevel: "intermediate",
  unitSystem: "kg",
  bodyweightKg: null,
  restrictions: [],
  videoPerformerPref: "any",
} as const satisfies Omit<AthleteProfile, "userId" | "coachId" | "onboardingCompleted">;

/**
 * Contas de teste do modo dev. Nunca são expostas em build de produção —
 * o DevLoginPicker só renderiza sob `__DEV__`.
 */
export const DEV_ACCOUNTS: DevAccount[] = [
  {
    id: "athlete",
    label: "Ricardo — Aluno",
    hint: "onboarding pronto, vinculado à Amanda",
    role: "athlete",
    user: {
      id: mockRelation.athleteId,
      email: "ricardo@ironforge.dev",
      displayName: "Ricardo",
      avatarUrl: null,
      createdAt: CREATED_AT,
    },
    athleteProfile: {
      userId: mockRelation.athleteId,
      coachId: mockRelation.coachId,
      onboardingCompleted: true,
      ...baseProfile,
    },
  },
  {
    id: "athlete-new",
    label: "Aluno novo",
    hint: "cai no onboarding, sem professor",
    role: "athlete",
    user: {
      id: "user-novo",
      email: "novo@ironforge.dev",
      displayName: "Novato",
      avatarUrl: null,
      createdAt: CREATED_AT,
    },
    athleteProfile: {
      userId: "user-novo",
      coachId: null,
      onboardingCompleted: false,
      ...baseProfile,
      experienceLevel: "beginner",
    },
  },
  {
    id: "coach",
    label: "Amanda — Professora",
    hint: "painel do professor",
    role: "coach",
    user: {
      id: mockRelation.coachId,
      email: "amanda@ironforge.dev",
      displayName: "Amanda",
      avatarUrl: null,
      createdAt: CREATED_AT,
    },
    athleteProfile: {
      userId: mockRelation.coachId,
      coachId: null,
      onboardingCompleted: true,
      ...baseProfile,
    },
  },
];
