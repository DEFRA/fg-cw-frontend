import { getTraceId } from "@defra/hapi-tracing";
import Wreck from "@hapi/wreck";
import { config } from "./config.js";

export const wreck = Wreck.defaults({
  events: true,
  timeout: 3000,
  baseUrl: config.get("fg_cw_backend_url"),
  json: true,
});

wreck.events.on("preRequest", (uri) => {
  const traceId = getTraceId();
  const tracingHeader = config.get("tracing.header");

  if (traceId) {
    uri.headers[tracingHeader] = traceId;
  }
});
