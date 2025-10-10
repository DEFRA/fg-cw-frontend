import { getFormattedGBDate } from "../../common/helpers/date-helpers.js";
import { setActiveLink } from "../../common/helpers/navigation-helpers.js";

export const createTaskListViewModel = (caseData, errors = {}, values = {}) => {
  const stage = caseData.stages.find(
    (stageInfo) => stageInfo.code === caseData.currentStage,
  );

  const allTasksComplete = stage.taskGroups
    .flatMap((taskGroup) => taskGroup.tasks)
    .every((task) => task.status === "complete");

  const currentStage = {
    ...stage,
    taskGroups: mapTaskGroups(stage.taskGroups, caseData._id),
    actions: mapActions({ stage, errors, values }),
    saveDisabled: !allTasksComplete,
  };

  return {
    pageTitle: `Case tasks - ${stage.title}`,
    pageHeading: "Case",
    breadcrumbs: [
      { text: "Cases", href: "/cases" },
      { text: caseData.caseRef },
    ],
    links: setActiveLink(caseData.links, "tasks"),
    data: {
      case: mapCaseData(caseData),
      stage: currentStage,
    },
    errors,
    errorList: Object.values(errors),
    values,
  };
};

const mapTaskGroups = (taskGroups, caseId) => {
  return taskGroups.map((taskGroup) => ({
    ...taskGroup,
    tasks: taskGroup.tasks.map((task) => {
      return {
        ...task,
        link: `/cases/${caseId}/tasks/${taskGroup.id}/${task.id}`,
        status: task.status === "complete" ? "COMPLETE" : "INCOMPLETE",
        isComplete: task.status === "complete",
      };
    }),
  }));
};

const mapCaseData = (caseData) => {
  return {
    id: caseData._id,
    caseRef: caseData.caseRef,
    code: caseData.workflowCode,
    submittedAt: getFormattedGBDate(caseData.payload.submittedAt),
    status: caseData.status,
    sbi: caseData.payload.identifiers?.sbi,
    scheme: caseData.payload.answers?.scheme,
    dateReceived: caseData.dateReceived,
    assignedUser: caseData.assignedUser,
    link: `/cases/${caseData._id}`,
    stages: caseData.stages,
    currentStage: caseData.currentStage,
    banner: caseData.banner,
  };
};

const mapActions = ({ stage, errors, values }) => {
  const legend = stage.actionTitle || "Decision";
  return {
    idPrefix: "actionId",
    name: "actionId",
    legend,
    errorMessage: getFieldValue("actionId", errors),
    items: mapActionItems({ stage, actions: stage.actions, errors, values }),
  };
};

const mapActionItems = ({ actions, stage, errors, values }) =>
  actions?.map((action) => {
    const conditional = createConditionalTextarea({
      action,
      stage,
      errors,
      values,
    });

    const checked = mapChecked({ action, stage, values });

    return {
      value: action.id,
      text: action.label,
      checked,
      conditional,
    };
  }) || [];

const mapChecked = ({ action, stage, values }) => {
  return values.actionId
    ? values.actionId === action.id
    : stage.outcome?.actionId === action.id;
};

const getValue = ({ name, action, stage, values }) => {
  return (
    getFieldValue(name, values) || getInitialTextareaValue(action, stage) || ""
  );
};

const createConditionalTextarea = ({ action, stage, errors, values }) => {
  if (!action.comment) {
    return undefined;
  }

  const name = `${action.id}-comment`;
  const value = getValue({ name, action, stage, errors, values });
  const errorMessage = getFieldValue(name, errors);

  return createTextarea({ name, value, comment: action.comment, errorMessage });
};

const getFieldValue = (fieldName, data) => {
  return data && fieldName in data ? data[fieldName] : undefined;
};

const getInitialTextareaValue = (action, stage) => {
  return isCurrentAction(action, stage) ? stage.outcome?.comment || "" : "";
};

const createTextarea = ({ name, value, comment, errorMessage }) => {
  return {
    id: name,
    name,
    value,
    label: { text: comment.label },
    hint: comment.helpText ? { text: comment.helpText } : undefined,
    required: comment.type === "REQUIRED",
    errorMessage,
    rows: 3,
  };
};

const isCurrentAction = (action, stage) =>
  action.id === stage.outcome?.actionId;
