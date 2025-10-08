import { findCaseTabUseCase } from "../../use-cases/find-case-tab.use-case.js";
import { createViewTabViewModel } from "../../view-models/view-tab.view-model.js";

export const viewCaseTabRoute = {
  method: "GET",
  path: "/cases/{caseId}/{tabId}",
  async handler(request, h) {
    const { caseId, tabId } = request.params;

    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    const tabData = await findCaseTabUseCase(authContext, caseId, tabId);
    const viewModel = createViewTabViewModel(tabData, tabId);

    return h.view(`pages/view-tab`, viewModel);
  },
};
