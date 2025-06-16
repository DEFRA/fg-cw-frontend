import { logger } from "../../../common/logger.js";

const messages = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Page not found",
  500: "Something went wrong",
  502: "Service unavailable",
};

const statusCodeMessage = (statusCode) =>
  messages[statusCode] || "Something went wrong";

export const catchAll = (request, h) => {
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
    .view("error/index", {
      pageTitle: errorMessage,
      heading: statusCode,
      message: errorMessage,
    })
    .code(statusCode);
};
