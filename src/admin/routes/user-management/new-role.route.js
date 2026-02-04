import { verifyAdminAccessUseCase } from "../../../auth/use-cases/verify-admin-access.use-case.js";
import { logger } from "../../../common/logger.js";
import { createNewRoleViewModel } from "../../view-models/user-management/role-create.view-model.js";

export const newRoleRoute = {
  method: "GET",
  path: "/admin/user-management/roles/new",
  async handler(request, h) {
    logger.info("Loading create role page");

    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    const page = await verifyAdminAccessUseCase(authContext);

    const viewModel = createNewRoleViewModel({ page, request });

    logger.info("Finished: Loading create role page");

    return h.view("pages/user-management/role-create", viewModel);
  },
};
