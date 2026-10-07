import { loginCallbackRoute } from "./login-callback.route.js";
import { loginRoute } from "./login.route.js";
import { logoutRoute } from "./logout.route.js";
import { oidc } from "./oidc.js";
import {
  redirectCookieName,
  redirectCookieOptions,
} from "./redirect-cookie.js";
import { sessionScheme } from "./session-scheme.js";

/**
 * Everything this app does about authentication: the OIDC handshake with Entra
 * ID, the `session` strategy that route protection is declared against, and the
 * routes a user signs in and out through.
 */
export const auth = {
  plugin: {
    name: "entra",
    async register(server) {
      await server.register(oidc);

      server.state(redirectCookieName, redirectCookieOptions);

      server.auth.scheme("yar", sessionScheme);
      server.auth.strategy("session", "yar");

      // Every route is authenticated unless it opts out with `auth: false`.
      server.auth.default("session");

      server.route([loginRoute, loginCallbackRoute, logoutRoute]);
    },
  },
};
