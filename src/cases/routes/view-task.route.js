import { findCaseByIdUseCase } from "../use-cases/find-case-by-id.use-case.js";
import { createTaskDetailViewModel } from "../view-models/task-detail.view-model.js";

export const viewTaskRoute = {
  method: "GET",
  path: "/cases/{caseId}/tasks/{taskGroupId}/{taskId}",
  async handler(request, h) {
    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    const errors = request.yar.flash("errors");

    const caseData = await findCaseByIdUseCase(
      authContext,
      request.params.caseId,
    );

    const viewModel = createTaskDetailViewModel(
      caseData,
      request.params,
      errors,
    );

    return h.view("pages/task-detail", viewModel);
  },
};
