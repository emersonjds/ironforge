import { formatBRL } from "@shared/mocks/coach-finance.mock";

describe("formatBRL", () => {
  it("formata milhares com ponto e centavos com vírgula", () => {
    expect(formatBRL(1234500)).toBe("R$ 12.345,00");
  });

  it("formata valores abaixo de mil sem separador de milhar", () => {
    expect(formatBRL(100)).toBe("R$ 1,00");
  });

  it("formata centavos menores que 1 real preservando duas casas", () => {
    expect(formatBRL(5)).toBe("R$ 0,05");
  });

  it("formata zero", () => {
    expect(formatBRL(0)).toBe("R$ 0,00");
  });

  it("formata valores negativos (ex.: estorno)", () => {
    expect(formatBRL(-500)).toBe("R$ -5,00");
  });
});
