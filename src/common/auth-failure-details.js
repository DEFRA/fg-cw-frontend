const oauthErrors = new Set([
  "invalid_request",
  "invalid_client",
  "invalid_grant",
  "unauthorized_client",
  "unsupported_grant_type",
  "invalid_scope",
  "access_denied",
  "server_error",
  "temporarily_unavailable",
  "interaction_required",
  "consent_required",
  "login_required",
]);

const networkErrors = new Set([
  "ENOTFOUND",
  "EAI_AGAIN",
  "ECONNREFUSED",
  "ECONNRESET",
  "ETIMEDOUT",
  "ESOCKETTIMEDOUT",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "EPROTO",
  "CERT_HAS_EXPIRED",
  "DEPTH_ZERO_SELF_SIGNED_CERT",
  "SELF_SIGNED_CERT_IN_CHAIN",
  "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
  "UNABLE_TO_GET_ISSUER_CERT_LOCALLY",
  "ERR_TLS_CERT_ALTNAME_INVALID",
]);

const uuidPattern = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

const parseJson = (value) => {
  if (value.length > 16384) {
    return null;
  }
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const parseData = (input) => {
  const value = Buffer.isBuffer(input) ? input.toString("utf8") : input;
  return typeof value === "string" ? parseJson(value) : value;
};

const put = (details, key, value) => {
  if (value !== undefined) {
    details[key] = value;
  }
};

const numericCodes = (codes) =>
  Array.isArray(codes)
    ? codes.filter((code) => Number.isSafeInteger(code) && code > 0)
    : [];

const entraCodes = (value) => {
  const codes = numericCodes(value.error_codes);
  if (codes.length) {
    return codes;
  }
  const match =
    typeof value.error_description === "string"
      ? value.error_description.match(/\bAADSTS(\d{4,10})\b/)
      : null;
  return match ? [Number(match[1])] : [];
};

const validUuid = (value) =>
  typeof value === "string" && uuidPattern.test(value) ? value : undefined;

const addEntraDetails = (details, value) => {
  put(
    details,
    "entraError",
    oauthErrors.has(value.error) ? value.error : undefined,
  );
  const codes = entraCodes(value);
  put(details, "entraErrorCodes", codes.length ? codes : undefined);
  put(details, "correlationId", validUuid(value.correlation_id));
  put(details, "entraTraceId", validUuid(value.trace_id));
};

const validStatus = (code) => {
  if (!Number.isInteger(code)) {
    return undefined;
  }
  return code >= 100 && code <= 599 ? code : undefined;
};

const responseStatus = (value) =>
  value.output?.statusCode ?? value.res?.statusCode;

const addTransportDetails = (details, value) => {
  put(details, "statusCode", validStatus(responseStatus(value)));
  put(
    details,
    "networkErrorCode",
    networkErrors.has(value.code) ? value.code : undefined,
  );
};

const isRecord = (value) => value !== null && typeof value === "object";

// Bell wraps Wreck errors in .data; Wreck can wrap response bodies and
// transport errors again. Never log the raw error, response, or description:
// they can contain credentials, request headers, URLs, and personal data.
export const authFailureDetails = (error) => {
  const details = {};
  const visit = (input, depth) => {
    const value = parseData(input);
    if (!isRecord(value) || depth > 4) {
      return;
    }
    addTransportDetails(details, value);
    addEntraDetails(details, value);
    for (const nested of [value.data, value.cause, value.payload]) {
      visit(nested, depth + 1);
    }
  };

  // Start with the underlying error; Bell's own 500 is a wrapper, not the
  // HTTP status returned by the token endpoint.
  visit(error?.data, 0);
  return details;
};
