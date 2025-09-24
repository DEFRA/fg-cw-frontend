import { tracing as defraTracing } from "@defra/hapi-tracing";
import { config } from "../../common/config.js";

export const tracing = {
  plugin: defraTracing.plugin,
  options: {
    tracingHeader: config.get("tracing.header"),
  },
};
