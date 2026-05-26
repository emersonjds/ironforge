export { SessionSchema, SetLogSchema, SessionWithSetsSchema } from "./schema";
export type { Session, SetLog, SessionWithSets } from "./schema";
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
