import { adminFindUserByIdUseCase } from "../../../auth/use-cases/admin-find-user-by-id.use-case.js";
import { logger } from "../../../common/logger.js";
import { createUserDetailsViewModel } from "../../view-models/user-management/user-details.view-model.js";

export const viewUserRoute = {
  method: "GET",
  path: "/admin/user-management/{id}",
  async handler(request, h) {
    const { id } = request.params;
    logger.info(`Viewing User details ${id}`);

    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    const page = await adminFindUserByIdUseCase(authContext, id);
    const viewModel = createUserDetailsViewModel({
      page,
      request,
      currentUser: authContext.user,
    });

    logger.info(`Finished: Viewing User details ${id}`);

    return h.view("pages/user-management/user-details", viewModel);
  },
};
