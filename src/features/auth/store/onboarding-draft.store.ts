import { create } from "zustand";
import type { Goal, Experience, UnitSystem } from "@/types/enums";

interface OnboardingDraftState {
  goal: Goal | null;
  experienceLevel: Experience | null;
  unitSystem: UnitSystem;
  setStep1: (data: { goal: Goal; experienceLevel: Experience; unitSystem: UnitSystem }) => void;
  reset: () => void;
}

// Not persisted — session-only store for passing data between onboarding steps
export const useOnboardingDraftStore = create<OnboardingDraftState>()((set) => ({
  goal: null,
  experienceLevel: null,
  unitSystem: "kg",
  setStep1: (data) => set(data),
  reset: () => set({ goal: null, experienceLevel: null, unitSystem: "kg" }),
}));
