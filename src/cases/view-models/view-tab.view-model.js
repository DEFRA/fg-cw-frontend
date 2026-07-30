import { config } from "../../common/config.js";
import { generateAgreementsJwt } from "../../common/helpers/agreements-jwt.js";
import { setActiveLink } from "../../common/helpers/navigation-helpers.js";
import { createHeaderViewModel } from "../../common/view-models/header.view-model.js";

const authenticationTokenParameter = "x-encrypted-auth";
const relativeUrlOrigin = "https://caseworking.local";

const normalizeBasePath = function (basePath) {
  const path = String(basePath || "");
  return path.endsWith("/") ? path.slice(0, -1) : path;
};

const addAgreementTokens = function (tokensByPath, basePath, sbi, agreement) {
  const { agreementRef, grantCode } = agreement || {};
  if (!agreementRef || !grantCode) {
    return;
  }

  const agreementPath = `${basePath}/${encodeURIComponent(agreementRef)}`;
  const token = generateAgreementsJwt(sbi, grantCode);
  tokensByPath.set(agreementPath, token);
  tokensByPath.set(`${agreementPath}/print`, token);
};

const buildAgreementTokensByPath = function (agreements, sbi) {
  const basePath = normalizeBasePath(config.get("agreements.baseUrl"));
  const tokensByPath = new Map();

  for (const agreement of agreements || []) {
    addAgreementTokens(tokensByPath, basePath, sbi, agreement);
  }

  return tokensByPath;
};

const tryParseUrl = function (href, base) {
  try {
    return new URL(href, base);
  } catch {
    return undefined;
  }
};

const parseHref = function (href) {
  const absoluteUrl = tryParseUrl(href);
  if (absoluteUrl) {
    return { url: absoluteUrl, absolute: true };
  }

  const relativeUrl = tryParseUrl(href, relativeUrlOrigin);
  return relativeUrl ? { url: relativeUrl, absolute: false } : undefined;
};

const isAllowedOrigin = function (url, absolute, requestOrigin) {
  return !absolute || !requestOrigin || url.origin === requestOrigin;
};

const stringifyHref = function (url, absolute) {
  return absolute ? url.toString() : `${url.pathname}${url.search}${url.hash}`;
};

const addAuthenticationToken = function (href, tokensByPath, requestOrigin) {
  const parsedHref = parseHref(href);
  if (!parsedHref) {
    return href;
  }

  const { url, absolute } = parsedHref;
  const token = tokensByPath.get(url.pathname);

  if (!token) {
    return href;
  }
  if (!isAllowedOrigin(url, absolute, requestOrigin)) {
    return href;
  }

  url.searchParams.set(authenticationTokenParameter, token);
  return stringifyHref(url, absolute);
};

const isTraversableObject = function (value) {
  return value && typeof value === "object";
};

const isUrlComponent = function (value) {
  return value.component === "url" && typeof value.href === "string";
};

const authenticateAgreementLinks = function (
  value,
  tokensByPath,
  requestOrigin,
) {
  if (Array.isArray(value)) {
    return value.map((item) =>
      authenticateAgreementLinks(item, tokensByPath, requestOrigin),
    );
  }

  if (!isTraversableObject(value)) {
    return value;
  }

  const authenticated = Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      authenticateAgreementLinks(item, tokensByPath, requestOrigin),
    ]),
  );

  if (isUrlComponent(value)) {
    authenticated.href = addAuthenticationToken(
      value.href,
      tokensByPath,
      requestOrigin,
    );
  }

  return authenticated;
};

const getSbi = function (request) {
  return request?.auth?.credentials?.sbi;
};

const getRequestOrigin = function (request) {
  return request?.url?.origin;
};

const buildContent = function ({ tabData, request, tabId }) {
  if (tabId !== "agreements") {
    return tabData.content;
  }

  const sbi = getSbi(request);
  const tokensByPath = buildAgreementTokensByPath(tabData.agreements, sbi);
  return authenticateAgreementLinks(
    tabData.content,
    tokensByPath,
    getRequestOrigin(request),
  );
};

export const createViewTabViewModel = ({ page, request, tabId }) => {
  const tabData = page.data;
  const links = setActiveLink(tabData.links, tabId);
  const title = links.find((link) => link.active)?.text ?? tabId;
  return {
    pageTitle: `${title} ${tabData.caseRef}`,
    header: createHeaderViewModel({ page, request }),
    breadcrumbs: [],
    data: {
      ...tabData,
      links,
      content: buildContent({ tabData, request, tabId }),
    },
  };
};
