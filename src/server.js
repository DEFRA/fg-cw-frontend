import { tracing } from "@defra/hapi-tracing";
import hapi from "@hapi/hapi";
import Inert from "@hapi/inert";
import hapiPino from "hapi-pino";
import hapiPulse from "hapi-pulse";
import { cases } from "./cases/index.js";
import { config } from "./common/config.js";
import { logger } from "./common/logger.js";
import { nunjucks } from "./common/nunjucks/nunjucks.js";
import { health } from "./health/index.js";

const messages = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Page not found",
  500: "Something went wrong",
};

const statusCodeMessage = (statusCode) =>
  messages[statusCode] || "Something went wrong";

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

  await server.register([health, cases]);

  server.ext("onPreResponse", (request, h) => {
    const { response } = request;

    if (!("isBoom" in response)) {
      return h.continue;
    }

    const statusCode = response.output.statusCode;
    const errorMessage = statusCodeMessage(statusCode);

    if (statusCode >= 500) {
      logger.error(response?.stack);
    }

    return h
      .view("pages/error", {
        pageTitle: errorMessage,
        pageHeading: statusCode,
        message: errorMessage,
      })
      .code(statusCode);
  });

  server.route({
    method: "GET",
    path: "/public/{param*}",
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
