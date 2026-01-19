import { adminFindUsersUseCase } from "../../../auth/use-cases/admin-find-users.use-case.js";
import { logger } from "../../../common/logger.js";
import { createUserListViewModel } from "../../view-models/user-management/user-list.view-model.js";

export const listUsersRoute = {
  method: "GET",
  path: "/admin/user-management",
  async handler(request, h) {
    logger.info("Finding all users for user management");

    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    const users = await adminFindUsersUseCase(authContext, {});
    const viewModel = createUserListViewModel(users);

    logger.info("Finished: Finding all users for user management");

    return h.view("pages/user-management/user-list", viewModel);
  },
};
