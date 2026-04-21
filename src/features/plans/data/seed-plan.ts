import type { Mesocycle, PlanDay, PlanExercise } from "@/types/domain";

const MESO_ID = "meso-ppl-seed";
const USER_ID = "user-seed";

function pe(input: {
  id: string;
  planDayId: string;
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
    planDayId: input.planDayId,
    exerciseId: input.exerciseId,
    order: input.order,
    targetSets: input.sets,
    repRangeMin: input.min,
    repRangeMax: input.max,
    restSeconds: input.rest,
    targetRir: input.rir,
    isSupersetWith: input.supersetWith ?? null,
  };
}

const pushDay: PlanDay = {
  id: "day-push-a",
  mesocycleId: MESO_ID,
  dayIndex: 1,
  name: "Push A",
  exercises: [
    pe({ id: "pe-1", planDayId: "day-push-a", exerciseId: "ex-bench-barbell", order: 0, sets: 4, min: 6, max: 8, rest: 180, rir: 2 }),
    pe({ id: "pe-2", planDayId: "day-push-a", exerciseId: "ex-incline-db", order: 1, sets: 3, min: 8, max: 10, rest: 120, rir: 2 }),
    pe({ id: "pe-3", planDayId: "day-push-a", exerciseId: "ex-cable-crossover", order: 2, sets: 3, min: 12, max: 15, rest: 90, rir: 1 }),
    pe({ id: "pe-4", planDayId: "day-push-a", exerciseId: "ex-shoulder-press-machine", order: 3, sets: 3, min: 10, max: 12, rest: 120, rir: 2 }),
    pe({ id: "pe-5", planDayId: "day-push-a", exerciseId: "ex-lateral-raise", order: 4, sets: 4, min: 12, max: 15, rest: 75, rir: 1, supersetWith: "pe-6" }),
    pe({ id: "pe-6", planDayId: "day-push-a", exerciseId: "ex-tricep-rope", order: 5, sets: 4, min: 12, max: 15, rest: 75, rir: 1, supersetWith: "pe-5" }),
  ],
};

const pullDay: PlanDay = {
  id: "day-pull-a",
  mesocycleId: MESO_ID,
  dayIndex: 2,
  name: "Pull A",
  exercises: [
    pe({ id: "pe-7", planDayId: "day-pull-a", exerciseId: "ex-lat-pulldown", order: 0, sets: 4, min: 8, max: 10, rest: 150, rir: 2 }),
    pe({ id: "pe-8", planDayId: "day-pull-a", exerciseId: "ex-row-barbell", order: 1, sets: 3, min: 6, max: 8, rest: 180, rir: 2 }),
    pe({ id: "pe-9", planDayId: "day-pull-a", exerciseId: "ex-row-seated", order: 2, sets: 3, min: 10, max: 12, rest: 120, rir: 2 }),
    pe({ id: "pe-10", planDayId: "day-pull-a", exerciseId: "ex-face-pull", order: 3, sets: 3, min: 15, max: 20, rest: 75, rir: 1 }),
    pe({ id: "pe-11", planDayId: "day-pull-a", exerciseId: "ex-bicep-curl-db", order: 4, sets: 3, min: 10, max: 12, rest: 90, rir: 1 }),
  ],
};

const legsDay: PlanDay = {
  id: "day-legs-a",
  mesocycleId: MESO_ID,
  dayIndex: 3,
  name: "Legs A",
  exercises: [
    pe({ id: "pe-12", planDayId: "day-legs-a", exerciseId: "ex-squat-barbell", order: 0, sets: 4, min: 6, max: 8, rest: 210, rir: 2 }),
    pe({ id: "pe-13", planDayId: "day-legs-a", exerciseId: "ex-rdl", order: 1, sets: 3, min: 8, max: 10, rest: 180, rir: 2 }),
    pe({ id: "pe-14", planDayId: "day-legs-a", exerciseId: "ex-leg-press", order: 2, sets: 3, min: 10, max: 12, rest: 150, rir: 2 }),
    pe({ id: "pe-15", planDayId: "day-legs-a", exerciseId: "ex-leg-curl", order: 3, sets: 3, min: 12, max: 15, rest: 90, rir: 1 }),
    pe({ id: "pe-16", planDayId: "day-legs-a", exerciseId: "ex-calf-raise", order: 4, sets: 4, min: 12, max: 15, rest: 75, rir: 1 }),
  ],
};

export const SEED_MESOCYCLE: Mesocycle = {
  id: MESO_ID,
  userId: USER_ID,
  name: "Push Pull Legs",
  weeks: 8,
  startDate: new Date().toISOString(),
  status: "active",
  days: [pushDay, pullDay, legsDay],
};

export function getTodayPlanDay(): PlanDay {
  const idx = new Date().getDay() % SEED_MESOCYCLE.days.length;
  return SEED_MESOCYCLE.days[idx]!;
}
