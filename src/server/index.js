import hapi from "@hapi/hapi";
import { config } from "../common/config.js";
import { logger } from "../common/logger.js";
import { nunjucks } from "../common/nunjucks/nunjucks.js";
import { auth } from "./plugins/auth.js";
import { errors } from "./plugins/errors.js";
import { files } from "./plugins/files.js";
import { logging } from "./plugins/logging.js";
import { redirects } from "./plugins/redirects.js";
import { session } from "./plugins/session.js";
import { shutdown } from "./plugins/shutdown.js";
import { tracing } from "./plugins/tracing.js";

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
    auth,
    errors,
    files,
    logging,
    nunjucks,
    redirects,
    shutdown,
    session,
    tracing,
  ]);

  return server;
};
