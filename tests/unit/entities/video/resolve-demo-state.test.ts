import { resolveDemoState } from "@entities/video/lib/resolve-demo-state";
import type { ExerciseDemo } from "@entities/video/schema";

function demo(overrides: Partial<ExerciseDemo> & { videoId: string }): ExerciseDemo {
  return {
    exerciseId: "exercise",
    title: "Demo",
    source: "youtube",
    performerGender: "all",
    coachNote: null,
    isPrimary: false,
    ownedByCoach: false,
    coach: null,
    playback: { kind: "unavailable", reason: "n/a" },
    ...overrides,
  };
}

describe("resolveDemoState", () => {
  it("loading enquanto a query ainda não tem dados", () => {
    expect(resolveDemoState({ demos: undefined, isLoading: true, isError: false })).toBe("loading");
  });

  it("empty quando não há demonstrações e não houve erro — instruções/nota do plano continuam visíveis fora deste estado", () => {
    expect(resolveDemoState({ demos: [], isLoading: false, isError: false })).toBe("empty");
  });

  it("error quando a busca falha (API fora do ar ou offline)", () => {
    expect(resolveDemoState({ demos: undefined, isLoading: false, isError: true })).toBe("error");
  });

  it("error também quando demos permanece undefined mesmo sem isLoading", () => {
    expect(resolveDemoState({ demos: undefined, isLoading: false, isError: true })).toBe("error");
  });

  it("ready quando há ao menos uma demonstração", () => {
    const demos = [demo({ videoId: "v1" })];
    expect(resolveDemoState({ demos, isLoading: false, isError: false })).toBe("ready");
  });

  it("prioriza os dados já em cache sobre isLoading (refetch em background)", () => {
    const demos = [demo({ videoId: "v1" })];
    expect(resolveDemoState({ demos, isLoading: true, isError: false })).toBe("ready");
  });
});
