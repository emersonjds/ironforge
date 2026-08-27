import { formatCurrencyBRL } from "@lib/utils/format";

describe("formatCurrencyBRL", () => {
  it("formata centavos como reais no padrão pt-BR", () => {
    expect(formatCurrencyBRL(25000)).toBe("R$ 250,00");
  });

  it("formata valores quebrados corretamente", () => {
    expect(formatCurrencyBRL(1990)).toBe("R$ 19,90");
  });

  it("zero: formata como R$ 0,00", () => {
    expect(formatCurrencyBRL(0)).toBe("R$ 0,00");
  });
});
