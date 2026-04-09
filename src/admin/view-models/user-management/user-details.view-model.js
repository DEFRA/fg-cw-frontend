import {
  DATE_FORMAT_FULL_DATE_TIME,
  formatDate,
} from "../../../common/nunjucks/filters/format-date.js";
import { createHeaderViewModel } from "../../../common/view-models/header.view-model.js";

export const createUserDetailsViewModel = ({ page, request, currentUser }) => {
  const user = page.data;
  const idpRoles = mapIdpRoles(user.idpRoles);
  const appRoles = Object.keys(user.appRoles || {});
  const pageHeading = `${user.name} details`;

  return {
    pageTitle: pageHeading,
    pageHeading,
    header: createHeaderViewModel({ page, request }),
    breadcrumbs: [
      { text: "User management", href: "/admin" },
      { text: "Users", href: "/admin/user-management/users" },
      { text: user.name },
    ],
    backLink: "/admin/user-management/users",
    data: {
      summary: { rows: buildSummaryRows(user, idpRoles) },
      idpRoles,
      appRoles,
      showEditRoles: canEditRoles(user.id, currentUser),
      editRolesHref: `/admin/user-management/users/${user.id}/roles`,
    },
  };
};

const buildSummaryRows = (user, idpRoles) => {
  const activeAppRoles = Object.keys(filterActiveAppRoles(user.appRoles));
  const expiredAppRoles = Object.keys(filterExpiredAppRoles(user.appRoles));
  const futureAppRoles = Object.keys(filterFutureAppRoles(user.appRoles));

  return [
    {
      key: { text: "Email" },
      value: { text: user.email },
    },
    {
      key: { text: "Last login" },
      value: {
        text: formatDate(user.lastLoginAt, DATE_FORMAT_FULL_DATE_TIME),
      },
    },
    {
      key: { text: "Identity provider (IDP) roles" },
      value: formatRolesValue(
        idpRoles,
        "No IDP roles have been allocated to this user",
      ),
    },
    {
      key: { text: "Manage grants roles" },
      value: formatRolesValue(
        activeAppRoles,
        "No Manage grants roles have been allocated to this user",
      ),
    },
    expiredAppRoles.length && {
      key: { text: "Expired Manage grants roles" },
      value: { html: expiredAppRoles.join(",<br>") },
    },
    futureAppRoles.length && {
      key: { text: "Future Manage grants roles" },
      value: { html: futureAppRoles.join(",<br>") },
    },
  ].filter(Boolean);
};

const mapIdpRoles = (idpRoles) =>
  idpRoles ? idpRoles.filter((role) => role.startsWith("FCP.Casework.")) : [];

const formatRolesValue = (roles, emptyMessage) => {
  if (!roles.length) {
    return { text: emptyMessage };
  }

  return { html: roles.join(",<br>") };
};

const isBeforeNow = (dateStr, now) => dateStr && new Date(dateStr) < now;

const isAfterNow = (dateStr, now) => dateStr && new Date(dateStr) > now;

const filterActiveAppRoles = (appRoles) => {
  if (!appRoles) return {};

  const now = new Date();
  return Object.fromEntries(
    Object.entries(appRoles).filter(([, { startDate, endDate } = {}]) => {
      return !isAfterNow(startDate, now) && !isBeforeNow(endDate, now);
    }),
  );
};

const filterExpiredAppRoles = (appRoles) => {
  if (!appRoles) return {};

  const now = new Date();
  return Object.fromEntries(
    Object.entries(appRoles).filter(([, { endDate } = {}]) => {
      return isBeforeNow(endDate, now);
    }),
  );
};

const filterFutureAppRoles = (appRoles) => {
  if (!appRoles) return {};

  const now = new Date();
  return Object.fromEntries(
    Object.entries(appRoles).filter(([, { startDate, endDate } = {}]) => {
      return isAfterNow(startDate, now) && !isBeforeNow(endDate, now);
    }),
  );
};

const canEditRoles = (userId, currentUser) => {
  if (!currentUser?.id) {
    throw new Error("currentUser is required");
  }

  return currentUser.id !== userId;
};
