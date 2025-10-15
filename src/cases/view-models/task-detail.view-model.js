import { getFormattedGBDate } from "../../common/helpers/date-helpers.js";
import { setActiveLink } from "../../common/helpers/navigation-helpers.js";

export const createTaskDetailViewModel = (caseData, query, errors) => {
  const stage = caseData.stages.find(
    (stage) => stage.code === caseData.currentStage,
  );

  const { taskGroupCode, taskCode } = query;
  const currentGroup = stage.taskGroups.find((g) => g.code === taskGroupCode);
  const currentGroupTasks = currentGroup.tasks;
  const currentTask = currentGroupTasks.find((t) => t.code === taskCode);

  // get the comment / note if it exists.
  const noteComment = caseData.comments.find(
    (c) => c.ref === currentTask.commentRef,
  );

  return {
    errors,
    errorList: errors,
    pageTitle: "Case task",
    pageHeading: "Case",
    breadcrumbs: [
      { text: "Cases", href: "/cases" },
      { text: caseData.caseRef, href: "/cases/" + caseData._id },
    ],
    links: setActiveLink(caseData.links, "tasks"),
    data: {
      banner: caseData.banner,
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
      taskGroupCode,
      comment: noteComment,
      currentTask: {
        ...currentTask,
        link: `/cases/${caseData._id}/tasks/${taskGroupCode}/${currentTask.code}`,
        status: currentTask.status === "complete" ? "COMPLETE" : "INCOMPLETE",
        isComplete: currentTask.status === "complete",
      },
    },
  };
};
