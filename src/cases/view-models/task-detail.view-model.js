import { getFormattedGBDate } from "../../common/helpers/date-helpers.js";

export const createTaskDetailViewModel = (caseData, query) => {
  const stage = caseData.stages.find(
    (stage) => stage.id === caseData.currentStage,
  );

  const { taskGroupId, taskId } = query;
  const currentGroup = stage.taskGroups.find((g) => g.id === taskGroupId);
  const currentGroupTasks = currentGroup.tasks;
  const currentTask = currentGroupTasks.find((t) => t.id === taskId);

  return {
    pageTitle: "Case task",
    pageHeading: "Case",
    breadcrumbs: [
      { text: "Cases", href: "/cases" },
      { text: caseData.caseRef, href: "/cases/" + caseData._id },
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
      },
      stage,
      taskGroupId,
      currentTask: {
        ...currentTask,
        link: `/cases/${caseData._id}/tasks/${taskGroupId}/${currentTask.id}`,
        status: currentTask.status === "complete" ? "COMPLETE" : "INCOMPLETE",
        isComplete: currentTask.status === "complete",
      },
    },
  };
};
