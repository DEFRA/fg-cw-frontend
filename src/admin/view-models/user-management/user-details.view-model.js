import {
  DATE_FORMAT_FULL_DATE_TIME,
  formatDate,
} from "../../../common/nunjucks/filters/format-date.js";
import { createHeaderViewModel } from "../../../common/view-models/header.view-model.js";

export const createUserDetailsViewModel = ({ page, request, currentUser }) => {
  const user = page.data;
  const idpRoles = mapIdpRoles(user.idpRoles);
  const appRoles = Object.keys(user.appRoles || {});
  const idpRolesValue = formatRolesValue(
    idpRoles,
    "No IDP roles have been allocated to this user",
  );
  const appRolesValue = formatRolesValue(
    appRoles,
    "No Manage grants roles have been allocated to this user",
  );
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
      summary: {
        rows: [
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
            value: idpRolesValue,
          },
          {
            key: { text: "Manage grants roles" },
            value: appRolesValue,
          },
        ],
      },
      idpRoles,
      appRoles,
      showEditRoles: canEditRoles(user.id, currentUser),
      editRolesHref: `/admin/user-management/users/${user.id}/roles`,
    },
  };
};

const mapIdpRoles = (idpRoles) =>
  idpRoles ? idpRoles.filter((role) => role.startsWith("FCP.Casework.")) : [];

const formatRolesValue = (roles, emptyMessage) => {
  if (!roles.length) {
    return { text: emptyMessage };
  }

  return { html: roles.join(",<br>") };
};

const canEditRoles = (userId, currentUser) => {
  if (!currentUser?.id) {
    throw new Error("currentUser is required");
  }

  return currentUser.id !== userId;
};
