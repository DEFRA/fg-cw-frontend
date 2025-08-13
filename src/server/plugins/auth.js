import Bell from "@hapi/bell";
import Jwt from "@hapi/jwt";
import { config } from "../../common/config.js";

export const auth = {
  plugin: {
    name: "entra",
    async register(server) {
      await server.register(Bell);

      const entra = config.get("entra");
      const session = config.get("session");

      server.auth.strategy("entra", "bell", {
        provider: {
          name: "entra",
          protocol: "oauth2",
          useParamsAuth: true,
          auth: `https://login.microsoftonline.com/${entra.tenantId}/oauth2/v2.0/authorize`,
          token: `https://login.microsoftonline.com/${entra.tenantId}/oauth2/v2.0/token`,
          scope: [
            "openid",
            "profile",
            "email",
            "offline_access",
            `api://${entra.clientId}/cw.backend`,
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
        clientId: entra.clientId,
        clientSecret: entra.clientSecret,
        config: {
          tenant: entra.tenantId,
        },
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
