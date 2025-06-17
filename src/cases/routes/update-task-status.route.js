import { updateTaskStatusUseCase } from "../use-cases/update-task-status.use-case.js";

export const updateTaskStatusRoute = {
  method: "POST",
  path: "/cases/{caseId}/stages/{stageId}/task-groups/{taskGroupId}/tasks/{taskId}/status",
  handler: async (request, h) => {
    const { caseId, taskGroupId, taskId, stageId } = request.params;
    const { isComplete = false } = request.payload;

    await updateTaskStatusUseCase({
      caseId,
      stageId,
      taskGroupId,
      taskId,
      isComplete: !!isComplete,
    });

    return h.redirect(`/cases/${caseId}`);
  },
};
