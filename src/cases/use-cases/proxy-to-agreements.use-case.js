import { config } from "../../common/config.js";
import { generateAgreementsJwt } from "../../common/helpers/agreements-jwt.js";
import { logger } from "../../common/logger.js";

export { statusCodes } from "../../common/status-codes.js";

const SHORT_TOKEN_VISIBLE_CHARS = 1;
const SHORT_TOKEN_MAX_LENGTH = 8;
const LONG_TOKEN_VISIBLE_CHARS = 4;

/**
 * Validates required configuration values for agreements proxy
 * @returns {{uiUrl: string, uiToken: string, jwtSecret: string}}
 * @throws {Error} If required config is missing
 */
const validateConfig = function () {
  const uiUrl = config.get("agreements.uiUrl");
  const uiToken = config.get("agreements.uiToken");
  const jwtSecret = config.get("agreements.jwtSecret");

  if (!uiUrl || !uiToken || !jwtSecret) {
    throw new Error("Missing required configuration: agreements settings");
  }

  return {
    uiUrl: String(uiUrl),
    uiToken: String(uiToken),
    jwtSecret: String(jwtSecret),
  };
};

/**
 * Constructs the target URI for the proxy request
 * @param {string} baseUrl - The base URL of the agreements UI
 * @param {string} path - The path from the request params
 * @returns {string} The complete URI
 */
const buildTargetUri = function (baseUrl, path) {
  const cleanBaseUrl = baseUrl.replace(/\/$/, "");
  const cleanPath = path?.replace(/^\//, "") || "";
  return cleanPath ? `${cleanBaseUrl}/${cleanPath}` : cleanBaseUrl;
};

const maskToken = function (value) {
  if (!value) {
    return undefined;
  }

  const token = String(value);
  if (token.length <= SHORT_TOKEN_MAX_LENGTH) {
    return `${token.slice(0, SHORT_TOKEN_VISIBLE_CHARS)}***${token.slice(
      Math.max(token.length - SHORT_TOKEN_VISIBLE_CHARS, 0),
    )}`;
  }

  return `${token.slice(0, LONG_TOKEN_VISIBLE_CHARS)}...${token.slice(
    token.length - LONG_TOKEN_VISIBLE_CHARS,
  )}`;
};

/**
 * Builds proxy headers for the request
 * @param {string} uiToken - The UI token
 * @param {object} request - The incoming request object
 * @returns {object} The proxy headers object
 */
// eslint-disable-next-line complexity
const addJwtHeader = function (headers, request) {
  const sbi = request?.auth?.credentials?.sbi;

  try {
    // Always generate JWT for 'entra' source (SBI is optional)
    headers["x-encrypted-auth"] = generateAgreementsJwt(sbi);
  } catch (error) {
    logger.error("Failed to generate JWT", { error: error.message });
    throw new Error(`Failed to generate JWT token: ${error.message}`);
  }
  return headers;
};

const buildProxyHeaders = function (uiToken, request) {
  const headers = {
    Authorization: `Bearer ${uiToken}`,
    "x-base-url": config.get("agreements.baseUrl"),
    "content-type": request.headers["content-type"] || "text/html",
    "x-csp-nonce": request.app.cspNonce,
    "X-Request-ID": request.headers["x-request-id"] || request.info.id,
    "X-Correlation-ID": request.headers["x-correlation-id"] || request.info.id,
  };

  return addJwtHeader(headers, request);
};

/**
 * Get agreements base URL from config
 * @returns {string} The base URL path
 */
export const getAgreementsBaseUrl = function () {
  return config.get("agreements.baseUrl");
};

/**
 * Proxy to agreements use case
 * @param {string} path - The path to proxy
 * @param {object} request - The incoming request
 * @returns {{uri: string, headers: object}}
 */
export const proxyToAgreements = function (path, request) {
  const { uiUrl, uiToken } = validateConfig();
  const uri = buildTargetUri(uiUrl, path);
  logger.info(`Proxying request to agreements UI: ${uri} and path: ${path}`);
  const headers = buildProxyHeaders(uiToken, request);
  const bearerToken = headers.Authorization?.replace(/^Bearer\s+/i, "");
  const sanitizedHeaders = {
    hasAuthorization: Boolean(headers.Authorization),
    authorizationPreview: bearerToken
      ? `Bearer ${maskToken(bearerToken)}`
      : undefined,
    hasEncryptedAuth: Boolean(headers["x-encrypted-auth"]),
    encryptedAuthPreview: maskToken(headers["x-encrypted-auth"]),
    hasBaseUrlHeader: Boolean(headers["x-base-url"]),
    hasNonce: Boolean(headers["x-csp-nonce"]),
  };

  logger.info(
    `Finished: Proxying request to agreements UI: ${uri} and path: ${path} sanitised headers ${JSON.stringify(sanitizedHeaders, null, 2)}`,
  );
  return { uri, headers };
};
