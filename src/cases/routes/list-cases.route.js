import { logger } from "../../common/logger.js";
import { findAllCasesUseCase } from "../use-cases/find-all-cases.use-case.js";
import { createCaseListViewModel } from "../view-models/case-list.view-model.js";

export const listCasesRoute = {
  method: "GET",
  path: "/cases",
  async handler(request, h) {
    const { assignedCaseId } = request.query;

    logger.info(`Find users assigned to case ${assignedCaseId}`);

    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    const cases = await findAllCasesUseCase(authContext);

    const viewModel = createCaseListViewModel(cases, assignedCaseId);

    logger.info(`Finished: Find users assigned to case ${assignedCaseId}`);

    return h.view("pages/case-list", viewModel);
  },
};
