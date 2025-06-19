import { getSecretRoute } from "./routes/get-secret.route.js";

export const secret = {
  plugin: {
    name: "secret",
    register(server) {
      server.route(getSecretRoute);
    },
  },
};
