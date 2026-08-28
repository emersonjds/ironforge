import {
  sessionTotalVolume,
  sessionDurationSeconds,
  sessionTopSetPerExercise,
  deltaVsPrevious,
} from "@entities/session/lib/session-stats";
import type { SetLog } from "@entities/session/schema";

function makeSet(overrides: Partial<SetLog> = {}): SetLog {
  return {
    id: "s1",
    sessionId: "sess1",
    exerciseId: "ex-bench-barbell",
    planExerciseId: null,
    assignedPlanId: null,
    setIndex: 1,
    type: "working",
    weight: 100,
    reps: 5,
    rir: 2,
    restTakenSeconds: null,
    completedAt: new Date().toISOString(),
    notes: null,
    editedAt: null,
    originalWeight: null,
    deletedAt: null,
    syncedAt: null,
    ...overrides,
  };
}

describe("sessionTotalVolume", () => {
  it("retorna 0 para lista vazia", () => {
    expect(sessionTotalVolume([])).toBe(0);
  });

  it("soma peso × reps de todos os sets", () => {
    const sets = [
      makeSet({ weight: 100, reps: 5 }),
      makeSet({ weight: 80, reps: 8 }),
    ];
    expect(sessionTotalVolume(sets)).toBe(100 * 5 + 80 * 8);
  });
});

describe("sessionDurationSeconds", () => {
  it("retorna 0 se endedAt é null", () => {
    expect(sessionDurationSeconds("2024-01-01T10:00:00.000Z", null)).toBe(0);
  });

  it("calcula duração corretamente", () => {
    const start = "2024-01-01T10:00:00.000Z";
    const end = "2024-01-01T11:00:00.000Z";
    expect(sessionDurationSeconds(start, end)).toBe(3600);
  });
});

describe("sessionTopSetPerExercise", () => {
  it("retorna mapa vazio para lista vazia", () => {
    expect(sessionTopSetPerExercise([]).size).toBe(0);
  });

  it("mantém apenas o set de maior volume (peso × reps) por exercício", () => {
    const sets = [
      makeSet({ id: "s1", exerciseId: "ex-bench", weight: 100, reps: 5 }),
      makeSet({ id: "s2", exerciseId: "ex-bench", weight: 100, reps: 8 }),
      makeSet({ id: "s3", exerciseId: "ex-squat", weight: 150, reps: 3 }),
    ];

    const map = sessionTopSetPerExercise(sets);

    expect(map.get("ex-bench")?.id).toBe("s2");
    expect(map.get("ex-squat")?.id).toBe("s3");
    expect(map.size).toBe(2);
  });

  it("mantém o primeiro set quando o volume não supera o atual", () => {
    const sets = [
      makeSet({ id: "s1", exerciseId: "ex-bench", weight: 100, reps: 8 }),
      makeSet({ id: "s2", exerciseId: "ex-bench", weight: 100, reps: 5 }),
    ];

    const map = sessionTopSetPerExercise(sets);

    expect(map.get("ex-bench")?.id).toBe("s1");
  });
});

describe("deltaVsPrevious", () => {
  it("retorna status first_time sem histórico", () => {
    const result = deltaVsPrevious({
      currentSets: [makeSet({ exerciseId: "ex-bench-barbell", weight: 100, reps: 5 })],
      previousSets: [],
      exerciseId: "ex-bench-barbell",
    });
    expect(result.status).toBe("first_time");
    expect(result.deltaKg).toBeNull();
  });

  it("detecta aumento de peso", () => {
    const result = deltaVsPrevious({
      currentSets: [makeSet({ exerciseId: "ex-bench-barbell", weight: 110, reps: 5 })],
      previousSets: [{ weight: 100, reps: 5 }],
      exerciseId: "ex-bench-barbell",
    });
    expect(result.status).toBe("increase_weight");
    expect(result.deltaKg).toBe(10);
  });

  it("detecta aumento de reps", () => {
    const result = deltaVsPrevious({
      currentSets: [makeSet({ exerciseId: "ex-bench-barbell", weight: 100, reps: 8 })],
      previousSets: [{ weight: 100, reps: 5 }],
      exerciseId: "ex-bench-barbell",
    });
    expect(result.status).toBe("increase_reps");
    expect(result.deltaReps).toBe(3);
  });

  it("detecta regressão quando o e1RM cai mais que 0.5", () => {
    const result = deltaVsPrevious({
      currentSets: [makeSet({ exerciseId: "ex-bench-barbell", weight: 80, reps: 5 })],
      previousSets: [{ weight: 100, reps: 5 }],
      exerciseId: "ex-bench-barbell",
    });
    expect(result.status).toBe("regression");
  });

  it("mantém same quando peso e reps repetem e o e1RM não regride de forma relevante", () => {
    const result = deltaVsPrevious({
      currentSets: [makeSet({ exerciseId: "ex-bench-barbell", weight: 100, reps: 5 })],
      previousSets: [{ weight: 100, reps: 5 }],
      exerciseId: "ex-bench-barbell",
    });
    expect(result.status).toBe("same");
    expect(result.deltaKg).toBe(0);
    expect(result.deltaReps).toBe(0);
  });

  it("caso limite: peso atual negativo nunca bate com o máximo (0) e cai no fallback de reps 0", () => {
    const result = deltaVsPrevious({
      currentSets: [makeSet({ exerciseId: "ex-bench-barbell", weight: -5, reps: 5 })],
      previousSets: [{ weight: 100, reps: 5 }],
      exerciseId: "ex-bench-barbell",
    });
    expect(result.currentBestWeight).toBe(0);
    expect(result.currentBestReps).toBe(0);
  });

  it("caso limite: peso anterior negativo nunca bate com o máximo (0) e cai no fallback de reps 0", () => {
    const result = deltaVsPrevious({
      currentSets: [makeSet({ exerciseId: "ex-bench-barbell", weight: 100, reps: 5 })],
      previousSets: [{ weight: -10, reps: 8 }],
      exerciseId: "ex-bench-barbell",
    });
    expect(result.deltaReps).toBe(5);
  });

  it("filtra os sets pelo exerciseId informado", () => {
    const result = deltaVsPrevious({
      currentSets: [
        makeSet({ exerciseId: "ex-bench-barbell", weight: 100, reps: 5 }),
        makeSet({ exerciseId: "ex-squat", weight: 999, reps: 20 }),
      ],
      previousSets: [{ weight: 100, reps: 5 }],
      exerciseId: "ex-bench-barbell",
    });
    expect(result.currentBestWeight).toBe(100);
  });
});
