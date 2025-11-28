import { findAllCasesUseCase } from "../use-cases/find-all-cases.use-case.js";
import { createCaseListViewModel } from "../view-models/case-list.view-model.js";
import { logger } from "../../common/logger.js";

export const listCasesRoute = {
  method: "GET",
  path: "/cases",
  async handler(request, h) {
    const { assignedCaseId } = request.query;

    logger.info(`Get cases assigned to user ${assignedCaseId}`);

    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    const cases = await findAllCasesUseCase(authContext);

    const viewModel = createCaseListViewModel(cases, assignedCaseId);

    logger.info(`Finished: Get cases assigned to user ${assignedCaseId}`);

    return h.view("pages/case-list", viewModel);
  },
};
