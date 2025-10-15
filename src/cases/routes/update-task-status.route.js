import { findCaseByIdUseCase } from "../use-cases/find-case-by-id.use-case.js";
import { updateTaskStatusUseCase } from "../use-cases/update-task-status.use-case.js";

const findTask = (kase, stageCode, taskGroupCode, taskCode) => {
  const stage = kase.stages.find((s) => s.code === stageCode);
  const taskGroup = stage.taskGroups.find((tg) => tg.code === taskGroupCode);
  const task = taskGroup?.tasks.find((t) => t.code === taskCode);
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
  path: "/cases/{caseId}/stages/{stageCode}/task-groups/{taskGroupCode}/tasks/{taskCode}/status",
  handler: async (request, h) => {
    const { caseId, taskGroupCode, taskCode, stageCode } = request.params;
    const { isComplete = false, comment = null } = request.payload;

    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    const kase = await findCaseByIdUseCase(authContext, caseId);
    const task = findTask(kase, stageCode, taskGroupCode, taskCode);

    // ensure comment has a value if it is required...
    if (!validateComment(task.comment, comment)) {
      request.yar.flash("errors", {
        text: "Note is required",
        href: "#comment",
      });
      return h.redirect(`/cases/${caseId}/tasks/${taskGroupCode}/${taskCode}`);
    }

    await updateTaskStatusUseCase(authContext, {
      caseId,
      stageCode,
      taskGroupCode,
      taskCode,
      isComplete: !!isComplete,
      comment,
    });

    return h.redirect(`/cases/${caseId}`);
  },
};
