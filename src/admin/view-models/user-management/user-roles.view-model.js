import { createUserRolesTableViewModel } from "./user-roles-table.view-model.js";

export const createUserRolesViewModel = ({
  user,
  roles,
  userId,
  errors,
  formData,
}) => {
  const safeErrors = normaliseErrors(errors);
  const rolesTableViewModel = createUserRolesTableViewModel({
    user,
    roles,
    errors: safeErrors,
    formData,
  });

  return {
    pageTitle: "User roles",
    breadcrumbs: [
      { text: "Users", href: "/admin/user-management" },
      { text: "User details", href: `/admin/user-management/${userId}` },
      { text: "User roles" },
    ],
    backLink: `/admin/user-management/${userId}`,
    data: {
      userId,
      userName: user?.name ?? "",
      roles: rolesTableViewModel,
    },
    errors: safeErrors,
    errorList: buildErrorList(safeErrors),
  };
};

const normaliseErrors = (errors) => {
  if (errors) {
    return errors;
  }

  return {};
};

const buildErrorList = (errors) =>
  Object.entries(errors)
    .map(([key, message]) => toErrorSummaryItem(key, message))
    .filter(Boolean);

const toErrorSummaryItem = (key, message) => {
  if (!message) {
    return null;
  }

  if (key === "save") {
    return { text: message };
  }

  return { text: message, href: `#${key}` };
};
