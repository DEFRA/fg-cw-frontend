import { getTraceId } from "@defra/hapi-tracing";
import Wreck from "@hapi/wreck";
import { config } from "./config.js";
import { getClientIp } from "./request-context.js";

export const wreck = Wreck.defaults({
  events: true,
  timeout: 3000,
  baseUrl: config.get("backendUrl"),
  json: true,
});

wreck.events.on("preRequest", (uri) => {
  const traceId = getTraceId();
  const tracingHeader = config.get("tracing.header");

  if (traceId) {
    uri.headers[tracingHeader] = traceId;
  }

  // Replaces, rather than extends, any incoming chain: the backend should
  // only see the client this service has already established.
  const clientIp = getClientIp();

  if (clientIp) {
    uri.headers["x-forwarded-for"] = clientIp;
  }
});
