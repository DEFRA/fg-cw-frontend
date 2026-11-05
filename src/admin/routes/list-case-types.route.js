import { logger } from "../../common/logger.js";
import { getCaseTypesUseCase } from "../use-cases/get-case-types.use-case.js";
import { createCaseTypeListViewModel } from "../view-models/case-type-list.view-model.js";

export const listCaseTypesRoute = {
  method: "GET",
  path: "/case-types",
  async handler(request, h) {
    logger.info("Finding all case types");

    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    const page = await getCaseTypesUseCase(authContext);
    const viewModel = createCaseTypeListViewModel({ page, request });

    logger.info("Finished: Finding all case types");

    return h.view("pages/case-type-list", viewModel);
  },
};
