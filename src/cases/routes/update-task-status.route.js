import { findCaseByIdUseCase } from "../use-cases/find-case-by-id.use-case.js";
import { updateTaskStatusUseCase } from "../use-cases/update-task-status.use-case.js";

const findTask = (kase, stageCode, taskGroupId, taskId) => {
  const stage = kase.stages.find((s) => s.code === stageCode);
  const taskGroup = stage.taskGroups.find((tg) => tg.id === taskGroupId);
  const task = taskGroup?.tasks.find((t) => t.id === taskId);
  return task;
};

const validateComment = (taskComment, comment) => {
  if (taskComment?.type === "REQUIRED" && !comment) {
    return false;
  }

  return true;
};

export const updateTaskStatusRoute = {
  method: "POST",
  path: "/cases/{caseId}/stages/{stageCode}/task-groups/{taskGroupId}/tasks/{taskId}/status",
  handler: async (request, h) => {
    const { caseId, taskGroupId, taskId, stageCode } = request.params;
    const { isComplete = false, comment = null } = request.payload;

    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    const kase = await findCaseByIdUseCase(authContext, caseId);
    const task = findTask(kase, stageCode, taskGroupId, taskId);

    // ensure comment has a value if it is required...
    if (!validateComment(task.comment, comment)) {
      request.yar.flash("errors", {
        text: "Note is required",
        href: "#comment",
      });
      return h.redirect(`/cases/${caseId}/tasks/${taskGroupId}/${taskId}`);
    }

    await updateTaskStatusUseCase(authContext, {
      caseId,
      stageCode,
      taskGroupId,
      taskId,
      isComplete: !!isComplete,
      comment,
    });

    return h.redirect(`/cases/${caseId}`);
  },
};
