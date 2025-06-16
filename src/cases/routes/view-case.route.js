import { findCaseByIdUseCase } from "../use-cases/find-case-by-id.use-case.js";
import { createCaseDetailViewModel } from "../view-models/case-detail.view-model.js";

export const viewCaseRoute = {
  method: "GET",
  path: "/cases/{caseId}/case-details",
  async handler(request, h) {
    const { caseId } = request.params;

    const caseData = await findCaseByIdUseCase(caseId);

    const viewModel = createCaseDetailViewModel(caseData);

    return h.view("pages/case-detail", viewModel);
  },
};
