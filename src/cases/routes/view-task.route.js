import { findCaseByIdUseCase } from "../use-cases/find-case-by-id.use-case.js";
import { createTaskDetailViewModel } from "../view-models/task-detail.view-model.js";

export const viewTaskRoute = {
  method: "GET",
  path: "/cases/{caseId}/tasks/{taskGroupCode}/{taskCode}",
  async handler(request, h) {
    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    const errors = request.yar.flash("errors");

    const caseData = await findCaseByIdUseCase(
      authContext,
      request.params.caseId,
      "task",
    );

    const roles = authContext.user.appRoles;

    const viewModel = createTaskDetailViewModel(
      caseData,
      request.params,
      roles,
      errors,
    );

    return h.view("pages/task-detail", viewModel);
  },
};
