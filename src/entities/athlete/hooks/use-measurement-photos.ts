import { useQuery } from "@tanstack/react-query";
import { fetchMeasurementPhotos } from "../api";

/**
 * Sem cache: a URL assinada expira em 5 minutos, então um resultado guardado já
 * nasce quebrado — e é foto de corpo, que não deve ficar parada em memória.
 */
export function useMeasurementPhotos(measurementId: string | null) {
  return useQuery({
    queryKey: ["athlete", "measurement-photos", measurementId],
    queryFn: () => fetchMeasurementPhotos(measurementId!),
    enabled: measurementId !== null,
    gcTime: 0,
    staleTime: 0,
  });
}
