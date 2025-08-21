import { findCaseByIdUseCase } from "../use-cases/find-case-by-id.use-case.js";
import { updateTaskStatusUseCase } from "../use-cases/update-task-status.use-case.js";

const findTask = (kase, stageId, taskGroupId, taskId) => {
  const stage = kase.stages.find((s) => s.id === stageId);
  const taskGroup = stage.taskGroups.find((tg) => tg.id === taskGroupId);
  const task = taskGroup?.tasks.find((t) => t.id === taskId);
  return task;
};

const validateComment = (taskComment, comment) => {
  if (taskComment?.type === "REQUIRED" && !comment) return false;

  return true;
};

export const updateTaskStatusRoute = {
  method: "POST",
  path: "/cases/{caseId}/stages/{stageId}/task-groups/{taskGroupId}/tasks/{taskId}/status",

  handler: async (request, h) => {
    const { caseId, taskGroupId, taskId, stageId } = request.params;
    const { isComplete = false, comment = null } = request.payload;

    const kase = await findCaseByIdUseCase(caseId);
    const task = findTask(kase, stageId, taskGroupId, taskId);

    // ensure comment has a value if it is required...
    if (!validateComment(task.comment, comment)) {
      return h.redirect(
        `/cases/${caseId}/tasks/${taskGroupId}/${taskId}?error=Note%20is%20required`,
      );
    }

    await updateTaskStatusUseCase({
      caseId,
      stageId,
      taskGroupId,
      taskId,
      isComplete: !!isComplete,
      comment,
    });

    return h.redirect(`/cases/${caseId}`);
  },
};
