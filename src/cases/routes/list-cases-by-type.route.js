import { getFlashValue } from "../../common/helpers/flash-helpers.js";
import { logger } from "../../common/logger.js";
import { findAllCasesUseCase } from "../use-cases/find-all-cases.use-case.js";
import { createCaseListByTypeViewModel } from "../view-models/case-list-by-type.view-model.js";

export const listCasesByTypeRoute = {
  method: "GET",
  path: "/types/{caseType}/cases",
  async handler(request, h) {
    const { caseType } = request.params;

    if ("search" in request.query && !request.query.search) {
      return h.redirect(`/types/${caseType}/cases`);
    }

    const assignedCaseId = getFlashValue(request, "assignedCaseId");
    if (assignedCaseId) {
      logger.info(`Assigned user to case ${assignedCaseId}`);
    }

    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    const query = { ...request.query, caseType };

    const page = await findAllCasesUseCase(authContext, query);

    const viewModel = createCaseListByTypeViewModel({
      page,
      request,
      caseType,
      assignedCaseId,
    });

    return h.view("pages/case-list-by-type", viewModel);
  },
};
