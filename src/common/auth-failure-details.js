// Keep diagnostic codes open-ended but bounded to symbolic identifiers.
// OAuth codes use lower-case identifiers; Node transport codes use upper-case.
const oauthCodePattern = /^[a-z][a-z_\d]{0,63}$/;
const networkCodePattern = /^[A-Z][A-Z_\d]{0,63}$/;
const MIN_HTTP_STATUS = 100;
const MAX_HTTP_STATUS = 599;

const symbolicCode = (value, pattern) => {
  if (typeof value !== "string") {
    return undefined;
  }
  // Comparing the entire match also rejects a trailing newline, which `$`
  // alone would allow in JavaScript regular expressions.
  return pattern.exec(value)?.[0] === value ? value : undefined;
};

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
  // `error_description` on the raw OAuth body, and `message` once the library
  // has folded that body into an Error.
  const text = [value.error_description, value.message]
    .filter((candidate) => typeof candidate === "string")
    .join(" ");
  const match = text.match(/\bAADSTS(\d{4,10})\b/);
  return match ? [Number(match[1])] : [];
};

const validUuid = (value) =>
  typeof value === "string" && uuidPattern.test(value) ? value : undefined;

const addEntraDetails = (details, value) => {
  put(details, "entraError", symbolicCode(value.error, oauthCodePattern));
  const codes = entraCodes(value);
  put(details, "entraErrorCodes", codes.length ? codes : undefined);
  put(details, "correlationId", validUuid(value.correlation_id));
  put(details, "entraTraceId", validUuid(value.trace_id));
};

const validStatus = (code) => {
  if (!Number.isInteger(code)) {
    return undefined;
  }
  return code >= MIN_HTTP_STATUS && code <= MAX_HTTP_STATUS ? code : undefined;
};

const responseStatus = (value) =>
  [value.output?.statusCode, value.res?.statusCode, value.status].find(
    (code) => code !== undefined,
  );

// oauth4webapi labels its own error classes with upper-case `OAUTH_*` codes,
// which look exactly like a Node transport code. Reporting one as the
// diagnostic would hide the AADSTS code underneath it.
const isLibraryErrorCode = (value) =>
  typeof value === "string" && value.startsWith("OAUTH_");

const networkErrorCode = (code) =>
  isLibraryErrorCode(code) ? undefined : symbolicCode(code, networkCodePattern);

const addTransportDetails = (details, value) => {
  put(details, "statusCode", validStatus(responseStatus(value)));
  put(details, "networkErrorCode", networkErrorCode(value.code));
};

const isRecord = (value) => value !== null && typeof value === "object";

// openid-client raises a ResponseBodyError carrying the parsed OAuth body on
// .cause; hapi wraps that again in a Boom. Never log the raw error, response,
// or description: they can contain credentials, request headers, URLs, and
// personal data.
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

  visit(error, 0);
  return details;
};
