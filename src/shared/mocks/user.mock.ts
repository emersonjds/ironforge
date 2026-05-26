import type { User, AthleteProfile } from "@/types/domain";

/** Usuário mockado para a fase de UI (sem backend). */
export const mockUser: User = {
  id: "user-ricardo",
  email: "ricardo.silva@ironforge.app",
  displayName: "Ricardo Silva",
  avatarUrl:
    "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=200&h=200&fit=crop",
  createdAt: "2024-01-15T09:00:00.000Z",
};

export const mockAthleteProfile: AthleteProfile = {
  userId: "user-ricardo",
  coachId: "coach-amanda",
  goal: "hypertrophy",
  experienceLevel: "intermediate",
  unitSystem: "kg",
  bodyweightKg: 82,
  restrictions: [],
  videoPerformerPref: "any",
  onboardingCompleted: true,
};

export const mockMembership = {
  since: "Jan 2024",
  plan: "Plano Pro",
};
