import { useEffect } from "react";
import type { PlanExercise } from "@entities/plan";
import type { MovementPattern } from "@/types/enums";
import { suggestNextSet, weightIncrement } from "../lib/progression";
import type { ProgressionSuggestion } from "../lib/progression";
import { useLoadHistoryStore } from "../store";

export interface SetSuggestionWithNote extends ProgressionSuggestion {
  note: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function roundToHalf(n: number): number {
  return Math.round(n * 2) / 2;
}

function daysSince(isoDate: string): number {
  return (Date.now() - new Date(isoDate).getTime()) / DAY_MS;
}

function stalenessMultiplier(days: number): number | null {
  if (days < 21) return null;
  if (days < 28) return 0.9;
  if (days < 42) return 0.85;
  return 0.8;
}

interface Options {
  athleteId: string;
  exerciseId: string;
  planExercise: PlanExercise;
  movementPattern: MovementPattern;
}

export function useSuggestNextSet({
  athleteId,
  exerciseId,
  planExercise,
  movementPattern,
}: Options): SetSuggestionWithNote | null {
  const hydrateForExercise = useLoadHistoryStore((s) => s.hydrateForExercise);
  const getEntriesFor = useLoadHistoryStore((s) => s.getEntriesFor);
  const entries = useLoadHistoryStore((s) => s.entries[`${athleteId}:${exerciseId}`]);

  useEffect(() => {
    hydrateForExercise(athleteId, exerciseId);
  }, [athleteId, exerciseId, hydrateForExercise]);

  if (entries === undefined) return null; // hydrating

  const validEntries = getEntriesFor(athleteId, exerciseId)
    .filter((e) => e.setType === "working")
    .sort((a, b) => b.performedAt.localeCompare(a.performedAt));

  if (!validEntries.length) {
    return {
      weight: 0,
      reps: planExercise.repRangeMin,
      reason: "first_time",
      note: "Primeira vez",
    };
  }

  const last = validEntries[0]!;
  const ageDays = daysSince(last.performedAt);
  const mult = stalenessMultiplier(ageDays);

  if (mult !== null) {
    const reduced = roundToHalf(last.weight * mult);
    const label =
      ageDays < 28 ? "Retorno (leve redução)" :
      ageDays < 42 ? "Retorno (redução moderada)" :
      "Retorno após pausa longa";
    return {
      weight: reduced,
      reps: planExercise.repRangeMin,
      reason: "hold",
      note: label,
    };
  }

  // Check RIR-based anticipation
  if (
    last.rir !== null &&
    last.rir < planExercise.targetRir &&
    last.reps >= planExercise.repRangeMax
  ) {
    const newWeight = roundToHalf(last.weight + weightIncrement(movementPattern));
    return {
      weight: newWeight,
      reps: planExercise.repRangeMin,
      reason: "increase_weight",
      note: `→ Aumentar: ${newWeight}kg × ${planExercise.repRangeMin}`,
    };
  }

  const lastSets = validEntries.slice(0, 4).map((e) => ({
    weight: e.weight,
    reps: e.reps,
    rir: e.rir,
  }));

  const suggestion = suggestNextSet({
    lastSets,
    repRangeMin: planExercise.repRangeMin,
    repRangeMax: planExercise.repRangeMax,
    targetRir: planExercise.targetRir,
    pattern: movementPattern,
  });

  const lastDisplay = `Última: ${last.weight}kg × ${last.reps}`;
  let noteText = lastDisplay;
  if (suggestion.reason === "increase_weight") {
    noteText = `→ Aumentar: ${suggestion.weight}kg × ${suggestion.reps}`;
  } else if (suggestion.reason === "increase_reps") {
    noteText = `→ Mais reps: ${suggestion.weight}kg × ${suggestion.reps}`;
  } else if (suggestion.reason === "hold") {
    noteText = `→ Manter: ${suggestion.weight}kg × ${suggestion.reps}`;
  }

  return { ...suggestion, note: noteText };
}
