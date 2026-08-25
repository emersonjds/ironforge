import { parseInstructions } from "@entities/exercise/lib/parse-instructions";

describe("parseInstructions", () => {
  it("retorna vazio para null", () => {
    expect(parseInstructions(null)).toEqual({ steps: [], warning: null });
  });

  it("retorna vazio para string vazia", () => {
    expect(parseInstructions("")).toEqual({ steps: [], warning: null });
  });

  it("ignora linhas em branco", () => {
    const raw = "Passo um.\n\n   \nPasso dois.";
    expect(parseInstructions(raw)).toEqual({ steps: ["Passo um.", "Passo dois."], warning: null });
  });

  it("3 linhas sem alerta viram 3 passos, sem warning", () => {
    const raw = "Sente-se no banco.\nSegure a barra.\nEmpurre para cima.";
    const result = parseInstructions(raw);
    expect(result.warning).toBeNull();
    expect(result.steps).toEqual(["Sente-se no banco.", "Segure a barra.", "Empurre para cima."]);
  });

  it("linha 'Erro comum:' no meio de 5 linhas sai dos passos e vira warning", () => {
    const raw = [
      "Ajuste o banco.",
      "Segure a barra na largura dos ombros.",
      "Erro comum: não jogue o tronco para trás.",
      "Desça controlado até o peito.",
      "Empurre até estender os cotovelos.",
    ].join("\n");
    const result = parseInstructions(raw);
    expect(result.warning).toBe("não jogue o tronco para trás.");
    expect(result.steps).toEqual([
      "Ajuste o banco.",
      "Segure a barra na largura dos ombros.",
      "Desça controlado até o peito.",
      "Empurre até estender os cotovelos.",
    ]);
  });

  it("aceita o prefixo 'Atenção:' (case-insensitive) como alerta", () => {
    const raw = "Passo um.\nATENÇÃO: cuidado com o ombro.\nPasso dois.";
    const result = parseInstructions(raw);
    expect(result.warning).toBe("cuidado com o ombro.");
    expect(result.steps).toEqual(["Passo um.", "Passo dois."]);
  });

  it("remove numeração própria que o backend mande por engano", () => {
    const raw = "1. Primeiro passo.\n2) Segundo passo.\n- Terceiro passo.";
    const result = parseInstructions(raw);
    expect(result.steps).toEqual(["Primeiro passo.", "Segundo passo.", "Terceiro passo."]);
  });

  it("sem prefixo de alerta, nenhuma linha vira warning", () => {
    const raw = "Passo um.\nPasso dois sem prefixo de alerta.";
    const result = parseInstructions(raw);
    expect(result.warning).toBeNull();
    expect(result.steps).toHaveLength(2);
  });
});
