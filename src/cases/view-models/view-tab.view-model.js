import { config } from "../../common/config.js";
import { generateAgreementsJwt } from "../../common/helpers/agreements-jwt.js";
import { setActiveLink } from "../../common/helpers/navigation-helpers.js";
import { createHeaderViewModel } from "../../common/view-models/header.view-model.js";

const authenticationTokenParameter = "x-encrypted-auth";
const relativeUrlOrigin = "http://caseworking.local";

const normalizeBasePath = function (basePath) {
  const path = String(basePath || "");
  return path.endsWith("/") ? path.slice(0, -1) : path;
};

const buildAgreementTokensByPath = function (agreements, sbi) {
  const basePath = normalizeBasePath(config.get("agreements.baseUrl"));
  const tokensByPath = new Map();

  for (const agreement of agreements || []) {
    const { agreementRef, grantCode } = agreement || {};
    if (!agreementRef || !grantCode) {
      continue;
    }

    const agreementPath = `${basePath}/${encodeURIComponent(agreementRef)}`;
    const token = generateAgreementsJwt(sbi, grantCode);
    tokensByPath.set(agreementPath, token);
    tokensByPath.set(`${agreementPath}/print`, token);
  }

  return tokensByPath;
};

const parseHref = function (href) {
  try {
    return { url: new URL(href), absolute: true };
  } catch {
    try {
      return { url: new URL(href, relativeUrlOrigin), absolute: false };
    } catch {
      return undefined;
    }
  }
};

const addAuthenticationToken = function (href, tokensByPath, requestOrigin) {
  const parsedHref = parseHref(href);
  if (!parsedHref) {
    return href;
  }

  const { url, absolute } = parsedHref;
  const token = tokensByPath.get(url.pathname);

  if (!token || (absolute && requestOrigin && url.origin !== requestOrigin)) {
    return href;
  }

  url.searchParams.set(authenticationTokenParameter, token);
  return absolute
    ? url.toString()
    : `${url.pathname}${url.search}${url.hash}`;
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

  if (!value || typeof value !== "object") {
    return value;
  }

  const authenticated = Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      authenticateAgreementLinks(item, tokensByPath, requestOrigin),
    ]),
  );

  if (value.component === "url" && typeof value.href === "string") {
    authenticated.href = addAuthenticationToken(
      value.href,
      tokensByPath,
      requestOrigin,
    );
  }

  return authenticated;
};

const buildContent = function ({ tabData, request, tabId }) {
  if (tabId !== "agreements") {
    return tabData.content;
  }

  const sbi = request?.auth?.credentials?.sbi;
  const tokensByPath = buildAgreementTokensByPath(tabData.agreements, sbi);
  return authenticateAgreementLinks(
    tabData.content,
    tokensByPath,
    request?.url?.origin,
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
