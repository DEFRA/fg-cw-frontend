import { rememberAgreementGrantContexts } from "../../../common/helpers/agreement-grant-context.js";
import { logger } from "../../../common/logger.js";
import { findAgreementGrantContextsUseCase } from "../../use-cases/find-agreement-grant-contexts.use-case.js";
import { findCaseTabUseCase } from "../../use-cases/find-case-tab.use-case.js";
import { createViewTabViewModel } from "../../view-models/view-tab.view-model.js";

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

    const page = await findCaseTabUseCase(
      authContext,
      caseId,
      tabId,
      queryString,
    );

    if (tabId === "agreements") {
      const contexts = await findAgreementGrantContextsUseCase(
        authContext,
        caseId,
      );
      rememberAgreementGrantContexts(request, contexts);
    }

    const viewModel = createViewTabViewModel({ page, request, tabId });

    logger.info(`Finished: Get tab ${tabId} for case ${caseId}`);

    return h.view(`pages/view-tab`, viewModel);
  },
};
