import {
  EXERCISE_CATALOG,
  getExercise,
  getExercisesByMuscle,
  findSwapCandidates,
} from "@entities/exercise/catalog";

describe("EXERCISE_CATALOG", () => {
  it("tem pelo menos 10 exercícios", () => {
    expect(EXERCISE_CATALOG.length).toBeGreaterThanOrEqual(10);
  });

  it("todos os exercícios têm id, name, primaryMuscle", () => {
    for (const ex of EXERCISE_CATALOG) {
      expect(ex.id).toBeTruthy();
      expect(ex.name).toBeTruthy();
      expect(ex.primaryMuscle).toBeTruthy();
    }
  });

  it("ids são únicos", () => {
    const ids = EXERCISE_CATALOG.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("getExercise", () => {
  it("retorna o exercício pelo id", () => {
    const ex = getExercise("ex-bench-barbell");
    expect(ex).toBeDefined();
    expect(ex!.name).toBe("Supino reto");
  });

  it("retorna undefined para id inexistente", () => {
    expect(getExercise("ex-nao-existe")).toBeUndefined();
  });
});

describe("getExercisesByMuscle", () => {
  it("retorna exercícios pelo músculo primário", () => {
    const chest = getExercisesByMuscle("chest");
    expect(chest.length).toBeGreaterThan(0);
    expect(chest.every((e) => e.primaryMuscle === "chest")).toBe(true);
  });
});

describe("findSwapCandidates", () => {
  it("retorna exercícios com mesmo músculo e padrão, excluindo o original", () => {
    const bench = getExercise("ex-bench-barbell")!;
    const candidates = findSwapCandidates(bench);
    expect(candidates.every((c) => c.id !== bench.id)).toBe(true);
    expect(candidates.every((c) => c.primaryMuscle === bench.primaryMuscle)).toBe(true);
    expect(candidates.every((c) => c.movementPattern === bench.movementPattern)).toBe(true);
  });
});
