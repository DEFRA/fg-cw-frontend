import Bell from "@hapi/bell";
import Cookie from "@hapi/cookie";
import { config } from "./config.js";

export const validateSession = (_request, session) => {
  if (!session || !session.authenticated) {
    return { isValid: false };
  }

  return { isValid: true, credentials: session };
};

export const auth = {
  plugin: {
    name: "auth",
    once: true,
    async register(server) {
      await server.register([Bell, Cookie]);

      server.auth.strategy("session", "cookie", {
        cookie: {
          name: "session-auth",
          password: config.get("session.cookie.password"),
          ttl: config.get("session.cookie.ttl"),
          path: "/",
          isSecure: config.get("session.cookie.secure"),
          isSameSite: "Strict",
        },
        keepAlive: true,
        appendNext: true,
        redirectTo: "/login/callback",
        validate: validateSession,
      });

      server.auth.strategy("msEntraId", "bell", {
        provider: "azure",
        password: config.get("session.cookie.password"),
        clientId: config.get("auth.msEntraId.clientId"),
        clientSecret: config.get("auth.msEntraId.clientSecret"),
        scope: ["openid", "profile", "email", "offline_access", "user.read"],
        config: {
          tenant: config.get("auth.msEntraId.tenantId"),
        },
        location(request) {
          const protocol = config.get("isProduction") ? "https" : "http";
          const location = `${protocol}://${request.info.host}/login/callback`;
          return location;
        },
        isSecure: config.get("isProduction"),
        forceHttps: config.get("isProduction"),
      });

      server.route({
        method: "GET",
        path: "/logout",
        options: { auth: false },
        handler: (request, h) => {
          request.cookieAuth.clear();
          return h.redirect("/");
        },
      });
    },
  },
};
