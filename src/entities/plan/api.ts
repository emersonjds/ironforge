import { z } from "zod";
import { apiRequest } from "@shared/lib/api/client";
import { AssignedPlanSchema } from "./schema";

const AssignmentsResponseSchema = z.object({
  items: z.array(AssignedPlanSchema),
  total: z.number(),
});

export async function fetchAssignments() {
  const raw = await apiRequest<unknown>("/assignments?limit=200");
  return AssignmentsResponseSchema.parse(raw).items;
}
