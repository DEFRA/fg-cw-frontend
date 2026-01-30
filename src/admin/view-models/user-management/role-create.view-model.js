export const createNewRoleViewModel = ({ formData, errors } = {}) => {
  const safeErrors = errors || {};
  const safeFormData = formData || {};

  return {
    pageTitle: "Create role",
    pageHeading: "Create role",
    breadcrumbs: [
      { text: "User management", href: "/admin" },
      { text: "Roles", href: "/admin/user-management/roles" },
      { text: "Create role" },
    ],
    data: {
      formData: {
        code: safeFormData.code ?? "",
        description: safeFormData.description ?? "",
        assignable: safeFormData.assignable ?? "",
      },
      cancelHref: "/admin/user-management/roles",
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
