import { verifyAdminAccessUseCase } from "../../../auth/use-cases/verify-admin-access.use-case.js";
import { logger } from "../../../common/logger.js";
import { statusCodes } from "../../../common/status-codes.js";
import { createRoleUseCase } from "../../use-cases/create-role.use-case.js";
import { createNewRoleViewModel } from "../../view-models/user-management/role-create.view-model.js";

const CODE_PATTERN = /^ROLE_[A-Z0-9_]+$/;
const SAVE_ERROR_MESSAGE =
  "There was a problem creating the role. Please try again.";

export const createRoleRoute = {
  method: "POST",
  path: "/admin/user-management/roles/new",
  async handler(request, h) {
    logger.info("Creating new role");

    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    await verifyAdminAccessUseCase(authContext);

    const formData = request.payload || {};
    const { roleData, errors } = validateForm(formData);

    if (hasValidationErrors(errors)) {
      return renderCreateRolePage(h, { errors, formData });
    }

    return await persistRoleOrRenderError(request, h, {
      authContext,
      roleData,
      formData,
    });
  },
};

const validateForm = (formData) => {
  const errors = {};

  const codeRaw = toTrimmed(formData.code);
  const descriptionRaw = toTrimmed(formData.description);
  const assignableRaw = toTrimmed(formData.assignable);

  if (!codeRaw) {
    errors.code = "Enter a role code";
  } else if (!CODE_PATTERN.test(codeRaw)) {
    errors.code =
      "Role code must start with ROLE_ and use only uppercase letters, numbers, and underscores";
  }

  if (!descriptionRaw) {
    errors.description = "Enter a role description";
  }

  if (!isAssignableValue(assignableRaw)) {
    errors.assignable = "Select whether the role is assignable";
  }

  const roleData = {
    code: codeRaw,
    description: descriptionRaw,
    assignable: assignableRaw === "true",
  };

  return { errors, roleData };
};

const renderCreateRolePage = (h, { errors, formData }) => {
  const viewModel = createNewRoleViewModel({ errors, formData });

  return h.view("pages/user-management/role-create", viewModel);
};

const persistRoleOrRenderError = async (
  request,
  h,
  { authContext, roleData, formData },
) => {
  try {
    await createRoleUseCase(authContext, roleData);
    logger.info(`Finished: Creating role ${roleData.code}`);
    return h.redirect("/admin/user-management/roles");
  } catch (error) {
    request.log("error", {
      message: "Failed to create role",
      roleCode: roleData.code,
      error: error.message,
      stack: error.stack,
    });

    if (isForbidden(error)) {
      throw error;
    }

    const errors = buildErrorsFromFailure(error);

    return renderCreateRolePage(h, { errors, formData });
  }
};

const buildErrorsFromFailure = (error) => {
  if (isConflict(error)) {
    return { code: "Role code already exists" };
  }

  return { save: SAVE_ERROR_MESSAGE };
};

const isAssignableValue = (value) => value === "true" || value === "false";

const toTrimmed = (value) => {
  if (!value) {
    return "";
  }

  return value.toString().trim();
};

const isForbidden = (error) =>
  error?.output?.statusCode === statusCodes.FORBIDDEN;

const isConflict = (error) =>
  error?.output?.statusCode === statusCodes.CONFLICT ||
  error?.statusCode === statusCodes.CONFLICT;

const hasValidationErrors = (errors) => Object.keys(errors).length > 0;
