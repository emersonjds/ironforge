import { resolveNextSession } from "@entities/plan/lib/resolve-next-session";
import type { AssignedPlan, PlanDay } from "@entities/plan";

function makeDay(overrides: Partial<PlanDay> & { id: string; slotIndex: number; slotLabel: string }): PlanDay {
  return {
    name: `Treino ${overrides.slotLabel}`,
    targetDaysOfWeek: [],
    exercises: [],
    ...overrides,
  };
}

function makePlan(days: PlanDay[]): AssignedPlan {
  return {
    id: "plan-1",
    athleteId: "user-1",
    coachId: null,
    templateId: null,
    name: "Plano teste",
    weeks: 8,
    startDate: "2024-01-01",
    status: "active",
    days,
    weekConfigs: [],
    weekVisibility: "all",
    coachNotes: null,
    version: 1,
    deletedAt: null,
    createdAt: "2024-01-01T00:00:00.000Z",
    syncedAt: null,
  };
}

describe("resolveNextSession", () => {
  describe("sem sessão anterior (primeira vez)", () => {
    it("plano de 1 dia sempre retorna o único dia", () => {
      const day = makeDay({ id: "d1", slotIndex: 0, slotLabel: "A" });
      const plan = makePlan([day]);
      const result = resolveNextSession(plan, null);
      expect(result.planDay.id).toBe("d1");
      expect(result.slotLabel).toBe("A");
    });

    it("plano de 4 dias ABCD retorna o dia de slotIndex 0 (A)", () => {
      const days = [
        makeDay({ id: "d1", slotIndex: 0, slotLabel: "A" }),
        makeDay({ id: "d2", slotIndex: 1, slotLabel: "B" }),
        makeDay({ id: "d3", slotIndex: 2, slotLabel: "C" }),
        makeDay({ id: "d4", slotIndex: 3, slotLabel: "D" }),
      ];
      const plan = makePlan(days);
      const result = resolveNextSession(plan, null);
      expect(result.planDay.id).toBe("d1");
      expect(result.slotLabel).toBe("A");
    });

    it("retorna primeiro dia mesmo com dias desordenados no array", () => {
      const days = [
        makeDay({ id: "d3", slotIndex: 2, slotLabel: "C" }),
        makeDay({ id: "d1", slotIndex: 0, slotLabel: "A" }),
        makeDay({ id: "d2", slotIndex: 1, slotLabel: "B" }),
      ];
      const plan = makePlan(days);
      const result = resolveNextSession(plan, null);
      expect(result.planDay.id).toBe("d1");
    });
  });

  describe("rotação circular — plano de 2 dias", () => {
    const days = [
      makeDay({ id: "push", slotIndex: 0, slotLabel: "Push" }),
      makeDay({ id: "pull", slotIndex: 1, slotLabel: "Pull" }),
    ];
    const plan = makePlan(days);

    it("após Push → retorna Pull", () => {
      const result = resolveNextSession(plan, { planDayId: "push" });
      expect(result.planDay.id).toBe("pull");
    });

    it("após Pull → volta para Push (rotação completa)", () => {
      const result = resolveNextSession(plan, { planDayId: "pull" });
      expect(result.planDay.id).toBe("push");
    });
  });

  describe("rotação circular — plano de 4 dias ABCD", () => {
    const days = [
      makeDay({ id: "d1", slotIndex: 0, slotLabel: "A" }),
      makeDay({ id: "d2", slotIndex: 1, slotLabel: "B" }),
      makeDay({ id: "d3", slotIndex: 2, slotLabel: "C" }),
      makeDay({ id: "d4", slotIndex: 3, slotLabel: "D" }),
    ];
    const plan = makePlan(days);

    it("A → B", () => expect(resolveNextSession(plan, { planDayId: "d1" }).planDay.id).toBe("d2"));
    it("B → C", () => expect(resolveNextSession(plan, { planDayId: "d2" }).planDay.id).toBe("d3"));
    it("C → D", () => expect(resolveNextSession(plan, { planDayId: "d3" }).planDay.id).toBe("d4"));
    it("D → A (reinício do ciclo)", () => expect(resolveNextSession(plan, { planDayId: "d4" }).planDay.id).toBe("d1"));
  });

  describe("planDayId desconhecido / nulo", () => {
    const days = [
      makeDay({ id: "d1", slotIndex: 0, slotLabel: "A" }),
      makeDay({ id: "d2", slotIndex: 1, slotLabel: "B" }),
    ];
    const plan = makePlan(days);

    it("planDayId null → retorna slotIndex 0", () => {
      const result = resolveNextSession(plan, { planDayId: null });
      expect(result.planDay.id).toBe("d1");
    });

    it("planDayId não encontrado no plano → retorna slotIndex 0 como fallback", () => {
      const result = resolveNextSession(plan, { planDayId: "id-inexistente" });
      expect(result.planDay.id).toBe("d1");
    });
  });

  describe("plano vazio", () => {
    it("retorna fallback sem lançar exceção", () => {
      const plan = makePlan([]);
      const result = resolveNextSession(plan, null);
      expect(result.planDay.id).toBe("empty");
      expect(result.slotLabel).toBe("A");
    });
  });

  describe("plano de 1 dia — rotação permanente", () => {
    it("após o único dia → retorna o mesmo dia", () => {
      const day = makeDay({ id: "full-body", slotIndex: 0, slotLabel: "FB" });
      const plan = makePlan([day]);
      const result = resolveNextSession(plan, { planDayId: "full-body" });
      expect(result.planDay.id).toBe("full-body");
    });
  });

  describe("estimatedDate e isToday", () => {
    it("sem targetDaysOfWeek → estimatedDate é hoje → isToday true", () => {
      const day = makeDay({ id: "d1", slotIndex: 0, slotLabel: "A", targetDaysOfWeek: [] });
      const plan = makePlan([day]);
      const result = resolveNextSession(plan, null);
      expect(result.isToday).toBe(true);
    });

    it("retorna slotLabel correto do planDay", () => {
      const days = [
        makeDay({ id: "d1", slotIndex: 0, slotLabel: "Push A" }),
        makeDay({ id: "d2", slotIndex: 1, slotLabel: "Pull A" }),
      ];
      const plan = makePlan(days);
      const result = resolveNextSession(plan, { planDayId: "d1" });
      expect(result.slotLabel).toBe("Pull A");
    });
  });
});
