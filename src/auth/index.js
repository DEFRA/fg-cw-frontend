import { loginCallbackRoute } from "./routes/login-callback.route.js";
import { loginRoute } from "./routes/login.route.js";
import { logoutRoute } from "./routes/logout.route.js";

export const auth = {
  plugin: {
    name: "auth",
    register(server) {
      server.route([loginRoute, loginCallbackRoute, logoutRoute]);
    },
  },
};
