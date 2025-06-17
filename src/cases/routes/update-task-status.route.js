import { findCaseByIdUseCase } from "../use-cases/find-case-by-id.use-case.js";
import { updateTaskStatusUseCase } from "../use-cases/update-task-status.use-case.js";

export const updateTaskStatusRoute = {
  method: "POST",
  path: "/cases/{caseId}/tasks/{taskGroupId}/{taskId}",
  handler: async (request, h) => {
    const { caseId, taskGroupId, taskId } = request.params;
    const { isComplete = false } = request.payload;

    const { currentStage } = await findCaseByIdUseCase(caseId);

    await updateTaskStatusUseCase({
      caseId,
      stageId: currentStage,
      taskGroupId,
      taskId,
      isComplete: !!isComplete,
    });

    return h.redirect(`/cases/${caseId}`);
  },
};
