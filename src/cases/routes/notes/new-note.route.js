import { findCaseByIdUseCase } from "../../use-cases/find-case-by-id.use-case.js";
import { createNewNoteViewModel } from "../../view-models/notes/new-note.view-model.js";

export const newNoteRoute = {
  method: "GET",
  path: "/cases/{caseId}/notes/new",
  handler: async (request, h) => {
    const { caseId } = request.params;

    const caseData = await findCaseByIdUseCase(caseId);
    const viewModel = createNewNoteViewModel(caseData);

    return h.view(`pages/notes/new-note`, viewModel);
  },
};
