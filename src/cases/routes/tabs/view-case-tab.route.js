import { findCaseTabUseCase } from "../../use-cases/find-case-tab.use-case.js";
import { createViewTabViewModel } from "../../view-models/view-tab.view-model.js";
import { logger } from "../../../common/logger.js";

export const viewCaseTabRoute = {
  method: "GET",
  path: "/cases/{caseId}/{tabId}",
  async handler(request, h) {
    const { caseId, tabId } = request.params;

    logger.info(`Get tab ${tabId} for case ${caseId}`);

    const queryString = new URLSearchParams(request.query).toString();

    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    const tabData = await findCaseTabUseCase(
      authContext,
      caseId,
      tabId,
      queryString,
    );
    const viewModel = createViewTabViewModel(tabData, tabId);

    logger.info(`Finished: Get tab ${tabId} for case ${caseId}`);

    return h.view(`pages/view-tab`, viewModel);
  },
};
