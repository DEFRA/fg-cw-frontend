import { getFormattedGBDate } from "../../common/helpers/date-helpers.js";

export const createTaskDetailViewModel = (caseData, query) => {
  const stage = caseData.stages.find(
    (stage) => stage.id === caseData.currentStage,
  );

  return {
    pageTitle: "Case task",
    heading: "Case",
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
      taskId: query.taskId,
      taskGroupId: query.taskGroupId,
    },
  };
};
