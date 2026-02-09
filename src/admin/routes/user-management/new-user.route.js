import { verifyAdminAccessUseCase } from "../../../auth/use-cases/verify-admin-access.use-case.js";
import { logger } from "../../../common/logger.js";
import { createCreateUserViewModel } from "../../view-models/user-management/create-user.view-model.js";

export const newUserRoute = {
  method: "GET",
  path: "/admin/user-management/users/new",
  async handler(request, h) {
    logger.info("Loading create user page");

    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    const page = await verifyAdminAccessUseCase(authContext);
    const viewModel = createCreateUserViewModel({ page, request });

    logger.info("Finished: Loading create user page");

    return h.view("pages/user-management/create-user", viewModel);
  },
};
