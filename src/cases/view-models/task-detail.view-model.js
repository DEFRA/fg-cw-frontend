import { setActiveLink } from "../../common/helpers/navigation-helpers.js";
import { createHeaderViewModel } from "../../common/view-models/header.view-model.js";

const getFieldValue = (fieldName, values) => values?.[fieldName];

const createErrorList = (errors) => {
  if (!errors) {
    return [];
  }
  return Object.values(errors);
};

const createConditionalTextarea = ({
  statusCode,
  commentInputDef,
  commentText,
  commentError,
}) => {
  if (!commentInputDef) {
    return undefined;
  }

  const name = `${statusCode}-comment`;
  return {
    id: name,
    name,
    value: commentText,
    label: { text: commentInputDef.label },
    hint: commentInputDef.helpText
      ? { text: commentInputDef.helpText }
      : undefined,
    required: commentInputDef.mandatory,
    errorMessage: commentError,
    rows: 5,
  };
};

const isCurrentStatusWithComment = (
  optionCode,
  currentStatus,
  currentTaskComment,
) => {
  return optionCode === currentStatus && currentTaskComment;
};

const getInitialCommentValue = ({
  optionCode,
  currentStatus,
  currentTaskComment,
  formData,
}) => {
  const commentFieldName = `${optionCode}-comment`;

  const formDataValue = getFieldValue(commentFieldName, formData);
  if (formDataValue !== undefined) {
    return formDataValue;
  }

  if (
    isCurrentStatusWithComment(optionCode, currentStatus, currentTaskComment)
  ) {
    return currentTaskComment.text || "";
  }

  return "";
};

const mapStatusOptions = ({
  statusOptions,
  currentStatus,
  commentInputDef,
  currentTaskComment,
  formData,
  errors,
}) => {
  if (!statusOptions || statusOptions.length === 0) {
    return [];
  }

  return statusOptions.map((option) => {
    const commentFieldName = `${option.code}-comment`;
    const commentText = getInitialCommentValue({
      optionCode: option.code,
      currentStatus,
      currentTaskComment,
      formData,
    });
    const commentError = getFieldValue(commentFieldName, errors);

    const conditional = createConditionalTextarea({
      statusCode: option.code,
      commentInputDef,
      commentText,
      commentError,
    });

    return {
      value: option.code,
      text: option.name,
      checked: option.code === currentStatus,
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
  currentStatus,
  currentTaskComment,
  canComplete,
  formData,
  errors,
}) => {
  return {
    formAction: `/cases/${kase._id}/task-groups/${taskGroupCode}/tasks/${taskCode}/status`,
    description: currentTask.description,
    status: currentStatus,
    statusOptions: mapStatusOptions({
      statusOptions: currentTask.statusOptions,
      currentStatus,
      commentInputDef: currentTask.commentInputDef,
      currentTaskComment,
      formData,
      errors,
    }),
    completed: getFieldValue("completed", formData) ?? currentTask.completed,
    comment: currentTaskComment,
    statusError: errors?.status,
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
  const currentStatus = getFieldValue("status", formData) ?? currentTask.status;

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
      currentTask: buildCurrentTaskData({
        kase,
        currentTask,
        taskGroupCode,
        taskCode,
        currentStatus,
        currentTaskComment,
        canComplete,
        formData,
        errors,
      }),
    },
  };
};
