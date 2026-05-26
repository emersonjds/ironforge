/**
 * Shim de compatibilidade — a lógica canônica vive em entities/session/lib/session-stats.ts.
 * As telas que usam `planExerciseId` como chave ainda passam por aqui enquanto
 * aguardam migração completa na Fase B.
 */
import {
  sessionTotalVolume as _sessionTotalVolume,
  sessionDurationSeconds as _sessionDurationSeconds,
  sessionTopSetPerExercise as _sessionTopSetPerExercise,
  deltaVsPrevious as _deltaVsPrevious,
} from "@entities/session/lib/session-stats";
import type { SetLog } from "@/types/domain";

export type { ExerciseDelta, SessionSummary } from "@entities/session/lib/session-stats";

export interface LegacySession {
  id: string;
  startedAt: string;
  endedAt: string | null;
  sets: SetLog[];
  planDayId: string | null;
  athleteId: string;
  assignedPlanId: string | null;
  bodyweightKg: number | null;
  perceivedFatigue: number | null;
  notes: string | null;
  syncedAt: string | null;
}

export function sessionTotalVolume(session: LegacySession): number {
  return _sessionTotalVolume(session.sets);
}

export function sessionDurationSeconds(session: LegacySession): number {
  return _sessionDurationSeconds(session.startedAt, session.endedAt);
}

export function sessionTopSetPerExercise(session: LegacySession): Map<string, SetLog> {
  return _sessionTopSetPerExercise(session.sets);
}

export function deltaVsPrevious(opts: {
  currentSets: readonly SetLog[];
  previousSets: readonly { weight: number; reps: number }[];
  planExerciseId: string;
}) {
  return _deltaVsPrevious({
    currentSets: opts.currentSets,
    previousSets: opts.previousSets,
    exerciseId: opts.planExerciseId,
  });
}
