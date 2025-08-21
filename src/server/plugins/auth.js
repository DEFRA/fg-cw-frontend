import Bell from "@hapi/bell";
import Jwt from "@hapi/jwt";
import { config } from "../../common/config.js";

export const auth = {
  plugin: {
    name: "entra",
    async register(server) {
      await server.register(Bell);

      const session = config.get("session");

      server.auth.strategy("entra", "bell", {
        provider: {
          name: "entra",
          protocol: "oauth2",
          useParamsAuth: true,
          auth: config.get("oidc.authEndpoint"),
          token: config.get("oidc.tokenEndpoint"),
          scope: [
            "openid",
            "profile",
            "email",
            "offline_access",
            `api://${config.get("oidc.clientId")}/cw.backend`,
          ],
          async profile(credentials) {
            const { payload } = Jwt.token.decode(credentials.token).decoded;

            credentials.profile = {
              oid: payload.oid,
              name: payload.name,
              email: payload.email,
              roles: payload.roles || [],
            };
          },
        },
        password: session.cookie.password,
        clientId: config.get("oidc.clientId"),
        clientSecret: config.get("oidc.clientSecret"),
        isSecure: config.get("isProduction"),
        forceHttps: config.get("isProduction"),
        location(request) {
          const protocol = config.get("isProduction") ? "https" : "http";
          return `${protocol}://${request.info.host}/login/callback`;
        },
      });

      server.auth.scheme("yar", () => ({
        authenticate: async (request, h) => {
          const credentials = request.yar.get("credentials");

          if (credentials?.expiresAt > Date.now()) {
            return h.authenticated({ credentials });
          }

          const url = `/login?${new URLSearchParams({
            next: request.url.href,
          })}`;

          return h.redirect(url).takeover();
        },
      }));

      server.auth.strategy("session", "yar");
    },
  },
};
