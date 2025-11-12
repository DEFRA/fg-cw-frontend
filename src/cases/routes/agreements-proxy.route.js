import {
  getAgreementsBaseUrl,
  proxyToAgreements,
  statusCodes,
} from "../use-cases/proxy-to-agreements.use-case.js";

const noop = function () {};

const defaultLogger = {
  info: noop,
  warn: noop,
  error: noop,
};

const resolveLogger = function (logger) {
  return logger ?? defaultLogger;
};

const getUpstreamHeaders = function (res) {
  if (!res?.headers) {
    return undefined;
  }

  return {
    "content-type": res.headers["content-type"],
    "www-authenticate": res.headers["www-authenticate"],
  };
};

const createOnProxyResponse = function (requestLogger, uri) {
  const logger = resolveLogger(requestLogger);
  return function onProxyResponse(err, res) {
    if (err) {
      logger.warn(
        {
          agreementProxyTarget: uri,
          error: err.message,
        },
        "Agreements proxy upstream response error",
      );
      throw err;
    }

    logger.info(
      {
        agreementProxyTarget: uri,
        upstreamStatusCode: res?.statusCode,
        upstreamHeaders: getUpstreamHeaders(res),
      },
      "Agreements proxy upstream response",
    );

    return res;
  };
};

const baseUrl = getAgreementsBaseUrl();

const getErrorStatusCode = function (error) {
  if (error.statusCode) {
    return error.statusCode;
  }
  if (error.output?.statusCode) {
    return error.output.statusCode;
  }
  return statusCodes.SERVICE_UNAVAILABLE;
};

const handleProxyError = function (error, h) {
  const isConfigError = error.message.includes(
    "Missing required configuration",
  );
  const statusCode = isConfigError
    ? statusCodes.SERVICE_UNAVAILABLE
    : getErrorStatusCode(error);

  return h
    .response({
      error: isConfigError
        ? "Service Configuration Error"
        : "External Service Unavailable",
      message: isConfigError
        ? "Service temporarily unavailable"
        : "Unable to process request",
    })
    .code(statusCode);
};

const executeProxy = async function (path, request, h) {
  const { uri, headers } = proxyToAgreements(path, request);
  const requestLogger = resolveLogger(request?.logger);
  const proxyResponse = await h.proxy({
    mapUri: () => ({ uri, headers }),
    passThrough: true,
    rejectUnauthorized: true,
    onResponse: createOnProxyResponse(requestLogger, uri),
  });

  if (!proxyResponse) {
    return h
      .response({
        error: "No response from upstream service",
        message: "The agreements UI did not return any data",
      })
      .code(statusCodes.BAD_GATEWAY);
  }

  return proxyResponse;
};

const agreementsProxyHandler = async function (request, h) {
  const { path } = request.params;
  if (!path) {
    return h
      .response({ error: "Bad Request", message: "Path parameter is required" })
      .code(statusCodes.BAD_REQUEST);
  }

  const requestLogger = resolveLogger(request?.logger);
  return executeProxy(path, request, h).catch((error) =>
    handleProxyFailure({ error, logger: requestLogger, path, h }),
  );
};

const handleProxyFailure = function ({ error, logger, path, h }) {
  logger.warn(
    {
      agreementProxyPath: path,
      error: error.message,
      statusCode: getErrorStatusCode(error),
      isBoom: Boolean(error.isBoom),
    },
    "Agreements proxy encountered an error",
  );
  return handleProxyError(error, h);
};

export const agreementsProxyRoutes = [
  {
    method: "GET",
    path: `${baseUrl}/{path*}`,
    options: {
      auth: { mode: "required", strategy: "session" },
    },
    handler: agreementsProxyHandler,
  },
];
