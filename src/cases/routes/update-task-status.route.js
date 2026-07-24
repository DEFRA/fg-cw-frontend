import { setFlashData } from "../../common/helpers/flash-helpers.js";
import { getLabelText } from "../../common/helpers/string-helpers.js";
import { logger } from "../../common/logger.js";
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

const validateValueOptions = (valueOptions, value) => {
  if (valueOptions?.length > 0 && !value) {
    return false;
  }

  return true;
};

export const updateTaskStatusRoute = {
  method: "POST",
  path: "/cases/{caseId}/task-groups/{taskGroupCode}/tasks/{taskCode}/value",
  // eslint-disable-next-line complexity
  handler: async (request, h) => {
    const { caseId, taskGroupCode, taskCode, completed, value, comment } =
      mapRequest(request);

    logger.info(
      `Updating task value for case ${caseId} for taskCode ${taskCode} with value ${value}`,
    );

    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    const page = await findCaseByIdUseCase(authContext, caseId);
    const task = findTask(page.data, taskGroupCode, taskCode);

    const errors = {};

    const commentFieldName = value ? `${value}-comment` : "comment";

    // find valueOption
    const valueOption = task.valueOptions?.find((so) => so.code === value);
    const commentInputDef =
      valueOption?.commentInputDef ?? task?.commentInputDef;

    // Only validate comment if a value option has been selected
    if (value && !validateComment(commentInputDef, comment)) {
      errors[commentFieldName] = {
        text: commentInputDef?.label
          ? `${getLabelText(commentInputDef.label)} is required`
          : "Note is required",
        href: `#${commentFieldName}`,
      };
    }

    if (!validateValueOptions(task?.valueOptions, value)) {
      errors.value = {
        text: "Choose an option",
        href: "#value",
      };
    }

    if (Object.keys(errors).length > 0) {
      setFlashData(request, {
        errors,
        formData: { completed, value, [commentFieldName]: comment },
      });
      return h.redirect(`/cases/${caseId}/tasks/${taskGroupCode}/${taskCode}`);
    }

    await updateTaskStatusUseCase(authContext, {
      caseId,
      taskGroupCode,
      taskCode,
      value,
      completed,
      comment,
    });

    logger.info(
      `Finished: Updating task value for case ${caseId} for taskCode ${taskCode} with value ${value}`,
    );

    return h.redirect(`/cases/${caseId}`);
  },
};

const extractComment = (payload, value) => {
  const commentFieldName = value ? `${value}-comment` : "comment";
  return payload[commentFieldName] || null;
};

const mapRequest = (request) => {
  const { caseId, taskGroupCode, taskCode } = request.params;
  const { completed = false, value = null } = request.payload;

  return {
    caseId,
    taskGroupCode,
    taskCode,
    completed,
    value,
    comment: extractComment(request.payload, value),
  };
};
