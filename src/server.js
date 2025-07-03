import { tracing } from "@defra/hapi-tracing";
import Bell from "@hapi/bell";
import Cookie from "@hapi/cookie";
import hapi from "@hapi/hapi";
import Inert from "@hapi/inert";
import hapiPino from "hapi-pino";
import hapiPulse from "hapi-pulse";
import { config } from "./common/config.js";
import { logger } from "./common/logger.js";
import { nunjucks } from "./common/nunjucks/nunjucks.js";

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

  // ---------------- Authentication ----------------

  await server.register([Bell, Cookie]);

  server.auth.strategy("session", "cookie", {
    cookie: {
      name: "session",
      password: config.get("session.cookie.password"),
      ttl: config.get("session.cookie.ttl"),
      path: "/",
      isSecure: config.get("isProduction"),
      isSameSite: "Strict",
    },
    keepAlive: true,
    appendNext: true,
    redirectTo: "/login",
    validate(_request, session) {
      return session?.authenticated
        ? { isValid: true, credentials: session }
        : { isValid: false };
    },
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
      return `${protocol}://${request.info.host}/login/callback`;
    },
    isSecure: config.get("isProduction"),
    forceHttps: config.get("isProduction"),
  });

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
