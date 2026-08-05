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

const validateMaxLength = (value, { maxlength, label }) =>
  maxlength !== undefined && value.length > maxlength
    ? `${getLabelText(label)} must be ${maxlength} characters or fewer`
    : null;

// Anchored to match the whole value, mirroring the backend. Keep the two in
// step or a value passes here and comes back a 400.
const validatePattern = (value, { pattern, label }) =>
  pattern !== undefined && !new RegExp(`^(?:${pattern})$`).test(value)
    ? `Enter ${getLabelText(label)} in the correct format`
    : null;

const validateTextInput = (value, input) =>
  validateMaxLength(value, input) ?? validatePattern(value, input);

const isOutOfRange = (numericValue, { min, max }) =>
  (min !== undefined && numericValue < min) ||
  (max !== undefined && numericValue > max);

const rangeMessage = ({ min, max, label }) => {
  if (min === undefined) {
    return `${getLabelText(label)} must be ${max} or less`;
  }

  if (max === undefined) {
    return `${getLabelText(label)} must be ${min} or more`;
  }

  return `Enter a number between ${min} and ${max}`;
};

const validateNumberInput = (value, input) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return `${getLabelText(input.label)} must be a number`;
  }

  return isOutOfRange(numericValue, input) ? rangeMessage(input) : null;
};

const isRealDate = (value) => {
  const parsed = new Date(`${value}T00:00:00Z`);

  return (
    !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value)
  );
};

const validateDateInput = (value) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) && isRealDate(value)
    ? null
    : "Enter a valid date";

const inputValidators = {
  text: validateTextInput,
  number: validateNumberInput,
  date: validateDateInput,
};

const validateInput = (task, value) => {
  if (value === null) {
    return task.mandatory ? `Enter ${getLabelText(task.input.label)}` : null;
  }

  return inputValidators[task.input.type](value, task.input);
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

    // Input tasks have no outcomes, so no value option and no outcome comment.
    if (task?.input) {
      const message = validateInput(task, value);

      if (message) {
        errors.value = { text: message, href: "#value" };
        setFlashData(request, { errors, formData: { value } });
        return h.redirect(
          `/cases/${caseId}/tasks/${taskGroupCode}/${taskCode}`,
        );
      }
    } else {
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

  // An empty input field posts "", and the API rejects "" - Joi.string() does
  // not allow it. null is how a value is cleared.
  const submittedValue = value === "" ? null : value;

  return {
    caseId,
    taskGroupCode,
    taskCode,
    completed,
    value: submittedValue,
    comment: extractComment(request.payload, submittedValue),
  };
};
