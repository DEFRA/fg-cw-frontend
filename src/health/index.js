import { getHealthRoute } from "./routes/get-health.route.js";

export const health = {
  plugin: {
    name: "health",
    register(server) {
      server.route(getHealthRoute);
    },
  },
};
