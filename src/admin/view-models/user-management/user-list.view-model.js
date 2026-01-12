import {
  DATE_FORMAT_SHORT_MONTH,
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
          name: defaultToEmptyString(name),
          email: defaultToEmptyString(email),
          lastLogin: mapLastLogin(updatedAt),
          viewHref: `/admin/user-management/${id}`,
        })),
      },
    },
  };
};

const defaultToEmptyString = (value) =>
  typeof value === "string" ? value : "";

const mapLastLogin = (updatedAt) =>
  updatedAt ? formatDate(updatedAt, `${DATE_FORMAT_SHORT_MONTH} HH:mm`) : "";

const byName = ({ name: a }, { name: b }) =>
  a.localeCompare(b, "en", { sensitivity: "base" });
