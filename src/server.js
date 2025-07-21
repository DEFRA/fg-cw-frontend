import { tracing } from "@defra/hapi-tracing";
import Bell from "@hapi/bell";
import { Engine as CatboxMemory } from "@hapi/catbox-memory";
import { Engine as CatboxRedis } from "@hapi/catbox-redis";
import hapi from "@hapi/hapi";
import Inert from "@hapi/inert";
import yar from "@hapi/yar";
import hapiPino from "hapi-pino";
import hapiPulse from "hapi-pulse";
import { config } from "./common/config.js";
import { logger } from "./common/logger.js";
import { nunjucks } from "./common/nunjucks/nunjucks.js";
import { redisClient } from "./common/redis-client.js";

export const createServer = async () => {
  const server = hapi.server({
    host: config.get("host"),
    port: config.get("port"),
    routes: {
      validate: {
        options: {
          abortEarly: false,
        },
        failAction: (_request, _h, error) => {
          logger.warn(error, error?.message);
          throw error;
        },
      },
      security: {
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: false,
        },
        xss: "enabled",
        noSniff: true,
        xframe: true,
      },
    },
    router: {
      stripTrailingSlash: true,
    },
    cache: [
      {
        name: config.get("session.cache.name"),
        engine:
          config.get("session.cache.engine") === "redis"
            ? new CatboxRedis({
                client: redisClient,
              })
            : new CatboxMemory(),
      },
    ],
  });

  await server.register([
    {
      plugin: hapiPino,
      options: {
        ignorePaths: ["/health"],
        instance: logger,
      },
    },
    {
      plugin: tracing.plugin,
      options: {
        tracingHeader: config.get("tracing.header"),
      },
    },
    {
      plugin: hapiPulse,
      options: {
        logger,
        timeout: 10_000,
      },
    },
    Inert,
    nunjucks,
  ]);

  // ---------------- Session ----------------

  await server.register({
    plugin: yar,
    options: {
      name: config.get("session.cache.name"),
      cache: {
        cache: config.get("session.cache.name"),
        expiresIn: config.get("session.cache.ttl"),
      },
      maxCookieSize: 0, // store all session data in redis
      storeBlank: false,
      errorOnCacheNotReady: true,
      cookieOptions: {
        password: config.get("session.cookie.password"),
        ttl: config.get("session.cookie.ttl"),
        isSecure: config.get("session.cookie.secure"),
        clearInvalid: true,
        isSameSite: "Strict",
      },
    },
  });

  // ---------------- Authentication ----------------

  await server.register(Bell);

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
      return `${protocol}://${request.info.host}/login/callback`;
    },
    isSecure: config.get("isProduction"),
    forceHttps: config.get("isProduction"),
  });

  server.auth.scheme("yar", () => ({
    authenticate: async (request, h) => {
      const entra = request.yar.get("entra");

      if (entra?.expiresAt > Date.now()) {
        return h.authenticated({
          credentials: request.yar.get("credentials"),
        });
      }

      const params = new URLSearchParams({
        next: request.url.href,
      });
      return h.redirect(`/login?${params}`).takeover();
    },
  }));

  server.auth.strategy("session", "yar");

  // server.auth.default({
  //   strategy: "session",
  //   scope: [
  //     "FCP.Casework.Read",
  //     "FCP.Casework.ReadWrite",
  //     "FCP.Casework.Admin",
  //   ],
  // });

  // ---------------- Error Handling ----------------

  const messages = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Page not found",
  };

  const createErrorPageViewModel = (response) => {
    const statusCode = response.output.statusCode;

    return {
      pageTitle: "Error",
      pageHeading: statusCode,
      message: messages[statusCode] || "Something went wrong",
      error: config.get("isProduction") ? null : response,
    };
  };

  server.ext("onPreResponse", (request, h) => {
    const { response } = request;

    if (!("isBoom" in response)) {
      return h.continue;
    }

    const statusCode = response.output.statusCode;

    if (statusCode !== 404) {
      logger[statusCode >= 500 ? "error" : "warn"](response);
    }

    return h
      .view("pages/error", createErrorPageViewModel(response))
      .code(statusCode);
  });

  server.route({
    method: "GET",
    path: "/public/{param*}",
    options: {
      auth: false,
    },
    handler: {
      directory: {
        path: ".public",
        redirectToSlash: true,
        index: true,
      },
    },
  });

  server.route({
    method: "GET",
    path: "/",
    handler: (_request, h) => h.redirect("/cases"),
  });

  return server;
};
