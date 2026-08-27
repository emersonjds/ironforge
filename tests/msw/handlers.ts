import { authHandlers } from "./auth-handlers";
import { sessionHandlers } from "./session-handlers";

export const handlers = [...authHandlers, ...sessionHandlers];
