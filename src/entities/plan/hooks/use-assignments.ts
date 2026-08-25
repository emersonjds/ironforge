import { useQuery } from "@tanstack/react-query";
import { fetchAssignments } from "../api";

export function useAssignments() {
  return useQuery({
    queryKey: ["assignments"],
    queryFn: fetchAssignments,
  });
}
