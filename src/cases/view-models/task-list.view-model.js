import { getFormattedGBDate } from "../../common/helpers/date-helpers.js";
import { resolveBannerPaths } from "../../common/helpers/resolvePaths.js";

export const createTaskListViewModel = (caseData) => {
  const stage = caseData.stages.find(
    (stageInfo) => stageInfo.id === caseData.currentStage,
  );

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
      stage: {
        ...stage,
        taskGroups: stage.taskGroups.map((taskGroup) => ({
          ...taskGroup,
          tasks: taskGroup.tasks.map((task) => ({
            ...task,
            link: `/cases/${caseData._id}/tasks/${taskGroup.id}/${task.id}`,
            status: task.status === "complete" ? "COMPLETE" : "INCOMPLETE",
            isComplete: task.status === "complete",
          })),
        })),
      },
    },
  };
};
