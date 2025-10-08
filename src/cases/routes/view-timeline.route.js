import { findCaseByIdUseCase } from "../use-cases/find-case-by-id.use-case.js";
import { createTimelineViewModel } from "../view-models/timeline.view-model.js";

export const timelineRoute = {
  method: "GET",
  path: "/cases/{caseId}/timeline",
  async handler(request, h) {
    const { caseId } = request.params;
    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    const caseData = await findCaseByIdUseCase(authContext, caseId);

    const viewModel = createTimelineViewModel(caseData);

    return h.view("pages/timeline", viewModel);
  },
};
