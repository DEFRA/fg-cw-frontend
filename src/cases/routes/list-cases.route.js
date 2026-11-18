import { getFlashValue } from "../../common/helpers/flash-helpers.js";
import { logger } from "../../common/logger.js";
import { findAllCasesUseCase } from "../use-cases/find-all-cases.use-case.js";
import { findMyCasesUseCase } from "../use-cases/find-my-cases.use-case.js";
import { createCaseListViewModel } from "../view-models/case-list.view-model.js";

export const listCasesRoute = {
  method: "GET",
  path: "/cases",
  async handler(request, h) {
    if ("search" in request.query && !request.query.search) {
      return h.redirect("/cases");
    }

    const assignedCaseId = getFlashValue(request, "assignedCaseId");
    if (assignedCaseId) {
      logger.info(`Assigned user to case ${assignedCaseId}`);
    }

    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    const [page, myCasesPage] = await Promise.all([
      findAllCasesUseCase(authContext, request.query),
      findMyCasesUseCase(authContext, request.query),
    ]);

    const viewModel = createCaseListViewModel({
      page,
      myCasesPage,
      request,
      assignedCaseId,
    });

    return h.view("pages/case-list", viewModel);
  },
};
