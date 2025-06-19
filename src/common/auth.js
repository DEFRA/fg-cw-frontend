import Bell from "@hapi/bell";
import Cookie from "@hapi/cookie";
import { config } from "./config.js";

export const auth = {
  plugin: {
    name: "auth",
    async register(server) {
      if (!config.get("auth.enabled")) {
        server.logger.warn("Authentication is disabled");
        return;
      }
      await server.register([Cookie, Bell]);

      // server.state('redirectTo', {
      //   ttl: 360,
      //   isSecure: true,
      //   isHttpOnly: true,
      //   clearInvalid: true,
      //   strictHeader: true
      // });

      // server.ext('onPreAuth', (request, h) => {
      //   console.log("pre auth")
      //   console.log(request.route.path)
      //   console.log(request.auth.isAuthenticated)
      //   return h.continue;
      // })

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
        redirectTo: "/login",
        validate: async (_request, session) => {
          if (!session || !session.profile) {
            return { isValid: false };
          }

          return { isValid: true, credentials: session };
        },
      });

      server.auth.strategy("ms", "bell", {
        provider: "azure",
        password: config.get("session.cookie.password"),
        clientId: config.get("auth.msEntraId.clientId"),
        clientSecret: config.get("auth.msEntraId.clientSecret"),
        scope: ["openid", "profile", "email", "offline_access", "User.Read"],
        config: {
          tenant: config.get("auth.msEntraId.tenantId"),
        },
        location() {
          return config.get("auth.redirectUrl");
        },
        isSecure: config.get("isProduction"),
      });

      // Logout
      server.route({
        method: "GET",
        path: "/logout",
        options: { auth: false },
        handler: (request, h) => {
          request.cookieAuth.clear();
          return h.redirect("/cases");
        },
      });

      // Login - uses ms entra strategy
      server.route({
        method: "GET",
        path: "/login",
        options: {
          auth: {
            mode: "try",
            strategy: "ms",
          },
        },
        handler: () => {
          /**
           *  The app never get's here...
           *  This is a vanity url to direct user to login.
           *  Default behaviour is to redirect to MS login.
           *  On authentication the user is redirected to /login/callback
           **/
        },
      });

      // callback for login
      server.route({
        method: ["GET", "POST"],
        path: "/login/callback",
        options: {
          auth: {
            mode: "try",
            strategy: "ms",
          },
          handler: function (request, h) {
            if (!request.auth.isAuthenticated) {
              return `Authentication failed due to: ${request.auth.error.message}`;
            }

            request.cookieAuth.set({
              profile: request.auth.credentials.profile,
              token: request.auth.credentials.token,
            });

            return h.redirect("/secret");

            // Perform any account lookup or registration, setup local session,
            // and redirect to the application. The third-party credentials are
            // stored in request.auth.credentials. Any query parameters from
            // the initial request are passed back via request.auth.credentials.query.
          },
        },
      });
    },
  },
};
