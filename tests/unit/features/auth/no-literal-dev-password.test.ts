import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const SRC_DIR = join(__dirname, "..", "..", "..", "..", "src");
const DEV_PASSWORD = "demo-ironforge-2026";

function listSourceFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true })
    .map((entry) => join(dir, entry.toString()))
    .filter((path) => path.endsWith(".ts") || path.endsWith(".tsx"));
}

describe("dev account password", () => {
  it("não aparece como literal em nenhum arquivo de src/", () => {
    const offenders = listSourceFiles(SRC_DIR).filter((path) =>
      readFileSync(path, "utf-8").includes(DEV_PASSWORD),
    );

    expect(offenders).toEqual([]);
  });
});
