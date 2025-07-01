import process from "node:process";
import { auth } from "./auth/index.js";
import { cases } from "./cases/index.js";
import { logger } from "./common/logger.js";
import "./common/proxy.js";
import { health } from "./health/index.js";
import { createServer } from "./server.js";

process.on("unhandledRejection", (error) => {
  logger.error(error, "Unhandled rejection");
  process.exitCode = 1;
});

const server = await createServer();
await server.register([health, auth, cases]);
await server.start();
