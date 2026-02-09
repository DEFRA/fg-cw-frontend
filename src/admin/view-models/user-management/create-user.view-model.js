import { createHeaderViewModel } from "../../../common/view-models/header.view-model.js";

const PAGE_TITLE = "Create user";

export const createCreateUserViewModel = (options = {}) => {
  const { page, request, formData, errors } = options;
  const safeErrors = errors || {};
  const safeFormData = { ...defaultFormData, ...formData };

  return {
    pageTitle: PAGE_TITLE,
    pageHeading: PAGE_TITLE,
    header: createHeaderViewModel({ page, request }),
    breadcrumbs: [
      { text: "User management", href: "/admin" },
      { text: "Users", href: "/admin/user-management/users" },
      { text: PAGE_TITLE },
    ],
    data: {
      formData: safeFormData,
      cancelHref: "/admin/user-management/users",
    },
    errors: safeErrors,
    errorList: buildErrorList(safeErrors),
  };
};

const defaultFormData = {
  name: "",
  email: "",
};

const buildErrorList = (errors) =>
  Object.entries(errors)
    .filter(([, message]) => Boolean(message))
    .map(([key, message]) => ({
      text: message,
      ...(key !== "save" && { href: `#${key}` }),
    }));
