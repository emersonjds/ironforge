import { epley1RM, brzycki1RM, estimated1RM, bestE1RM } from "@entities/session/lib/e1rm";

describe("e1rm", () => {
  describe("epley1RM", () => {
    it("retorna o peso quando reps = 1", () => {
      expect(epley1RM(100, 1)).toBe(100);
    });

    it("calcula corretamente para múltiplas reps", () => {
      // 100kg × (1 + 5/30) = 116.66...
      expect(epley1RM(100, 5)).toBeCloseTo(116.67, 1);
    });

    it("retorna 0 para peso <= 0", () => {
      expect(epley1RM(0, 5)).toBe(0);
      expect(epley1RM(-10, 5)).toBe(0);
    });

    it("retorna 0 para reps <= 0", () => {
      expect(epley1RM(100, 0)).toBe(0);
    });
  });

  describe("brzycki1RM", () => {
    it("retorna o peso quando reps = 1", () => {
      expect(brzycki1RM(100, 1)).toBe(100);
    });

    it("retorna 0 para reps >= 37", () => {
      expect(brzycki1RM(100, 37)).toBe(0);
    });

    it("calcula corretamente para 5 reps", () => {
      // (100 × 36) / (37 - 5) = 3600 / 32 = 112.5
      expect(brzycki1RM(100, 5)).toBeCloseTo(112.5, 1);
    });
  });

  describe("estimated1RM", () => {
    it("usa epley por padrão", () => {
      expect(estimated1RM(100, 5)).toBe(epley1RM(100, 5));
    });

    it("usa brzycki quando especificado", () => {
      expect(estimated1RM(100, 5, "brzycki")).toBe(brzycki1RM(100, 5));
    });
  });

  describe("bestE1RM", () => {
    it("retorna 0 para lista vazia", () => {
      expect(bestE1RM([])).toBe(0);
    });

    it("retorna o maior e1RM entre os sets", () => {
      const sets = [
        { weight: 100, reps: 5 },
        { weight: 80, reps: 10 },
        { weight: 90, reps: 3 },
      ];
      const best = bestE1RM(sets);
      const expected = Math.max(
        epley1RM(100, 5),
        epley1RM(80, 10),
        epley1RM(90, 3),
      );
      expect(best).toBeCloseTo(expected, 5);
    });
  });
});
