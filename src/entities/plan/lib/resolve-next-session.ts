import type { AssignedPlan, PlanDay } from "../schema";

export interface ResolvedSession {
  planDay: PlanDay;
  slotLabel: string;
  estimatedDate: Date;
  isToday: boolean;
}

export function resolveNextSession(
  plan: AssignedPlan,
  lastSession: { planDayId: string | null } | null,
): ResolvedSession {
  const days = [...plan.days].sort((a, b) => a.slotIndex - b.slotIndex);
  if (!days.length) {
    // Fallback: plano vazio não deveria ocorrer; retorna dia fictício
    const fallback: PlanDay = {
      id: "empty",
      slotLabel: "A",
      slotIndex: 0,
      name: "Treino",
      targetDaysOfWeek: [],
      exercises: [],
    };
    return { planDay: fallback, slotLabel: "A", estimatedDate: new Date(), isToday: true };
  }

  let nextIndex = 0;
  if (lastSession?.planDayId) {
    const lastDay = days.find((d) => d.id === lastSession.planDayId);
    if (lastDay !== undefined) {
      nextIndex = (lastDay.slotIndex + 1) % days.length;
    }
  }

  const planDay = days[nextIndex] ?? days[0]!;
  const estimatedDate = estimateDate(planDay.targetDaysOfWeek);
  const today = new Date();
  const isToday =
    estimatedDate.getFullYear() === today.getFullYear() &&
    estimatedDate.getMonth() === today.getMonth() &&
    estimatedDate.getDate() === today.getDate();

  return { planDay, slotLabel: planDay.slotLabel, estimatedDate, isToday };
}

function estimateDate(targetDaysOfWeek: number[]): Date {
  const today = new Date();
  if (!targetDaysOfWeek.length) return today;

  const todayDow = today.getDay(); // 0=Sun
  // Find soonest day of week >= today (or wrap around)
  const sorted = [...targetDaysOfWeek].sort((a, b) => a - b);
  const sameOrLater = sorted.find((d) => d >= todayDow);
  const target = sameOrLater ?? sorted[0]!;
  let daysAhead = target - todayDow;
  if (daysAhead < 0) daysAhead += 7;

  const date = new Date(today);
  date.setDate(today.getDate() + daysAhead);
  return date;
}
