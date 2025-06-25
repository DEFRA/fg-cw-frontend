import process from "node:process";
import { logger } from "./common/logger.js";
import { createServer } from "./server.js";
import { ProxyAgent } from "proxy-agent";
import http from "http";
import https from "https";

http.globalAgent = new ProxyAgent();
https.globalAgent = new ProxyAgent();

process.on("unhandledRejection", (error) => {
  logger.error(error, "Unhandled rejection");
  process.exitCode = 1;
});

const server = await createServer();
await server.start();
