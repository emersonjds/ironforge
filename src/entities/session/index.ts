export { SessionSchema, SetLogSchema, SessionWithSetsSchema } from "./schema";
export type { Session, SetLog, SessionWithSets } from "./schema";
export {
  toApiSetIndex,
  fromApiSetIndex,
  mapApiSessionToLocal,
  mapApiSetToLocal,
  startSessionRequest,
  finishSessionRequest,
  logSetRequest,
  updateSetRequest,
  deleteSetRequest,
  fetchResumableSession,
  fetchSessions,
} from "./api";
export type {
  ApiSession,
  ApiSetLog,
  ApiSessionDetail,
  StartSessionInput,
  FinishSessionInput,
  UpdateSetInput,
  FetchSessionsParams,
  SessionsPage,
} from "./api";
export { useSessionsInfinite } from "./hooks/use-sessions-infinite";
export { useSessionsCount } from "./hooks/use-sessions-count";
export { useConsistencySessions } from "./hooks/use-consistency-sessions";
export { weeksRangeEndingNow } from "./lib/weeks-range";
export type { WeeksRange } from "./lib/weeks-range";
export { epley1RM, brzycki1RM, estimated1RM, bestE1RM } from "./lib/e1rm";
export type { E1RMFormula } from "./lib/e1rm";
export { detectPRs } from "./lib/pr-detection";
export type { PRResult, PRType, SetSnapshot } from "./lib/pr-detection";
export {
  sessionTotalVolume,
  sessionDurationSeconds,
  sessionTopSetPerExercise,
  deltaVsPrevious,
} from "./lib/session-stats";
export type { ExerciseDelta, SessionSummary } from "./lib/session-stats";
export { buildConsistencyGrid } from "./lib/consistency-grid";
export type { ConsistencyLevel } from "./lib/consistency-grid";
