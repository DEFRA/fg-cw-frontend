import { pino } from "pino";

import { loggerOptions } from "./logger-options.js";

const logger = pino(loggerOptions);

export const createLogger = () => logger;
