import {
  hasValidationErrors,
  isForbidden,
} from "../../../common/helpers/validation-helpers.js";
import { logger } from "../../../common/logger.js";
import { buildUserRolesUseCase } from "../../use-cases/build-user-roles.use-case.js";
import { findUserRolesDataUseCase } from "../../use-cases/find-user-roles-data.use-case.js";
import { updateUserRolesUseCase } from "../../use-cases/update-user-roles.use-case.js";
import { createUserRolesViewModel } from "../../view-models/user-management/user-roles.view-model.js";

const SAVE_ERROR_MESSAGE =
  "There was a problem saving roles. Please try again.";

export const saveUserRolesRoute = {
  method: "POST",
  path: "/admin/user-management/users/{id}/roles",
  async handler(request, h) {
    const userId = request.params.id;
    const currentPath = request.path;

    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    const { page, roles } = await findUserRolesDataUseCase(authContext, userId);

    const formData = request.payload || {};
    const currentAppRoles = page?.data?.appRoles;
    const { appRoles, errors } = buildUserRolesUseCase({
      formData,
      currentAppRoles,
    });

    const routeContext = {
      h,
      currentPath,
      userId,
      authContext,
      page,
      roles,
      formData,
    };

    return await saveRoles({
      routeContext,
      appRoles,
      errors,
    });
  },
};

const saveRoles = async ({ routeContext, appRoles, errors }) => {
  if (hasValidationErrors(errors)) {
    return renderRolesPage({ routeContext, errors });
  }

  const { h, authContext, userId } = routeContext;

  try {
    logger.info(`Saving user roles ${userId}`);
    await updateUserRolesUseCase(authContext, userId, appRoles);
    logger.info(`Finished: Saving user roles ${userId}`);
    return h.redirect(`/admin/user-management/users/${userId}`);
  } catch (error) {
    logger.error({
      message: "Failed to save user roles",
      userId,
      error: error.message,
      stack: error.stack,
    });

    if (isForbidden(error)) {
      throw error;
    }

    return renderRolesPage({
      routeContext,
      errors: { save: SAVE_ERROR_MESSAGE },
    });
  }
};

const renderRolesPage = ({ routeContext, errors }) => {
  const { h, currentPath, page, roles, userId, formData } = routeContext;

  const viewModel = createUserRolesViewModel({
    page,
    currentPath,
    roles,
    userId,
    errors,
    formData,
  });

  return h.view("pages/user-management/user-roles", viewModel);
};
