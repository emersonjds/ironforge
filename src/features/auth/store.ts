import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "@shared/lib/storage/keys";
import { setApiAuthToken } from "@shared/lib/api/auth-token";
import { mockRelation } from "@shared/mocks";
import type { User } from "@/types/domain";
import type { AthleteProfile } from "@/types/domain";

/**
 * Durante a Fase A, o AuthState mantém tanto o User v2 quanto o AthleteProfile
 * para não quebrar telas que ainda lêem user.goal / user.unitSystem etc.
 * Na Fase B os hooks de perfil passarão a ler diretamente do athleteProfile.
 */
export type UserRole = "athlete" | "coach";

interface AuthState {
  user: User | null;
  role: UserRole | null;
  athleteProfile: AthleteProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  signIn: (
    user: User,
    token: string,
    athleteProfile?: AthleteProfile,
    role?: UserRole,
  ) => void;
  signOut: () => void;
  completeOnboarding: (patch: Partial<AthleteProfile>) => void;
}

const DEFAULT_ATHLETE_PROFILE: Omit<AthleteProfile, "userId" | "coachId"> = {
  goal: "hypertrophy",
  experienceLevel: "intermediate",
  unitSystem: "kg",
  bodyweightKg: null,
  restrictions: [],
  videoPerformerPref: "any",
  onboardingCompleted: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      athleteProfile: null,
      token: null,
      isAuthenticated: false,
      hasCompletedOnboarding: false,
      signIn: (user, token, athleteProfile, role = "athlete") => {
        const profile: AthleteProfile = athleteProfile ?? {
          userId: user.id,
          coachId: role === "athlete" ? mockRelation.coachId : null,
          ...DEFAULT_ATHLETE_PROFILE,
        };
        setApiAuthToken(token);
        set({
          user,
          role,
          athleteProfile: profile,
          token,
          isAuthenticated: true,
          // coach não passa pelo onboarding de aluno
          hasCompletedOnboarding: role === "coach" ? true : profile.onboardingCompleted,
        });
      },
      signOut: () => {
        setApiAuthToken(null);
        set({
          user: null,
          role: null,
          athleteProfile: null,
          token: null,
          isAuthenticated: false,
          hasCompletedOnboarding: false,
        });
      },
      completeOnboarding: (patch) =>
        set((state) => ({
          athleteProfile: state.athleteProfile
            ? { ...state.athleteProfile, ...patch, onboardingCompleted: true }
            : null,
          hasCompletedOnboarding: true,
        })),
    }),
    {
      name: STORAGE_KEYS.auth,
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        setApiAuthToken(state?.token ?? null);
      },
    },
  ),
);
