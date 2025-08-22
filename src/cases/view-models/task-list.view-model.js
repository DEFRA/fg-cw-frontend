import { getFormattedGBDate } from "../../common/helpers/date-helpers.js";
import { resolveBannerPaths } from "../../common/helpers/resolvePaths.js";

export const createTaskListViewModel = (caseData, errors = {}, values = {}) => {
  const stage = caseData.stages.find(
    (stageInfo) => stageInfo.id === caseData.currentStage,
  );

  const allTasks = [];
  const actionTitle = stage.actionTitle || "Decision";
  const currentStage = {
    ...stage,
    taskGroups: stage.taskGroups.map((taskGroup) => ({
      ...taskGroup,
      tasks: taskGroup.tasks.map((task) => {
        allTasks.push(task);
        return {
          ...task,
          link: `/cases/${caseData._id}/tasks/${taskGroup.id}/${task.id}`,
          status: task.status === "complete" ? "COMPLETE" : "INCOMPLETE",
          isComplete: task.status === "complete",
        };
      }),
    })),
    actions: {
      idPrefix: "actionId",
      name: "actionId",
      legend: actionTitle,
      errorMessage: errors && errors.actionId ? errors.actionId : undefined,
      items: stage.actions.map((action) => {
        const item = {
          value: action.id,
          text: action.label,
          checked: values.actionId
            ? values.actionId === action.id
            : stage.outcome?.actionId === action.id,
        };

        if (action.comment) {
          const textareaFieldName = `${action.id}-comment`;
          const textareaConfig = {
            id: textareaFieldName,
            name: textareaFieldName,
            value:
              action.id === stage.outcome.actionId
                ? stage.outcome?.comment || ""
                : "",
            label: { text: action.comment.label },
            hint: action.comment.helpText
              ? { text: action.comment.helpText }
              : undefined,
            rows: 3,
            required: action.comment.type === "REQUIRED",
          };

          // Add error state if present
          if (errors && errors[textareaFieldName]) {
            textareaConfig.errorMessage = errors[textareaFieldName];
          }

          // Add preserved value if present
          if (values && textareaFieldName in values) {
            textareaConfig.value = values[textareaFieldName];
          }

          item.conditional = textareaConfig;
        }

        return item;
      }),
    },
  };

  const allTasksComplete = allTasks.every((task) => task.status === "complete");

  return {
    pageTitle: "Case tasks - " + stage.title,
    pageHeading: "Case",
    breadcrumbs: [
      { text: "Cases", href: "/cases" },
      { text: caseData.caseRef },
    ],
    data: {
      case: {
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
        banner: resolveBannerPaths(caseData.banner, caseData),
      },
      stage: currentStage,
      allTasksComplete,
    },
    errors,
    errorList: Object.values(errors),
    values,
  };
};
