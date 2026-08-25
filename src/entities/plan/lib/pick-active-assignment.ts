import type { AssignedPlan } from "../schema";

export function pickActiveAssignment(assignments: AssignedPlan[]): AssignedPlan | null {
  return assignments.find((a) => a.status === "active") ?? assignments[0] ?? null;
}
