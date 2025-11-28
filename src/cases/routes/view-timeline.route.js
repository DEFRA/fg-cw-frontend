import { logger } from "../../common/logger.js";
import { findCaseByIdUseCase } from "../use-cases/find-case-by-id.use-case.js";
import { createTimelineViewModel } from "../view-models/timeline.view-model.js";

export const timelineRoute = {
  method: "GET",
  path: "/cases/{caseId}/timeline",
  async handler(request, h) {
    const { caseId } = request.params;

    logger.info(`Get timeline for case ${caseId}`);

    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    const caseData = await findCaseByIdUseCase(authContext, caseId, "timeline");

    const viewModel = createTimelineViewModel(caseData);

    logger.info(`Finished: Get timeline for case ${caseId}`);

    return h.view("pages/timeline", viewModel);
  },
};
