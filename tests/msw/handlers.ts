import { authHandlers } from "./auth-handlers";
import { sessionHandlers } from "./session-handlers";
import { loadHistoryHandlers } from "./load-history-handlers";
import { athleteHandlers } from "./athlete-handlers";

export const handlers = [...authHandlers, ...sessionHandlers, ...loadHistoryHandlers, ...athleteHandlers];
