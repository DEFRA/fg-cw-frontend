import { logger } from "../../../common/logger.js";
import { findCaseByIdUseCase } from "../../use-cases/find-case-by-id.use-case.js";
import { createNewNoteViewModel } from "../../view-models/notes/new-note.view-model.js";

export const newNoteRoute = {
  method: "GET",
  path: "/cases/{caseId}/notes/new",
  handler: async (request, h) => {
    const { caseId } = request.params;

    logger.info(`Adding new note to case ${caseId}`);

    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    const caseData = await findCaseByIdUseCase(authContext, caseId);
    const viewModel = createNewNoteViewModel(caseData);

    logger.info(`Finished: Adding new note to case ${caseId}`);

    return h.view(`pages/notes/new-note`, viewModel);
  },
};
