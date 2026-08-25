import type { ExerciseDemo } from "../schema";

export type DemoSectionState = "loading" | "empty" | "error" | "ready";

export function resolveDemoState(input: {
  demos: ExerciseDemo[] | undefined;
  isLoading: boolean;
  isError: boolean;
}): DemoSectionState {
  if (input.isLoading && !input.demos) return "loading";
  if (!input.demos || input.demos.length === 0) return input.isError ? "error" : "empty";
  return "ready";
}
