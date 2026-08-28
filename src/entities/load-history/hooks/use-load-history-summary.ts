import { useQuery } from "@tanstack/react-query";
import { fetchLoadHistorySummary } from "../api";

export function useLoadHistorySummary(weeks = 12) {
  return useQuery({
    queryKey: ["load-history", "summary", weeks],
    queryFn: () => fetchLoadHistorySummary(weeks),
  });
}
