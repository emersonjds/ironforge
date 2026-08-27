import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchSessions } from "../api";

const PAGE_SIZE = 10;

export function useSessionsInfinite() {
  return useInfiniteQuery({
    queryKey: ["sessions", "infinite"],
    queryFn: ({ pageParam }) => fetchSessions({ limit: PAGE_SIZE, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.offset + lastPage.items.length;
      return loaded < lastPage.total ? loaded : undefined;
    },
  });
}
