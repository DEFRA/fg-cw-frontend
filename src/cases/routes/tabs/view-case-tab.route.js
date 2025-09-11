import { findCaseTabUseCase } from "../../use-cases/find-case-tab-use.case.js";
import { createViewTabViewModel } from "../../view-models/view-tab.view-model.js";

export const viewCaseTabRoute = {
  method: "GET",
  path: "/cases/{caseId}/{tabId}",
  async handler(request, h) {
    const { caseId, tabId } = request.params;

    const agreementsData = await findCaseTabUseCase(caseId, tabId);

    const viewModel = createViewTabViewModel(agreementsData, tabId);

    return h.view(`pages/view-tab`, viewModel);
  },
};
