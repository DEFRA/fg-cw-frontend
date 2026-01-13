import {
  DATE_FORMAT_SHORT_MONTH_DATETIME,
  formatDate,
} from "../../../common/nunjucks/filters/format-date.js";

export const createUserDetailsViewModel = (user) => {
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
              text: user.updatedAt
                ? formatDate(user.updatedAt, DATE_FORMAT_SHORT_MONTH_DATETIME)
                : "",
            },
          },
        ],
      },
      idpRoles: user.idpRoles || [],
      appRoles: Object.keys(user.appRoles || {}),
      editRolesHref: `/admin/user-management/${user.id}/roles`,
    },
  };
};
