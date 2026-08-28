import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchSessions } from "../api";
import { weeksRangeEndingNow } from "../lib/weeks-range";

const CONSISTENCY_WEEKS = 26;

export function useConsistencySessions() {
  const { from, to } = useMemo(() => weeksRangeEndingNow(CONSISTENCY_WEEKS), []);

  return useQuery({
    queryKey: ["sessions", "consistency", from, to],
    queryFn: async () => {
      const page = await fetchSessions({ from, to, limit: 200 });
      return page.items;
    },
  });
}
