import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "@lib/storage/keys";
import type { User } from "@/types/domain";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  signIn: (user: User, token: string) => void;
  signOut: () => void;
  completeOnboarding: (patch: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      hasCompletedOnboarding: false,
      signIn: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
          hasCompletedOnboarding: user.onboardingCompleted,
        }),
      signOut: () =>
        set({ user: null, token: null, isAuthenticated: false, hasCompletedOnboarding: false }),
      completeOnboarding: (patch) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...patch, onboardingCompleted: true } : null,
          hasCompletedOnboarding: true,
        })),
    }),
    {
      name: STORAGE_KEYS.auth,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
