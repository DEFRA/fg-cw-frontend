import { setActiveLink } from "../../common/helpers/navigation-helpers.js";
import { createHeaderViewModel } from "../../common/view-models/header.view-model.js";
import { createLabelObject } from "./task-list.view-model.js";

const getFieldValue = (fieldName, values) => values?.[fieldName];

const createErrorList = (errors) => {
  if (!errors) {
    return [];
  }
  return Object.values(errors);
};

const createConditionalTextarea = ({
  valueCode,
  commentInputDef,
  commentText,
  commentError,
}) => {
  if (!commentInputDef) {
    return undefined;
  }

  const name = `${valueCode}-comment`;
  return {
    id: name,
    name,
    value: commentText,
    label: createLabelObject(commentInputDef.label),
    hint: commentInputDef.helpText
      ? { text: commentInputDef.helpText }
      : undefined,
    required: commentInputDef.mandatory,
    errorMessage: commentError,
    rows: 5,
  };
};

const isCurrentValueWithComment = (
  optionCode,
  currentValue,
  currentTaskComment,
) => {
  return optionCode === currentValue && currentTaskComment;
};

const getInitialCommentValue = ({
  optionCode,
  currentValue,
  currentTaskComment,
  formData,
}) => {
  const commentFieldName = `${optionCode}-comment`;

  const formDataValue = getFieldValue(commentFieldName, formData);
  if (formDataValue !== undefined) {
    return formDataValue;
  }

  if (isCurrentValueWithComment(optionCode, currentValue, currentTaskComment)) {
    return currentTaskComment.text || "";
  }

  return "";
};

export const mapOptions = ({
  options,
  currentValue,
  commentInputDef,
  currentTaskComment,
  formData,
  errors,
}) => {
  if (!options || options.length === 0) {
    return [];
  }

  return options.map((option) => {
    const commentFieldName = `${option.code}-comment`;
    const commentText = getInitialCommentValue({
      optionCode: option.code,
      currentValue,
      currentTaskComment,
      formData,
    });
    const commentError = getFieldValue(commentFieldName, errors);

    const conditional = createConditionalTextarea({
      valueCode: option.code,
      commentInputDef: option.commentInputDef ?? commentInputDef,
      commentText,
      commentError,
    });

    return {
      value: option.code,
      text: option.name,
      checked: option.code === currentValue,
      conditional,
    };
  });
};

const findCurrentTask = (stage, taskGroupCode, taskCode) => {
  const currentGroup = stage.taskGroups.find((g) => g.code === taskGroupCode);
  const currentGroupTasks = currentGroup.tasks;
  return currentGroupTasks.find((t) => t.code === taskCode);
};

const findTaskComment = (comments, commentRef) => {
  return comments.find((c) => c.ref === commentRef) ?? null;
};

const buildCurrentTaskData = ({
  kase,
  currentTask,
  taskGroupCode,
  taskCode,
  currentValue,
  currentTaskComment,
  canComplete,
  formData,
  errors,
}) => {
  return {
    formAction: `/cases/${kase._id}/task-groups/${taskGroupCode}/tasks/${taskCode}/value`,
    description: currentTask.description,
    value: currentValue,
    valueOptions: mapOptions({
      options: currentTask.valueOptions,
      currentValue,
      commentInputDef: currentTask.commentInputDef,
      currentTaskComment,
      formData,
      errors,
    }),
    completed: getFieldValue("completed", formData) ?? currentTask.completed,
    comment: currentTaskComment,
    valueError: errors?.value,
    canComplete,
    requiredRoles: currentTask.requiredRoles,
    updatedBy: currentTask.updatedBy,
    updatedAt: currentTask.updatedAt,
    notesHistory: currentTask.notesHistory ?? [],
  };
};

export const createTaskDetailViewModel = ({
  page,
  request,
  query,
  errors,
  formData,
  hasWriteAccess,
}) => {
  const kase = page.data;
  const stage = kase.stage;
  const { taskGroupCode, taskCode } = query;

  const currentTask = findCurrentTask(stage, taskGroupCode, taskCode);
  const currentTaskComment = findTaskComment(
    kase.comments,
    currentTask.commentRef,
  );
  const canComplete = currentTask.canComplete;
  const isInteractive = stage.interactive ?? true;
  const currentValue = getFieldValue("value", formData) ?? currentTask.value;

  return {
    errorList: createErrorList(errors),
    pageTitle: "Case task",
    pageHeading: "Case",
    header: createHeaderViewModel({ page, request }),
    breadcrumbs: [
      { text: "Cases", href: "/cases" },
      { text: kase.caseRef, href: "/cases/" + kase._id },
    ],
    links: setActiveLink(kase.links, "tasks"),
    data: {
      banner: kase.banner,
      caseId: kase._id,
      isInteractive,
      hasWriteAccess,
      currentTask: buildCurrentTaskData({
        kase,
        currentTask,
        taskGroupCode,
        taskCode,
        currentValue,
        currentTaskComment,
        canComplete,
        formData,
        errors,
      }),
    },
  };
};
