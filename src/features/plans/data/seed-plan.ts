import type { AssignedPlan, PlanDay, PlanExercise } from "@/types/domain";

const PLAN_ID = "plan-ppl-seed";
const ATHLETE_ID = "user-seed";

function pe(input: {
  id: string;
  exerciseId: string;
  order: number;
  sets: number;
  min: number;
  max: number;
  rest: number;
  rir: number;
  supersetWith?: string;
}): PlanExercise {
  return {
    id: input.id,
    exerciseId: input.exerciseId,
    order: input.order,
    targetSets: input.sets,
    repRangeMin: input.min,
    repRangeMax: input.max,
    restSeconds: input.rest,
    targetRir: input.rir,
    isSupersetWith: input.supersetWith ?? null,
    coachNote: null,
  };
}

const pushDay: PlanDay = {
  id: "day-push-a",
  slotLabel: "A",
  slotIndex: 0,
  name: "Push A",
  targetDaysOfWeek: [1, 4],
  exercises: [
    pe({ id: "pe-1", exerciseId: "ex-bench-barbell", order: 0, sets: 4, min: 6, max: 8, rest: 180, rir: 2 }),
    pe({ id: "pe-2", exerciseId: "ex-incline-db", order: 1, sets: 3, min: 8, max: 10, rest: 120, rir: 2 }),
    pe({ id: "pe-3", exerciseId: "ex-cable-crossover", order: 2, sets: 3, min: 12, max: 15, rest: 90, rir: 1 }),
    pe({ id: "pe-4", exerciseId: "ex-shoulder-press-machine", order: 3, sets: 3, min: 10, max: 12, rest: 120, rir: 2 }),
    pe({ id: "pe-5", exerciseId: "ex-lateral-raise", order: 4, sets: 4, min: 12, max: 15, rest: 75, rir: 1, supersetWith: "pe-6" }),
    pe({ id: "pe-6", exerciseId: "ex-tricep-rope", order: 5, sets: 4, min: 12, max: 15, rest: 75, rir: 1, supersetWith: "pe-5" }),
  ],
};

const pullDay: PlanDay = {
  id: "day-pull-a",
  slotLabel: "B",
  slotIndex: 1,
  name: "Pull A",
  targetDaysOfWeek: [2, 5],
  exercises: [
    pe({ id: "pe-7", exerciseId: "ex-lat-pulldown", order: 0, sets: 4, min: 8, max: 10, rest: 150, rir: 2 }),
    pe({ id: "pe-8", exerciseId: "ex-row-barbell", order: 1, sets: 3, min: 6, max: 8, rest: 180, rir: 2 }),
    pe({ id: "pe-9", exerciseId: "ex-row-seated", order: 2, sets: 3, min: 10, max: 12, rest: 120, rir: 2 }),
    pe({ id: "pe-10", exerciseId: "ex-face-pull", order: 3, sets: 3, min: 15, max: 20, rest: 75, rir: 1 }),
    pe({ id: "pe-11", exerciseId: "ex-bicep-curl-db", order: 4, sets: 3, min: 10, max: 12, rest: 90, rir: 1 }),
  ],
};

const legsDay: PlanDay = {
  id: "day-legs-a",
  slotLabel: "C",
  slotIndex: 2,
  name: "Legs A",
  targetDaysOfWeek: [3, 6],
  exercises: [
    pe({ id: "pe-12", exerciseId: "ex-squat-barbell", order: 0, sets: 4, min: 6, max: 8, rest: 210, rir: 2 }),
    pe({ id: "pe-13", exerciseId: "ex-rdl", order: 1, sets: 3, min: 8, max: 10, rest: 180, rir: 2 }),
    pe({ id: "pe-14", exerciseId: "ex-leg-press", order: 2, sets: 3, min: 10, max: 12, rest: 150, rir: 2 }),
    pe({ id: "pe-15", exerciseId: "ex-leg-curl", order: 3, sets: 3, min: 12, max: 15, rest: 90, rir: 1 }),
    pe({ id: "pe-16", exerciseId: "ex-calf-raise", order: 4, sets: 4, min: 12, max: 15, rest: 75, rir: 1 }),
  ],
};

export const SEED_PLAN: AssignedPlan = {
  id: PLAN_ID,
  athleteId: ATHLETE_ID,
  coachId: null,
  templateId: null,
  name: "Push Pull Legs",
  weeks: 8,
  startDate: new Date().toISOString().slice(0, 10),
  status: "active",
  days: [pushDay, pullDay, legsDay],
  weekConfigs: [],
  weekVisibility: "current_and_next",
  coachNotes: null,
  version: 1,
  deletedAt: null,
  createdAt: new Date().toISOString(),
  syncedAt: null,
};

/** @deprecated Use SEED_PLAN. Alias mantido enquanto telas migrarem (Fase B). */
export const SEED_MESOCYCLE = SEED_PLAN;

export function getTodayPlanDay(): PlanDay {
  const idx = new Date().getDay() % SEED_PLAN.days.length;
  return SEED_PLAN.days[idx]!;
}
