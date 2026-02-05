import {
  DATE_FORMAT_SHORT_DATE_TIME,
  formatDate,
} from "../../../common/nunjucks/filters/format-date.js";
import { createHeaderViewModel } from "../../../common/view-models/header.view-model.js";

export const createUserListViewModel = ({ page, request }) => {
  const users = page.data;
  const sortedUsers = Array.isArray(users) ? users.slice().sort(byName) : [];

  return {
    pageTitle: "Users",
    pageHeading: "Users",
    header: createHeaderViewModel({ page, request }),
    breadcrumbs: [
      { text: "User management", href: "/admin" },
      { text: "Users" },
    ],
    data: {
      users: {
        head: [
          { text: "Name", classes: "govuk-!-width-one-third" },
          { text: "Email", classes: "govuk-!-width-one-third" },
          { text: "Last login" },
        ],
        rows: sortedUsers.map(({ id, name, email, lastLoginAt }) => ({
          id,
          name,
          email,
          lastLogin: formatDate(lastLoginAt, DATE_FORMAT_SHORT_DATE_TIME),
          nameHref: `/admin/user-management/${id}`,
        })),
      },
    },
  };
};

const byName = ({ name: a }, { name: b }) =>
  a.localeCompare(b, "en", { sensitivity: "base" });
