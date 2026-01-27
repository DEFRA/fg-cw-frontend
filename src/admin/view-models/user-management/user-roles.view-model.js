import { createUserRolesTableViewModel } from "./user-roles-table.view-model.js";

export const createUserRolesViewModel = ({
  user,
  roles,
  userId,
  errors,
  formData,
}) => {
  const safeErrors = errors || {};
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

const buildErrorList = (errors) =>
  Object.entries(errors)
    .filter(([, message]) => Boolean(message))
    .map(([key, message]) => ({
      text: message,
      ...(key !== "save" && { href: `#${key}` }),
    }));
