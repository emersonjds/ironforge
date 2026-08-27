import { useQuery } from "@tanstack/react-query";
import { fetchMeasurements } from "../api";

export function useMeasurements() {
  return useQuery({
    queryKey: ["athlete", "measurements"],
    queryFn: fetchMeasurements,
  });
}
