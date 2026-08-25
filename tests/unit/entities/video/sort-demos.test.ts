import { sortDemos } from "@entities/video/lib/sort-demos";
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

describe("sortDemos", () => {
  it("coloca demonstrações do personal do aluno antes das do catálogo", () => {
    const catalog = demo({ videoId: "catalog", ownedByCoach: false });
    const own = demo({ videoId: "own-coach", ownedByCoach: true });
    const sorted = sortDemos([catalog, own]);
    expect(sorted.map((d) => d.videoId)).toEqual(["own-coach", "catalog"]);
  });

  it("dentro do mesmo personal, coloca a demonstração primária primeiro", () => {
    const secondary = demo({ videoId: "secondary", ownedByCoach: true, isPrimary: false });
    const primary = demo({ videoId: "primary", ownedByCoach: true, isPrimary: true });
    const sorted = sortDemos([secondary, primary]);
    expect(sorted.map((d) => d.videoId)).toEqual(["primary", "secondary"]);
  });

  it("preserva a ordem relativa do catálogo (sort estável)", () => {
    const catalogA = demo({ videoId: "catalog-a" });
    const catalogB = demo({ videoId: "catalog-b" });
    const sorted = sortDemos([catalogA, catalogB]);
    expect(sorted.map((d) => d.videoId)).toEqual(["catalog-a", "catalog-b"]);
  });

  it("não muta o array original", () => {
    const list = [demo({ videoId: "a" }), demo({ videoId: "b", ownedByCoach: true })];
    const original = [...list];
    sortDemos(list);
    expect(list).toEqual(original);
  });
});
