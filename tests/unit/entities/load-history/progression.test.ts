import {
  suggestNextSet,
  isUpperBody,
  weightIncrement,
} from "@entities/load-history/lib/progression";

describe("isUpperBody", () => {
  it("retorna true para padrões de upper body", () => {
    expect(isUpperBody("push_h")).toBe(true);
    expect(isUpperBody("push_v")).toBe(true);
    expect(isUpperBody("pull_h")).toBe(true);
    expect(isUpperBody("pull_v")).toBe(true);
    expect(isUpperBody("isolation")).toBe(true);
  });

  it("retorna false para padrões de lower body", () => {
    expect(isUpperBody("squat")).toBe(false);
    expect(isUpperBody("hinge")).toBe(false);
    expect(isUpperBody("lunge")).toBe(false);
  });
});

describe("weightIncrement", () => {
  it("retorna 2.5 para upper body", () => {
    expect(weightIncrement("push_h")).toBe(2.5);
  });

  it("retorna 5 para lower body", () => {
    expect(weightIncrement("squat")).toBe(5);
  });
});

describe("suggestNextSet", () => {
  const baseOpts = {
    repRangeMin: 8,
    repRangeMax: 12,
    targetRir: 2,
    pattern: "push_h" as const,
  };

  it("retorna first_time sem histórico", () => {
    const result = suggestNextSet({ ...baseOpts, lastSets: [] });
    expect(result.reason).toBe("first_time");
    expect(result.weight).toBe(0);
    expect(result.reps).toBe(8);
  });

  it("sugere aumento de peso quando todos os sets atingiram o topo da faixa com RIR ok", () => {
    const lastSets = [
      { weight: 100, reps: 12, rir: 2 },
      { weight: 100, reps: 12, rir: 2 },
      { weight: 100, reps: 12, rir: 3 },
    ];
    const result = suggestNextSet({ ...baseOpts, lastSets });
    expect(result.reason).toBe("increase_weight");
    expect(result.weight).toBe(102.5);
    expect(result.reps).toBe(8);
  });

  it("sugere aumento de reps quando ainda não atingiu o máximo", () => {
    const lastSets = [{ weight: 100, reps: 10, rir: 2 }];
    const result = suggestNextSet({ ...baseOpts, lastSets });
    expect(result.reason).toBe("increase_reps");
    expect(result.reps).toBe(11);
  });

  it("sugere hold quando RIR é 0 e reps < max", () => {
    const lastSets = [{ weight: 100, reps: 10, rir: 0 }];
    const result = suggestNextSet({ ...baseOpts, lastSets });
    expect(result.reason).toBe("hold");
  });
});
