import { logger } from "../../../common/logger.js";
import { findUserRolesDataUseCase } from "../../use-cases/find-user-roles-data.use-case.js";
import { createUserRolesViewModel } from "../../view-models/user-management/user-roles.view-model.js";

export const viewUserRolesRoute = {
  method: "GET",
  path: "/admin/user-management/users/{id}/roles",
  async handler(request, h) {
    const { id } = request.params;
    const currentPath = request.path;
    logger.info(`Viewing user roles ${id}`);

    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    const { page, roles } = await findUserRolesDataUseCase(authContext, id);

    const viewModel = createUserRolesViewModel({
      page,
      currentPath,
      roles,
      userId: id,
    });

    logger.info(`Finished: Viewing user roles ${id}`);

    return h.view("pages/user-management/user-roles", viewModel);
  },
};
