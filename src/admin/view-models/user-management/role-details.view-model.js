import { toStringOrEmpty } from "../../../common/helpers/string-helpers.js";
import { createHeaderViewModel } from "../../../common/view-models/header.view-model.js";

export const createRoleDetailsViewModel = ({
  page,
  request,
  role,
  roleCode,
  errors = {},
  formData = {},
}) => {
  const roleData = resolveRoleData(role);
  const code = resolveRoleCode(roleCode, roleData);
  const heading = buildHeading(code);
  const breadcrumbs = buildBreadcrumbs(code);
  const form = buildFormData({
    formData,
    roleData,
  });

  return {
    pageTitle: heading,
    pageHeading: heading,
    header: createHeaderViewModel({ page, request }),
    breadcrumbs,
    data: {
      roleCode: code,
      form,
      formAction: `/admin/user-management/roles/${code}`,
      cancelHref: "/admin/user-management/roles",
    },
    errors,
    errorList: buildErrorList(errors),
  };
};

const resolveRoleData = (role) => role?.data ?? role ?? {};

const resolveRoleCode = (roleCode, roleData) => roleCode ?? roleData.code ?? "";

const buildHeading = (code) => (code ? `Update ${code}` : "Update role");

const buildBreadcrumbs = (code) => [
  { text: "User management", href: "/admin" },
  { text: "Roles", href: "/admin/user-management/roles" },
  { text: code || "Role details" },
];

const buildFormData = ({ formData, roleData }) => ({
  description: readFormValue({
    formData,
    field: "description",
    fallback: roleData.description,
  }),
  assignable: readAssignableValue({
    formData,
    fallback: roleData.assignable,
  }),
});

const readFormValue = ({ formData, field, fallback }) => {
  if (Object.hasOwn(formData, field)) {
    return toStringOrEmpty(formData[field]);
  }

  return toStringOrEmpty(fallback);
};

const readAssignableValue = ({ formData, fallback }) => {
  if (Object.hasOwn(formData, "assignable")) {
    return toStringOrEmpty(formData.assignable);
  }
  return fallback ? "true" : "false";
};

const buildErrorList = (errors) =>
  Object.entries(errors)
    .filter(([, message]) => Boolean(message))
    .map(([key, message]) => ({
      text: message,
      ...(key !== "save" && { href: `#${key}` }),
    }));
