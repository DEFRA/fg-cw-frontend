import { getRolesUseCase } from "../../../auth/use-cases/get-roles.use-case.js";
import { logger } from "../../../common/logger.js";
import { createRoleListViewModel } from "../../view-models/user-management/role-list.view-model.js";

export const listRolesRoute = {
  method: "GET",
  path: "/admin/user-management/roles",
  async handler(request, h) {
    logger.info("Finding all roles for role management");

    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    const page = await getRolesUseCase(authContext);
    const viewModel = createRoleListViewModel({ page, request });

    logger.info("Finished: Finding all roles for role management");

    return h.view("pages/user-management/role-list", viewModel);
  },
};
