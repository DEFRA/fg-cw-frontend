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

  // The backend audits the user's own IP, not this service's.
  const clientIp = getClientIp();

  if (clientIp) {
    uri.headers["x-forwarded-for"] = clientIp;
  }
});
