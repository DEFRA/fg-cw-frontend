import { findUserByIdUseCase } from "../../../auth/use-cases/find-user-by-id.use-case.js";
import { logger } from "../../../common/logger.js";
import { findRolesUseCase } from "../../use-cases/find-roles.use-case.js";
import { createUserRolesViewModel } from "../../view-models/user-management/user-roles.view-model.js";

export const viewUserRolesRoute = {
  method: "GET",
  path: "/admin/user-management/{id}/roles",
  async handler(request, h) {
    const { id } = request.params;
    logger.info(`Viewing user roles ${id}`);

    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    const [user, roles] = await Promise.all([
      findUserByIdUseCase(authContext, id),
      findRolesUseCase(authContext),
    ]);

    const viewModel = createUserRolesViewModel({ user, roles, userId: id });

    logger.info(`Finished: Viewing user roles ${id}`);

    return h.view("pages/user-management/user-roles", viewModel);
  },
};
