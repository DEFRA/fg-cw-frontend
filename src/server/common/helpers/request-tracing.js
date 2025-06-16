import { tracing } from "@defra/hapi-tracing";
import { config } from "../../../config/config.js";

const tracingHeader = config.get("tracing.header");

export const requestTracing = {
  plugin: tracing.plugin,
  options: {
    tracingHeader,
  },
};
