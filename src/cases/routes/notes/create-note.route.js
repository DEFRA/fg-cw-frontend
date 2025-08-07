import { addNoteToCaseUseCase } from "../../use-cases/add-note-to-case.use-case.js";
import { findCaseByIdUseCase } from "../../use-cases/find-case-by-id.use-case.js";
import { createViewNotesViewModel } from "../../view-models/notes/view-notes.view-model.js";

export const createNoteRoute = {
  method: "POST",
  path: "/cases/{caseId}/notes",
  handler: async (request, h) => {
    const { caseId } = request.params;
    const { text } = request.payload;

    if (!text || text.trim() === "") {
      const caseData = await findCaseByIdUseCase(caseId);
      const viewModel = createViewNotesViewModel(caseData, {
        text: "You must enter a note",
      });
      return h.view(`pages/notes/new-note`, viewModel);
    }

    await addNoteToCaseUseCase({ caseId, ...request.payload });

    return h.redirect(`/cases/${caseId}/notes`);
  },
};
