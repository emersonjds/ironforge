import { useQuery } from "@tanstack/react-query";
import { fetchPersonalRecords } from "../api";

export function usePersonalRecords() {
  return useQuery({
    queryKey: ["load-history", "personal-records"],
    queryFn: fetchPersonalRecords,
  });
}
