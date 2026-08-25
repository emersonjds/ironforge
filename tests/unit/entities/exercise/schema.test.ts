import { ExerciseSchema } from "@entities/exercise/schema";

function baseExercise(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "8f14e45f-ceea-467e-abd0-fbbcd6b25e7f",
    name: "Puxada frontal",
    primaryMuscle: "back_lats",
    secondaryMuscles: ["biceps"],
    equipment: "cable",
    movementPattern: "pull_v",
    isUnilateral: false,
    baseExerciseId: null,
    variationType: null,
    equipmentDetail: null,
    muscleEmphasis: null,
    difficultyLevel: "beginner",
    requiresSpotter: false,
    riskFlags: [],
    ownerCoachId: null,
    ...overrides,
  };
}

describe("ExerciseSchema — contrato do backend", () => {
  it("aceita instructions como string", () => {
    const raw = baseExercise({ instructions: "Sente-se.\nPuxe a barra." });
    const parsed = ExerciseSchema.parse(raw);
    expect(parsed.instructions).toBe("Sente-se.\nPuxe a barra.");
  });

  it("aceita instructions null explicitamente", () => {
    const raw = baseExercise({ instructions: null });
    const parsed = ExerciseSchema.parse(raw);
    expect(parsed.instructions).toBeNull();
  });

  it("aplica default null quando instructions não vem no payload", () => {
    const raw = baseExercise();
    const parsed = ExerciseSchema.parse(raw);
    expect(parsed.instructions).toBeNull();
  });

  it("ignora campos extras do backend (createdAt/updatedAt) sem quebrar o parse", () => {
    const raw = baseExercise({
      instructions: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    expect(() => ExerciseSchema.parse(raw)).not.toThrow();
  });
});
