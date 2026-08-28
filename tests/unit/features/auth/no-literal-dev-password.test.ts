import { randomUUID } from "node:crypto";
import { rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { findFilesContaining } from "../../../utils/find-files-containing";

describe("varredura de segredo literal", () => {
  it("encontra um valor gerado em runtime dentro de src/, app/ ou tests/", () => {
    const canary = randomUUID();
    const canaryFile = join(__dirname, `.literal-scan-canary-${canary}.ts`);
    writeFileSync(canaryFile, `export const canary = "${canary}";\n`);

    try {
      expect(findFilesContaining(canary)).toEqual([canaryFile]);
    } finally {
      rmSync(canaryFile);
    }
  });
});
