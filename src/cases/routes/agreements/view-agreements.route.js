import { findCaseAgreementsByIdUseCase } from "../../use-cases/find-case-agreements-by-id.use-case.js";
import { createViewAgreementsViewModel } from "../../view-models/agreements/view-agreements.view-model.js";

export const viewAgreementsRoute = {
  method: "GET",
  path: "/cases/{caseId}/agreements",
  async handler(request, h) {
    const { caseId } = request.params;

    const agreementsData = await findCaseAgreementsByIdUseCase(caseId);

    const viewModel = createViewAgreementsViewModel(agreementsData);

    return h.view(`pages/agreements/view-agreements`, viewModel);
  },
};
