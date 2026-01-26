import { verifyAdminAccessUseCase } from "../../auth/use-cases/verify-admin-access.use-case.js";
import { logger } from "../../common/logger.js";
import { createAdminLandingViewModel } from "../view-models/admin-landing.view-model.js";

export const adminLandingRoute = {
  method: "GET",
  path: "/admin",
  async handler(request, h) {
    logger.info("Loading admin landing page");

    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    await verifyAdminAccessUseCase(authContext);
    const viewModel = createAdminLandingViewModel();

    logger.info("Finished: Loading admin landing page");

    return h.view("pages/admin-landing", viewModel);
  },
};
