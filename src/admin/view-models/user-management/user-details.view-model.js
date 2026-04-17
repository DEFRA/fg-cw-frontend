import {
  DATE_FORMAT_FULL_DATE_TIME,
  formatDate,
} from "../../../common/nunjucks/filters/format-date.js";
import { format } from "date-fns";
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

  const rows = [
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
  ];

  if (expiredAppRoles.length) {
    rows.push({
      key: { text: "Expired Manage grants roles" },
      value: formatRolesValue(expiredAppRoles, ""),
    });
  }

  if (futureAppRoles.length) {
    rows.push({
      key: { text: "Future Manage grants roles" },
      value: formatRolesValue(futureAppRoles, ""),
    });
  }

  return rows;
};

const mapIdpRoles = (idpRoles) =>
  idpRoles ? idpRoles.filter((role) => role.startsWith("FCP.Casework.")) : [];

const formatRolesValue = (roles, emptyMessage) => {
  if (!roles.length) {
    return { text: emptyMessage };
  }

  return { html: roles.join(",<br>") };
};

const getToday = () => format(new Date(), "yyyy-MM-dd");

const hasStarted = (startDate, today) => !startDate || startDate <= today;

const hasExpired = (endDate, today) => Boolean(endDate && endDate < today);

const filterActiveAppRoles = (appRoles) => {
  if (!appRoles) {
    return {};
  }

  const today = getToday();
  return Object.fromEntries(
    Object.entries(appRoles).filter(([, { startDate, endDate } = {}]) => {
      return hasStarted(startDate, today) && !hasExpired(endDate, today);
    }),
  );
};

const filterExpiredAppRoles = (appRoles) => {
  if (!appRoles) {
    return {};
  }

  const today = getToday();
  return Object.fromEntries(
    Object.entries(appRoles).filter(([, { endDate } = {}]) => {
      return hasExpired(endDate, today);
    }),
  );
};

const filterFutureAppRoles = (appRoles) => {
  if (!appRoles) {
    return {};
  }

  const today = getToday();
  return Object.fromEntries(
    Object.entries(appRoles).filter(([, { startDate, endDate } = {}]) => {
      return !hasStarted(startDate, today) && !hasExpired(endDate, today);
    }),
  );
};

const canEditRoles = (userId, currentUser) => {
  if (!currentUser?.id) {
    throw new Error("currentUser is required");
  }

  return currentUser.id !== userId;
};
