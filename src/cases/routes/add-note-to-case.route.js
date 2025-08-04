import { addNoteToCaseUseCase } from "../use-cases/add-note-to-case.use-case.js";

export const addNoteToCaseRoute = {
  method: "POST",
  path: "/cases/{caseId}/notes",
  handler: async (request, h) => {
    const { caseId } = request.params;

    await addNoteToCaseUseCase({ caseId, ...request.payload });

    return h.redirect(`/cases/${caseId}/notes`);
  },
};
