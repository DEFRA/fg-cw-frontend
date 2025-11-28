import { setActiveLink } from "../../common/helpers/navigation-helpers.js";

export const createTaskListViewModel = (kase, errors = {}, values = {}) => {
  const stage = kase.stage;

  return {
    pageTitle: `Case tasks - ${stage.name}`,
    pageHeading: "Case",
    breadcrumbs: [{ text: "Cases", href: "/cases" }, { text: kase.caseRef }],
    links: setActiveLink(kase.links, "tasks"),
    data: {
      case: kase,
      stage: {
        ...stage,
        taskGroups: mapTaskGroups(stage.taskGroups, kase._id),
        actions: mapActions({ stage, errors, values }),
      },
      beforeContent: kase.beforeContent,
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
      const isComplete = task.completed === true;

      return {
        ...task,
        link: `/cases/${caseId}/tasks/${taskGroup.code}/${task.code}`,
        status: isComplete ? "COMPLETE" : "INCOMPLETE",
        isComplete,
      };
    }),
  }));
};

const mapActions = ({ stage, errors, values }) => {
  const legend = stage.actionTitle || "Decision";
  return {
    idPrefix: "actionCode",
    name: "actionCode",
    legend,
    errorMessage: getFieldValue("actionCode", errors),
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
      value: action.code,
      text: action.name,
      checked,
      conditional,
    };
  }) || [];

const mapChecked = ({ action, stage, values }) => {
  return values.actionCode
    ? values.actionCode === action.code
    : stage.outcome?.actionCode === action.code;
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

  const name = `${action.code}-comment`;
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
    required: comment.mandatory,
    errorMessage,
    rows: 5,
  };
};

const isCurrentAction = (action, stage) =>
  action.code === stage.outcome?.actionCode;
