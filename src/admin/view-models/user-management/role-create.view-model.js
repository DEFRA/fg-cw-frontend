import { createHeaderViewModel } from "../../../common/view-models/header.view-model.js";

const PAGE_TITLE = "Create role";

export const createNewRoleViewModel = (options = {}) => {
  const { page, request, formData, errors } = options;
  const safeErrors = errors || {};
  const safeFormData = { ...defaultFormData, ...formData };

  return {
    pageTitle: PAGE_TITLE,
    pageHeading: PAGE_TITLE,
    header: createHeaderViewModel({ page, request }),
    breadcrumbs: [
      { text: "User management", href: "/admin" },
      { text: "Roles", href: "/admin/user-management/roles" },
      { text: PAGE_TITLE },
    ],
    data: {
      formData: safeFormData,
      cancelHref: "/admin/user-management/roles",
    },
    errors: safeErrors,
    errorList: buildErrorList(safeErrors),
  };
};

const defaultFormData = {
  code: "",
  description: "",
  assignable: "",
};

const buildErrorList = (errors) =>
  Object.entries(errors)
    .filter(([, message]) => Boolean(message))
    .map(([key, message]) => ({
      html: message,
      ...(key !== "save" && { href: `#${key}` }),
    }));
