import https from "node:https";
import { bootstrap } from "global-agent";
import { config } from "./config.js";

bootstrap();
global.GLOBAL_AGENT.HTTP_PROXY = config.get("httpProxy");

// global-agent 4.1.3 requires secureEndpoint to preserve TLS options and SNI,
// but Node HTTPS requests do not supply it on this path (upstream issue #83).
const addHttpsRequest = https.globalAgent.addRequest.bind(https.globalAgent);
https.globalAgent.addRequest = (request, options) =>
  addHttpsRequest(request, { ...options, secureEndpoint: true });
