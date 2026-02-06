import { logger } from "../../../common/logger.js";
import { findRoleUseCase } from "../../use-cases/find-role.use-case.js";
import { createRoleDetailsViewModel } from "../../view-models/user-management/role-details.view-model.js";

export const viewRoleRoute = {
  method: "GET",
  path: "/admin/user-management/roles/{roleCode}",
  async handler(request, h) {
    const { roleCode } = request.params;
    logger.info(`Viewing role ${roleCode}`);

    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    const role = await findRoleUseCase(authContext, roleCode);
    const viewModel = createRoleDetailsViewModel({
      page: role,
      request,
      role,
      roleCode,
    });

    logger.info(`Finished: Viewing role ${roleCode}`);

    return h.view("pages/user-management/role-details", viewModel);
  },
};
