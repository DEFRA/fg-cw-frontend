import { logger } from "../../../common/logger.js";
import { findCaseByIdUseCase } from "../../use-cases/find-case-by-id.use-case.js";
import { createViewNotesViewModel } from "../../view-models/notes/view-notes.view-model.js";

export const viewNotesRoute = {
  method: "GET",
  path: "/cases/{caseId}/notes",
  async handler(request, h) {
    logger.info(`Get notes for case ${request.params.caseId}`);

    const { caseId } = request.params;
    const { selectedNoteRef } = request.query;

    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    const page = await findCaseByIdUseCase(authContext, caseId, "notes");

    const viewModel = createViewNotesViewModel({
      page,
      request,
      selectedNoteRef,
    });

    logger.info(`Finished: Get notes for case ${request.params.caseId}`);

    return h.view(`pages/notes/view-notes`, viewModel);
  },
};
