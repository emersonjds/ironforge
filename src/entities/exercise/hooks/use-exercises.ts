import { useQuery } from "@tanstack/react-query";
import { fetchExercises } from "../api";

export function useExercises() {
  return useQuery({
    queryKey: ["exercises"],
    queryFn: () => fetchExercises(),
  });
}
