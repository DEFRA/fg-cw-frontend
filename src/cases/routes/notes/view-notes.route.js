import { findCaseByIdUseCase } from "../../use-cases/find-case-by-id.use-case.js";
import { createViewNotesViewModel } from "../../view-models/notes/view-notes.view-model.js";

export const viewNotesRoute = {
  method: "GET",
  path: "/cases/{caseId}/notes",
  async handler(request, h) {
    const { caseId } = request.params;
    const { selectedNoteRef } = request.query;

    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    const caseData = await findCaseByIdUseCase(authContext, caseId, "notes");

    const viewModel = createViewNotesViewModel(caseData, selectedNoteRef);

    return h.view(`pages/notes/view-notes`, viewModel);
  },
};
