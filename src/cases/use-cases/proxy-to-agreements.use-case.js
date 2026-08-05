import Boom from "@hapi/boom";
import { config } from "../../common/config.js";
import { generateAgreementsJwt } from "../../common/helpers/agreements-jwt.js";
import { logger } from "../../common/logger.js";
import { findCaseByIdUseCase } from "./find-case-by-id.use-case.js";

export { statusCodes } from "../../common/status-codes.js";

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

/**
 * Adds the Agreements UI JWT authentication header.
 * @param {object} headers - The proxy headers
 * @param {{sbi?: string, grantCode?: string}} trustedClaims - Trusted agreement claims
 * @returns {object} The proxy headers
 */
const addJwtHeader = (headers, trustedClaims) => {
  const { sbi, grantCode } = trustedClaims;

  try {
    // Always generate JWT for 'entra' source (SBI is optional)
    headers["x-encrypted-auth"] = generateAgreementsJwt(sbi, grantCode);
  } catch (error) {
    logger.error("Failed to generate JWT", { error: error.message });
    throw new Error(`Failed to generate JWT token: ${error.message}`);
  }
  return headers;
};

const buildProxyHeaders = (uiToken, request, trustedClaims) => {
  const headers = {
    Authorization: `Bearer ${uiToken}`,
    "x-base-url": config.get("agreements.baseUrl"),
    "content-type": request.headers["content-type"] || "text/html",
    "x-csp-nonce": request.app.cspNonce,
    "X-Request-ID": request.headers["x-request-id"] || request.info.id,
    "X-Correlation-ID": request.headers["x-correlation-id"] || request.info.id,
  };

  return addJwtHeader(headers, trustedClaims);
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
 * @param {object} options - Proxy request options
 * @param {string} options.path - The path to proxy
 * @param {object} options.request - The incoming request
 * @param {{sbi?: string, grantCode?: string}} [options.trustedClaims] - Trusted agreement claims
 * @returns {{uri: string, headers: object}}
 */
export const proxyToAgreements = ({ path, request, trustedClaims }) => {
  const { uiUrl, uiToken } = validateConfig();
  const uri = buildTargetUri(uiUrl, path);
  const agreementClaims = trustedClaims ?? {
    sbi: request.auth.credentials.sbi,
  };
  logger.info(`Proxying request to agreements UI: ${uri} and path: ${path}`);
  const headers = buildProxyHeaders(uiToken, request, agreementClaims);

  logger.info(
    `Finished: Proxying request to agreements UI: ${uri} and path: ${path}`,
  );
  return { uri, headers };
};

const getAuthContext = (request) => ({
  token: request.auth.credentials.token,
  user: request.auth.credentials.user,
});

const getWorkflowCode = (page) => {
  const workflowCode = page?.data?.workflowCode;
  if (!workflowCode) {
    throw Boom.badGateway("Case workflow code is unavailable");
  }
  return workflowCode;
};

const getCaseIdentifiers = (page) => page?.data?.payload?.identifiers;

const getCaseSbi = (page) => {
  const sbi = getCaseIdentifiers(page)?.sbi;
  if (!sbi) {
    throw Boom.badGateway("Case SBI is unavailable");
  }
  return sbi;
};

const getTrustedClaims = (page) => ({
  grantCode: getWorkflowCode(page),
  sbi: getCaseSbi(page),
});

export const proxyCaseAgreement = async (caseId, agreementRef, request) => {
  const page = await findCaseByIdUseCase(getAuthContext(request), caseId);
  const trustedClaims = getTrustedClaims(page);

  return proxyToAgreements({
    path: agreementRef,
    request,
    trustedClaims,
  });
};
