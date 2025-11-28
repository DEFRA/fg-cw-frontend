import { setFlashData } from "../../common/helpers/flash-helpers.js";
import { findCaseByIdUseCase } from "../use-cases/find-case-by-id.use-case.js";
import { updateTaskStatusUseCase } from "../use-cases/update-task-status.use-case.js";

const findTask = (kase, taskGroupCode, taskCode) =>
  kase.stage.taskGroups
    .find((tg) => tg.code === taskGroupCode)
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
  path: "/cases/{caseId}/task-groups/{taskGroupCode}/tasks/{taskCode}/status",
  // eslint-disable-next-line complexity
  handler: async (request, h) => {
    const { caseId, taskGroupCode, taskCode, completed, status, comment } =
      mapRequest(request);

    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    const kase = await findCaseByIdUseCase(authContext, caseId);
    const task = findTask(kase, taskGroupCode, taskCode);

    const errors = {};

    const commentFieldName = status ? `${status}-comment` : "comment";

    if (!validateComment(task?.commentInputDef, comment)) {
      errors[commentFieldName] = {
        text: task?.commentInputDef?.label
          ? `${task.commentInputDef.label} is required`
          : "Note is required",
        href: `#${commentFieldName}`,
      };
    }

    if (!validateStatusOptions(task?.statusOptions, status)) {
      errors.status = {
        text: "Choose an option",
        href: "#status",
      };
    }

    if (Object.keys(errors).length > 0) {
      setFlashData(request, {
        errors,
        formData: { completed, status, [commentFieldName]: comment },
      });
      return h.redirect(`/cases/${caseId}/tasks/${taskGroupCode}/${taskCode}`);
    }

    await updateTaskStatusUseCase(authContext, {
      caseId,
      taskGroupCode,
      taskCode,
      status,
      completed,
      comment,
    });

    return h.redirect(`/cases/${caseId}`);
  },
};

const extractComment = (payload, status) => {
  const commentFieldName = status ? `${status}-comment` : "comment";
  return payload[commentFieldName] || null;
};

const mapRequest = (request) => {
  const { caseId, taskGroupCode, taskCode } = request.params;
  const { completed = false, status = null } = request.payload;

  return {
    caseId,
    taskGroupCode,
    taskCode,
    completed,
    status,
    comment: extractComment(request.payload, status),
  };
};
