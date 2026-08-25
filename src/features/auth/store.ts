import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "@shared/lib/storage/keys";
import { setApiAuthToken } from "@shared/lib/api/auth-token";
import { ApiError, setUnauthorizedHandler } from "@shared/lib/api/client";
import { mockRelation } from "@shared/mocks";
import { login, fetchMe, type AuthUser } from "./api";
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
  setUser: (user: User) => void;
  completeOnboarding: (patch: Partial<AthleteProfile>) => void;
  loginWithPassword: (email: string, password: string, role: UserRole) => Promise<void>;
}

function toDomainUser(user: AuthUser): User {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  };
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
    (set, get) => ({
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
      setUser: (user) => set({ user }),
      completeOnboarding: (patch) =>
        set((state) => ({
          athleteProfile: state.athleteProfile
            ? { ...state.athleteProfile, ...patch, onboardingCompleted: true }
            : null,
          hasCompletedOnboarding: true,
        })),

      loginWithPassword: async (email, password, role) => {
        let response;
        try {
          response = await login(email, password);
        } catch (err) {
          if (err instanceof ApiError && err.status === 401) {
            throw new Error("E-mail ou senha inválidos.");
          }
          throw new Error("Não foi possível entrar agora. Verifique sua conexão.");
        }

        const { accessToken, user } = response;
        const domainUser = toDomainUser(user);
        // Backend real ainda não modela onboarding — um aluno que já loga com
        // credenciais reais já tem plano do personal, então não faz sentido
        // mandá-lo para o onboarding mobile.
        const athleteProfile: AthleteProfile | undefined =
          role === "athlete"
            ? { userId: user.id, coachId: user.coachId, ...DEFAULT_ATHLETE_PROFILE, onboardingCompleted: true }
            : undefined;

        get().signIn(domainUser, accessToken, athleteProfile, role);
      },
    }),
    {
      name: STORAGE_KEYS.auth,
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        setApiAuthToken(state?.token ?? null);
        if (state?.token) void validateSession();
      },
    },
  ),
);

setUnauthorizedHandler(() => useAuthStore.getState().signOut());

/**
 * Roda no boot quando há token persistido: confirma com a API que a sessão
 * ainda é válida e atualiza o usuário com a fonte de verdade do backend.
 * Token inválido derruba a sessão local (evita reabrir o app "logado" com
 * um usuário que a API não reconhece mais).
 */
export async function validateSession(): Promise<void> {
  const { token, signOut, setUser } = useAuthStore.getState();
  if (!token) return;

  try {
    const me = await fetchMe();
    setUser(toDomainUser(me));
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) signOut();
  }
}
