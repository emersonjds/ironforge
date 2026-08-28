import { useQuery } from "@tanstack/react-query";
import { fetchSessions } from "../api";

export function useSessionsCount() {
  return useQuery({
    queryKey: ["sessions", "count"],
    queryFn: async () => (await fetchSessions({ limit: 1 })).total,
  });
}
