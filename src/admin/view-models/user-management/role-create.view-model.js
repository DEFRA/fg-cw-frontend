import { createHeaderViewModel } from "../../../common/view-models/header.view-model.js";

export const createNewRoleViewModel = (options = {}) => {
  const { page, request, formData, errors } = options;
  const safeErrors = errors || {};
  const safeFormData = { ...defaultFormData, ...formData };

  return {
    pageTitle: "Create role",
    pageHeading: "Create role",
    header: createHeaderViewModel({ page, request }),
    breadcrumbs: [
      { text: "User management", href: "/admin" },
      { text: "Roles", href: "/admin/user-management/roles" },
      { text: "Create role" },
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
      text: message,
      ...(key !== "save" && { href: `#${key}` }),
    }));
