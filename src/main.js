import process from "node:process";
import { logger } from "./common/logger.js";
import "./common/proxy.js";
import { createServer } from "./server.js";

process.on("unhandledRejection", (error) => {
  logger.error(error, "Unhandled rejection");
  process.exitCode = 1;
});

const server = await createServer();
await server.start();
