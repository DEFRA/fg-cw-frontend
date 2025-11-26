import { findCaseByIdUseCase } from "../../use-cases/find-case-by-id.use-case.js";
import { createNewNoteViewModel } from "../../view-models/notes/new-note.view-model.js";
import { logger } from "../../../common/logger.js";

export const newNoteRoute = {
  method: "GET",
  path: "/cases/{caseId}/notes/new",
  handler: async (request, h) => {
    logger.info("Adding new note");

    const { caseId } = request.params;

    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    const caseData = await findCaseByIdUseCase(authContext, caseId);
    const viewModel = createNewNoteViewModel(caseData);

    logger.debug("Finished adding new note");

    return h.view(`pages/notes/new-note`, viewModel);
  },
};
