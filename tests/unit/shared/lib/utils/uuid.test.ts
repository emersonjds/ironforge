import { randomUuidV4 } from "@shared/lib/utils/uuid";

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe("randomUuidV4", () => {
  it("gera um uuid v4 válido, formato exigido pela api (z.uuid())", () => {
    expect(randomUuidV4()).toMatch(UUID_V4_REGEX);
  });

  it("não repete entre chamadas", () => {
    const ids = new Set(Array.from({ length: 50 }, () => randomUuidV4()));
    expect(ids.size).toBe(50);
  });
});
