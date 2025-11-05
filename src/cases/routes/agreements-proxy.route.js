import {
  getAgreementsBaseUrl,
  proxyToAgreements,
  statusCodes,
} from "../use-cases/proxy-to-agreements.use-case.js";

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
  const proxyResponse = await h.proxy({
    mapUri: () => ({ uri, headers }),
    passThrough: true,
    rejectUnauthorized: true,
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

  try {
    return await executeProxy(path, request, h);
  } catch (error) {
    return handleProxyError(error, h);
  }
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
