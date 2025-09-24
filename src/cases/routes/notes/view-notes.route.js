import { findCaseByIdUseCase } from "../../use-cases/find-case-by-id.use-case.js";
import { createViewNotesViewModel } from "../../view-models/notes/view-notes.view-model.js";

export const viewNotesRoute = {
  method: "GET",
  path: "/cases/{caseId}/notes",
  async handler(request, h) {
    const { caseId } = request.params;
    const { selectedNoteRef } = request.query;

    const caseData = await findCaseByIdUseCase(caseId);

    const viewModel = createViewNotesViewModel(caseData, selectedNoteRef);

    return h.view(`pages/notes/view-notes`, viewModel);
  },
};
