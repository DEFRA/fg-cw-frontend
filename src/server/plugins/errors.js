import { config } from "../../common/config.js";
import { logger } from "../../common/logger.js";
import { statusCodes } from "../../common/status-codes.js";

export const errors = {
  plugin: {
    name: "errors",
    register: (server) => {
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

        if (statusCode !== statusCodes.NOT_FOUND) {
          const level =
            statusCode >= statusCodes.INTERNAL_SERVER_ERROR ? "error" : "warn";
          logger[level](response);
        }

        return h
          .view("pages/error", createErrorPageViewModel(response))
          .code(statusCode);
      });
    },
  },
};
