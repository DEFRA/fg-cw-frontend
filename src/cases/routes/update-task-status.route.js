import { findCaseByIdUseCase } from "../use-cases/find-case-by-id.use-case.js";
import { updateTaskStatusUseCase } from "../use-cases/update-task-status.use-case.js";

const findTask = (kase, phaseCode, stageCode, taskGroupCode, taskCode) =>
  kase.phases
    .find((p) => p.code === phaseCode)
    .stages.find((s) => s.code === stageCode)
    .taskGroups.find((tg) => tg.code === taskGroupCode)
    .tasks.find((t) => t.code === taskCode);

const validateComment = (taskComment, comment) => {
  if (taskComment?.mandatory && !comment) {
    return false;
  }

  return true;
};

const validateStatusOptions = (statusOptions, status) => {
  if (statusOptions?.length > 0 && !status) {
    return false;
  }

  return true;
};

export const updateTaskStatusRoute = {
  method: "POST",
  path: "/cases/{caseId}/phases/{phaseCode}/stages/{stageCode}/task-groups/{taskGroupCode}/tasks/{taskCode}/status",
  // eslint-disable-next-line complexity
  handler: async (request, h) => {
    const {
      caseId,
      phaseCode,
      stageCode,
      taskGroupCode,
      taskCode,
      completed,
      status,
      comment,
    } = mapRequest(request);

    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    const kase = await findCaseByIdUseCase(authContext, caseId);
    const task = findTask(kase, phaseCode, stageCode, taskGroupCode, taskCode);

    // ensure comment has a value if it is required...
    if (!validateComment(task?.commentInputDef, comment)) {
      request.yar.flash("errors", {
        text: "Note is required",
        href: "#comment",
      });
      return h.redirect(`/cases/${caseId}/tasks/${taskGroupCode}/${taskCode}`);
    }

    // ensure status has a value if it is required...
    if (!validateStatusOptions(task?.statusOptions, status)) {
      request.yar.flash("errors", {
        text: "Status is required",
        href: "#status",
      });
      return h.redirect(`/cases/${caseId}/tasks/${taskGroupCode}/${taskCode}`);
    }

    await updateTaskStatusUseCase(authContext, {
      caseId,
      phaseCode,
      stageCode,
      taskGroupCode,
      taskCode,
      status,
      completed,
      comment,
    });

    return h.redirect(`/cases/${caseId}`);
  },
};

const mapRequest = (request) => {
  const { caseId, phaseCode, stageCode, taskGroupCode, taskCode } =
    request.params;
  const { completed = false, status = null, comment = null } = request.payload;

  return {
    caseId,
    phaseCode,
    stageCode,
    taskGroupCode,
    taskCode,
    completed,
    status,
    comment,
  };
};
