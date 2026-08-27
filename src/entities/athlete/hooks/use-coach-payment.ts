import { useQuery } from "@tanstack/react-query";
import { fetchCoachPayment } from "../api";

export function useCoachPayment() {
  return useQuery({
    queryKey: ["athlete", "coach-payment"],
    queryFn: fetchCoachPayment,
  });
}
