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
  const selectedRoles = rolesTableViewModel.filter((role) => role.checked);
  const unselectedRoles = rolesTableViewModel.filter((role) => !role.checked);
  const userName = user?.name ?? "";
  const userDetailsHref = `/admin/user-management/users/${userId}`;
  const formAction = `${userDetailsHref}/roles`;

  return {
    pageTitle: `${userName} roles`,
    header: createHeaderViewModel({ page, request }),
    breadcrumbs: [
      { text: "User management", href: "/admin" },
      { text: "Users", href: "/admin/user-management/users" },
      { text: userName, href: userDetailsHref },
      { text: `${userName}'s roles` },
    ],
    backLink: userDetailsHref,
    data: {
      userId,
      userName,
      selectedRoles,
      unselectedRoles,
      formAction,
      cancelHref: userDetailsHref,
      rolesHref: "/admin/user-management/roles",
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
