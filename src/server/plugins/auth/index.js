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
 * ID, the cookie remembering where a signed out user was heading, the
 * `session` strategy route protection is declared against, and the routes a
 * user signs in and out through.
 */
export const auth = {
  plugin: {
    name: "auth",
    async register(server) {
      await server.register(oidc);

      server.state(redirectCookieName, redirectCookieOptions);

      server.auth.scheme("oidc-session", sessionScheme);
      server.auth.strategy("session", "oidc-session");

      // Every route is authenticated unless it opts out with `auth: false`.
      server.auth.default("session");

      server.route([loginRoute, loginCallbackRoute, logoutRoute]);
    },
  },
};
