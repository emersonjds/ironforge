export function formatWeight(kg: number, unit: "kg" | "lb" = "kg"): string {
  if (unit === "lb") {
    const lb = kg * 2.20462;
    return `${lb.toFixed(lb % 1 === 0 ? 0 : 1)} lb`;
  }
  return `${kg.toFixed(kg % 1 === 0 ? 0 : 1)} kg`;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function formatSetLine(weight: number, reps: number, unit: "kg" | "lb" = "kg"): string {
  return `${formatWeight(weight, unit)} × ${reps}`;
}

export function formatCurrencyBRL(cents: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
    .format(cents / 100)
    .replace(/ /g, " ");
}
