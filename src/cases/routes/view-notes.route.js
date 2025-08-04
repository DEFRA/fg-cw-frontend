import { findCaseByIdUseCase } from "../use-cases/find-case-by-id.use-case.js";
import { createNotesViewModel } from "../view-models/notes.view-model.js";

export const viewNotesRoute = {
  method: "GET",
  path: "/cases/{caseId}/notes",
  async handler(request, h) {
    const { caseId } = request.params;

    const caseData = await findCaseByIdUseCase(caseId);

    const viewModel = createNotesViewModel(caseData);

    return h.view(`pages/notes`, viewModel);
  },
};
