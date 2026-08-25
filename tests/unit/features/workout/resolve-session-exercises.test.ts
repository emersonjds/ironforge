import { resolveSessionExercises } from "@features/workout/lib/resolve-session-exercises";
import type { PlanDay, PlanExercise } from "@entities/plan";
import type { Exercise } from "@entities/exercise";

function pe(overrides: Partial<PlanExercise> & { id: string; exerciseId: string; order: number }): PlanExercise {
  return {
    targetSets: 3,
    repRangeMin: 8,
    repRangeMax: 12,
    restSeconds: 90,
    targetRir: 2,
    isSupersetWith: null,
    coachNote: null,
    ...overrides,
  };
}

function exercise(id: string, name: string): Exercise {
  return {
    id,
    name,
    primaryMuscle: "chest",
    secondaryMuscles: [],
    equipment: "barbell",
    movementPattern: "push_h",
    isUnilateral: false,
    baseExerciseId: null,
    variationType: null,
    equipmentDetail: null,
    muscleEmphasis: null,
    difficultyLevel: "intermediate",
    requiresSpotter: false,
    riskFlags: [],
    ownerCoachId: null,
    instructions: null,
  };
}

function planDay(exercises: PlanExercise[]): PlanDay {
  return { id: "day-1", slotLabel: "A", slotIndex: 0, name: "Push A", targetDaysOfWeek: [], exercises };
}

describe("resolveSessionExercises", () => {
  it("liga cada PlanExercise ao Exercise correspondente via exerciseId (UUID)", () => {
    const uuid = "8f14e45f-ceea-467e-abd0-fbbcd6b25e7f";
    const day = planDay([pe({ id: "pe-1", exerciseId: uuid, order: 0 })]);
    const map = new Map([[uuid, exercise(uuid, "Supino reto")]]);

    const result = resolveSessionExercises(day, map);

    expect(result).toHaveLength(1);
    expect(result[0]!.exercise?.name).toBe("Supino reto");
    expect(result[0]!.planExercise.id).toBe("pe-1");
  });

  it("retorna exercise null quando o id não está no mapa (ainda carregando ou não encontrado)", () => {
    const day = planDay([pe({ id: "pe-1", exerciseId: "unknown-id", order: 0 })]);
    const result = resolveSessionExercises(day, new Map());
    expect(result[0]!.exercise).toBeNull();
  });

  it("ordena pelo campo order, não pela ordem de chegada no array", () => {
    const day = planDay([
      pe({ id: "pe-2", exerciseId: "ex-2", order: 1 }),
      pe({ id: "pe-1", exerciseId: "ex-1", order: 0 }),
    ]);
    const result = resolveSessionExercises(day, new Map());
    expect(result.map((r) => r.planExercise.id)).toEqual(["pe-1", "pe-2"]);
  });

  it("não muta o array original de exercícios do dia", () => {
    const day = planDay([
      pe({ id: "pe-2", exerciseId: "ex-2", order: 1 }),
      pe({ id: "pe-1", exerciseId: "ex-1", order: 0 }),
    ]);
    const original = [...day.exercises];
    resolveSessionExercises(day, new Map());
    expect(day.exercises).toEqual(original);
  });
});
