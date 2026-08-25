import { pickActiveAssignment } from "@entities/plan/lib/pick-active-assignment";
import type { AssignedPlan } from "@entities/plan";

function makeAssignment(overrides: Partial<AssignedPlan> & { id: string }): AssignedPlan {
  return {
    athleteId: "athlete-1",
    coachId: "coach-1",
    templateId: null,
    name: "Plano",
    weeks: 8,
    startDate: "2026-01-01",
    status: "active",
    days: [],
    weekConfigs: [],
    weekVisibility: "all",
    coachNotes: null,
    version: 1,
    deletedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    syncedAt: null,
    ...overrides,
  };
}

describe("pickActiveAssignment", () => {
  it("retorna null para lista vazia", () => {
    expect(pickActiveAssignment([])).toBeNull();
  });

  it("retorna o único item quando há um só, mesmo não ativo", () => {
    const paused = makeAssignment({ id: "p1", status: "paused" });
    expect(pickActiveAssignment([paused])?.id).toBe("p1");
  });

  it("prioriza o assignment com status active entre vários", () => {
    const archived = makeAssignment({ id: "a1", status: "archived" });
    const active = makeAssignment({ id: "a2", status: "active" });
    const paused = makeAssignment({ id: "a3", status: "paused" });
    expect(pickActiveAssignment([archived, active, paused])?.id).toBe("a2");
  });

  it("sem nenhum active, cai no primeiro item da lista", () => {
    const paused = makeAssignment({ id: "b1", status: "paused" });
    const archived = makeAssignment({ id: "b2", status: "archived" });
    expect(pickActiveAssignment([paused, archived])?.id).toBe("b1");
  });
});
