import { toStringOrEmpty } from "../../../common/helpers/string-helpers.js";
import {
  hasValidationErrors,
  isForbidden,
} from "../../../common/helpers/validation-helpers.js";
import {
  validateRoleAssignable,
  validateRoleDescription,
} from "../../../common/helpers/role-validation-helpers.js";
import { logger } from "../../../common/logger.js";
import { findRoleUseCase } from "../../use-cases/find-role.use-case.js";
import { updateRoleUseCase } from "../../use-cases/update-role.use-case.js";
import { createRoleDetailsViewModel } from "../../view-models/user-management/role-details.view-model.js";

const SAVE_ERROR_MESSAGE =
  "There was a problem saving the role. Please try again.";

export const saveRoleRoute = {
  method: "POST",
  path: "/admin/user-management/roles/{roleCode}",
  async handler(request, h) {
    const { roleCode } = request.params;
    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    const formData = request.payload || {};

    const role = await findRoleUseCase(authContext, roleCode);
    const errors = validateForm(formData);

    if (hasValidationErrors(errors)) {
      return renderRolePage(h, {
        role,
        roleCode,
        request,
        errors,
        formData,
      });
    }

    const roleUpdate = mapFormData(formData);
    return await persistRoleOrRenderError(request, h, {
      authContext,
      role,
      roleCode,
      roleUpdate,
      formData,
    });
  },
};

const validateForm = ({ description, assignable }) => {
  return {
    description: validateRoleDescription(description),
    assignable: validateRoleAssignable(assignable),
  };
};

const mapFormData = ({ description, assignable }) => {
  return {
    description: toStringOrEmpty(description),
    assignable: toStringOrEmpty(assignable) === "true",
  };
};

const persistRoleOrRenderError = async (
  request,
  h,
  { authContext, role, roleCode, roleUpdate, formData },
) => {
  try {
    logger.info(`Saving role ${roleCode}`);
    await updateRoleUseCase(authContext, roleCode, roleUpdate);
    logger.info(`Finished: Saving role ${roleCode}`);
    return h.redirect("/admin/user-management/roles");
  } catch (error) {
    request.log("error", {
      message: "Failed to save role",
      roleCode,
      error: error.message,
      stack: error.stack,
    });

    if (isForbidden(error)) {
      throw error;
    }

    return renderRolePage(h, {
      role,
      roleCode,
      request,
      errors: { save: SAVE_ERROR_MESSAGE },
      formData,
    });
  }
};

const renderRolePage = (h, { role, roleCode, request, errors, formData }) => {
  const viewModel = createRoleDetailsViewModel({
    page: role,
    request,
    role,
    roleCode,
    errors,
    formData,
  });

  return h.view("pages/user-management/role-details", viewModel);
};
