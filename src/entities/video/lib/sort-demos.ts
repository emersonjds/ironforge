import type { ExerciseDemo } from "../schema";

export function sortDemos(demos: ExerciseDemo[]): ExerciseDemo[] {
  return [...demos].sort((a, b) => {
    if (a.ownedByCoach !== b.ownedByCoach) return a.ownedByCoach ? -1 : 1;
    if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
    return 0;
  });
}
