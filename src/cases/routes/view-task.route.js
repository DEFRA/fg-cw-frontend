import { findCaseByIdUseCase } from "../use-cases/find-case-by-id.use-case.js";
import { createTaskDetailViewModel } from "../view-models/task-detail.view-model.js";

export const viewTaskRoute = {
  method: "GET",
  path: "/cases/{caseId}/tasks/{taskGroupId}/{taskId}",
  async handler(request, h) {
    const caseData = await findCaseByIdUseCase(request.params.caseId);

    const viewModel = createTaskDetailViewModel(caseData, request.params);

    return h.view("pages/task-detail", viewModel);
  },
};
