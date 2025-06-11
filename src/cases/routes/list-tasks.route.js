import { findCaseByIdUseCase } from "../use-cases/find-case-by-id.use-case.js";
import { createTaskListViewModel } from "../view-models/task-list.view-model.js";

export const listTasksRoute = {
  method: "GET",
  path: "/cases/{caseId}",
  async handler(request, h) {
    const caseData = await findCaseByIdUseCase(request.params.caseId);

    const viewModel = createTaskListViewModel(caseData);

    return h.view("pages/task-list", viewModel);
  },
};
