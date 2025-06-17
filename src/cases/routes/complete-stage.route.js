import { completeStageUseCase } from "../use-cases/complete-stage.use-case.js";
import { findCaseByIdUseCase } from "../use-cases/find-case-by-id.use-case.js";
import { createTaskListViewModel } from "../view-models/task-list.view-model.js";

export const completeStageRoute = {
  method: "POST",
  path: "/cases/{caseId}",
  handler: async (request, h) => {
    const {
      params: { caseId },
    } = request;
    await completeStageUseCase(caseId);

    const caseData = await findCaseByIdUseCase(caseId);
    const viewModel = await createTaskListViewModel(caseData);
    return h.view("pages/task-list", {
      ...viewModel,
    });
  },
};
