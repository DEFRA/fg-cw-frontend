import { createHeaderViewModel } from "../../../common/view-models/header.view-model.js";
import { createUserRolesTableViewModel } from "./user-roles-table.view-model.js";

export const createUserRolesViewModel = ({
  page,
  request,
  roles,
  userId,
  errors,
  formData,
}) => {
  const user = page.data;
  const safeErrors = errors || {};
  const rolesTableViewModel = createUserRolesTableViewModel({
    user,
    roles: mapRolesData(roles),
    errors: safeErrors,
    formData,
  });

  return {
    pageTitle: "User roles",
    header: createHeaderViewModel({ page, request }),
    breadcrumbs: [
      { text: "Users", href: "/admin/user-management/users" },
      { text: "User details", href: `/admin/user-management/users/${userId}` },
      { text: "User roles" },
    ],
    backLink: `/admin/user-management/users/${userId}`,
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

const mapRolesData = (roles) => roles?.data ?? [];
