import {
  DATE_FORMAT_FULL_DATE_TIME,
  formatDate,
} from "../../../common/nunjucks/filters/format-date.js";

export const createUserDetailsViewModel = (user, currentUser) => {
  const idpRoles = mapIdpRoles(user.idpRoles);
  const appRoles = Object.keys(user.appRoles || {});

  return {
    pageTitle: "User details",
    breadcrumbs: [
      { text: "Users", href: "/admin/user-management" },
      { text: "User details" },
    ],
    backLink: "/admin/user-management",
    data: {
      summary: {
        rows: [
          {
            key: { text: "Full name" },
            value: { text: user.name },
          },
          {
            key: { text: "Email" },
            value: { text: user.email },
          },
          {
            key: { text: "Last login" },
            value: {
              text: formatDate(user.updatedAt, DATE_FORMAT_FULL_DATE_TIME),
            },
          },
        ],
      },
      idpRoles,
      appRoles,
      showEditRoles: canEditRoles(user.id, currentUser),
      editRolesHref: `/admin/user-management/${user.id}/roles`,
    },
  };
};

const mapIdpRoles = (idpRoles) =>
  idpRoles ? idpRoles.filter((role) => role.startsWith("FCP.Casework.")) : [];

const canEditRoles = (userId, currentUser) => {
  if (!currentUser || !currentUser.id) {
    throw new Error("currentUser is required");
  }

  return currentUser.id !== userId;
};
