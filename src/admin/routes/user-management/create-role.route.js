import { verifyAdminAccessUseCase } from "../../../auth/use-cases/verify-admin-access.use-case.js";
import { toStringOrEmpty } from "../../../common/helpers/string-helpers.js";
import {
  hasValidationErrors,
  isForbidden,
} from "../../../common/helpers/validation-helpers.js";
import { logger } from "../../../common/logger.js";
import { statusCodes } from "../../../common/status-codes.js";
import { createRoleUseCase } from "../../use-cases/create-role.use-case.js";
import { createNewRoleViewModel } from "../../view-models/user-management/role-create.view-model.js";

export const createRoleRoute = {
  method: "POST",
  path: "/admin/user-management/roles",
  async handler(request, h) {
    logger.info("Creating new role");

    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    const page = await verifyAdminAccessUseCase(authContext);

    const formData = request.payload || {};
    const errors = validateForm(formData);

    if (hasValidationErrors(errors)) {
      return renderCreateRolePage(h, { page, request, errors, formData });
    }

    const roleData = mapFormData(formData);
    return createRole(request, h, {
      authContext,
      page,
      roleData,
      formData,
    });
  },
};

const validateForm = ({ code, description, assignable }) => {
  return {
    code: validateCode(code),
    description: validateDescription(description),
    assignable: validateAssignable(assignable),
  };
};

const mapFormData = ({ code, description, assignable }) => {
  return {
    code: toStringOrEmpty(code).toUpperCase(),
    description: toStringOrEmpty(description),
    assignable: toStringOrEmpty(assignable) === "true",
  };
};

const renderCreateRolePage = (h, { page, request, errors, formData }) => {
  const viewModel = createNewRoleViewModel({
    page,
    request,
    errors,
    formData,
  });

  return h.view("pages/user-management/role-create", viewModel);
};

const createRole = async (
  request,
  h,
  { authContext, page, roleData, formData },
) => {
  try {
    await createRoleUseCase(authContext, roleData);
    logger.info(`Finished: Creating role ${roleData.code}`);
    return h.redirect("/admin/user-management/roles");
  } catch (error) {
    return handleCreateRoleError(request, h, {
      page,
      formData,
      roleData,
      error,
    });
  }
};

const requiredField = (message) => (value) =>
  toStringOrEmpty(value) === "" ? message : null;

const requiredBoolean = (message, allowed) => (value) =>
  allowed.includes(toStringOrEmpty(value)) ? null : message;

const validateCodeCharacters = (message) => (value) => {
  const code = toStringOrEmpty(value).toUpperCase();
  return /^[A-Z0-9][A-Z0-9_]*$/.test(code) ? null : message;
};

const validateCode = (value) =>
  requiredField("Enter a role code")(value) ||
  validateCodeCharacters(
    "Code can only contain letters, numbers and '_' (underscores). <br /> Code cannot start with '_' (underscore).",
  )(value);

const validateDescription = requiredField("Enter a role description");

const validateAssignable = requiredBoolean(
  "Select whether the role is assignable",
  ["true", "false"],
);

const handleCreateRoleError = (
  request,
  h,
  { page, formData, roleData, error },
) => {
  logger.error({
    message: "Failed to create role",
    roleCode: roleData.code,
    error: error.message,
    stack: error.stack,
  });

  if (isForbidden(error)) {
    throw error;
  }

  const errors = buildErrorsFromFailure(error);

  return renderCreateRolePage(h, { page, request, errors, formData });
};

const isConflict = (error) => {
  const statusCodesToCheck = [error?.output?.statusCode, error?.statusCode];

  return statusCodesToCheck.includes(statusCodes.CONFLICT);
};

const buildErrorsFromFailure = (error) => {
  if (isConflict(error)) {
    return { code: "Role code already exists" };
  }

  return { save: "There was a problem creating the role. Please try again." };
};
