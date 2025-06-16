import { findCaseByIdUseCase } from "../use-cases/find-case-by-id.use-case.js";
import { updateTaskStatusUseCase } from "../use-cases/update-task-status.use-case.js";
import { createTaskDetailViewModel } from "../view-models/task-detail.view-model.js";

export const updateTaskStatusRoute = {
  method: "POST",
  path: "/cases/{caseId}/tasks/{taskGroupId}/{taskId}",
  handler: async (request, h) => {
    const { caseId, taskGroupId } = request.params;
    const { isComplete = false, taskId } = request.payload;

    const { currentStage } = await findCaseByIdUseCase(caseId);

    await updateTaskStatusUseCase({
      caseId,
      stageId: currentStage,
      taskGroupId,
      taskId,
      isComplete: !!isComplete,
    });

    const params = { taskGroupId, taskId };
    const caseData = await findCaseByIdUseCase(caseId);
    const viewModel = await createTaskDetailViewModel(caseData, params);
    return h.view("pages/task-detail", viewModel);
  },
};
