import {
  DATE_FORMAT_SHORT_DATE_TIME,
  formatDate,
} from "../../../common/nunjucks/filters/format-date.js";

export const createUserListViewModel = (users) => {
  const sortedUsers = Array.isArray(users) ? users.slice().sort(byName) : [];

  return {
    pageTitle: "Users",
    pageHeading: "Users",
    breadcrumbs: [],
    data: {
      users: {
        head: [
          { text: "Name", classes: "govuk-!-width-one-third" },
          { text: "Email", classes: "govuk-!-width-one-third" },
          { text: "Last login" },
          { html: '<span class="govuk-visually-hidden">Actions</span>' },
        ],
        rows: sortedUsers.map(({ id, name, email, updatedAt }) => ({
          id,
          name,
          email,
          lastLogin: formatDate(updatedAt, DATE_FORMAT_SHORT_DATE_TIME),
          viewHref: `/admin/user-management/${id}`,
        })),
      },
    },
  };
};

const byName = ({ name: a }, { name: b }) =>
  a.localeCompare(b, "en", { sensitivity: "base" });
