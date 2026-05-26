import { detectPRs } from "@entities/session/lib/pr-detection";

describe("detectPRs", () => {
  it("retorna vazio para set com peso ou reps zero", () => {
    expect(detectPRs({ currentSet: { weight: 0, reps: 5 }, history: [] })).toEqual([]);
    expect(detectPRs({ currentSet: { weight: 100, reps: 0 }, history: [] })).toEqual([]);
  });

  it("detecta e1RM e rep_max PR com histórico vazio", () => {
    const prs = detectPRs({ currentSet: { weight: 100, reps: 5 }, history: [] });
    expect(prs).toHaveLength(2);
    expect(prs.find((p) => p.type === "e1rm")).toBeDefined();
    expect(prs.find((p) => p.type === "rep_max")).toBeDefined();
  });

  it("não detecta PR quando set está abaixo do histórico", () => {
    const history = [{ weight: 120, reps: 5 }];
    const prs = detectPRs({ currentSet: { weight: 100, reps: 5 }, history });
    expect(prs).toHaveLength(0);
  });

  it("detecta rep_max quando peso é maior no mesmo número de reps", () => {
    const history = [{ weight: 100, reps: 5 }];
    const prs = detectPRs({ currentSet: { weight: 105, reps: 5 }, history });
    expect(prs.some((p) => p.type === "rep_max")).toBe(true);
  });

  it("calcula delta correto para e1RM PR", () => {
    const prs = detectPRs({
      currentSet: { weight: 110, reps: 5 },
      history: [{ weight: 100, reps: 5 }],
    });
    const e1rmPR = prs.find((p) => p.type === "e1rm");
    expect(e1rmPR).toBeDefined();
    expect(e1rmPR!.delta).toBeGreaterThan(0);
  });
});
