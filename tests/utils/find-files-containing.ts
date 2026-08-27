import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const REPO_ROOT = join(__dirname, "..", "..");
const SCAN_DIRS = ["src", "app", "tests"];
const SOURCE_EXTENSIONS = [".ts", ".tsx"];

function listSourceFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true })
    .map((entry) => join(dir, entry.toString()))
    .filter((path) => SOURCE_EXTENSIONS.some((extension) => path.endsWith(extension)));
}

export function findFilesContaining(literal: string): string[] {
  return SCAN_DIRS.flatMap((dir) => listSourceFiles(join(REPO_ROOT, dir))).filter((path) =>
    readFileSync(path, "utf-8").includes(literal),
  );
}
