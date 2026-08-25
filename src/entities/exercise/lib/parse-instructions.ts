const WARNING_PREFIX = /^(erro comum|atenção)\s*:\s*/i;
const NUMBERING_PREFIX = /^(\d+[.)]|-)\s+/;

export interface InstructionBlocks {
  steps: string[];
  warning: string | null;
}

export function parseInstructions(raw: string | null): InstructionBlocks {
  if (!raw) return { steps: [], warning: null };

  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const steps: string[] = [];
  let warning: string | null = null;

  for (const line of lines) {
    const warningMatch = line.match(WARNING_PREFIX);
    if (warningMatch && warning === null) {
      warning = line.slice(warningMatch[0].length).trim();
      continue;
    }
    steps.push(line.replace(NUMBERING_PREFIX, ""));
  }

  return { steps, warning };
}
