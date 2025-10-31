import { getFormattedGBDate } from "../../common/helpers/date-helpers.js";
import { setActiveLink } from "../../common/helpers/navigation-helpers.js";

export const hasAllRequiredRoles = (userRoles, allOf) => {
  return !allOf.length || allOf.every((role) => userRoles.includes(role));
};

export const hasAnyRequiredRole = (userRoles, anyOf) => {
  return !anyOf.length || anyOf.some((role) => userRoles.includes(role));
};

// eslint-disable-next-line complexity
export const checkTaskAccess = (appRoles, taskRequiredRoles = {}) => {
  const { allOf = [], anyOf = [] } = taskRequiredRoles;

  return (
    hasAllRequiredRoles(Object.keys(appRoles), allOf) &&
    hasAnyRequiredRole(Object.keys(appRoles), anyOf)
  );
};

export const createTaskDetailViewModel = (kase, query, roles, errors) => {
  const stage = kase.phases
    .find((p) => p.code === kase.currentPhase)
    .stages.find((s) => s.code === kase.currentStage);

  const { taskGroupCode, taskCode } = query;
  const currentGroup = stage.taskGroups.find((g) => g.code === taskGroupCode);
  const currentGroupTasks = currentGroup.tasks;
  const currentTask = currentGroupTasks.find((t) => t.code === taskCode);

  // get the comment / note if it exists.
  const noteComment = kase.comments.find(
    (c) => c.ref === currentTask.commentRef,
  );

  return {
    errors,
    errorList: errors,
    pageTitle: "Case task",
    pageHeading: "Case",
    breadcrumbs: [
      { text: "Cases", href: "/cases" },
      { text: kase.caseRef, href: "/cases/" + kase._id },
    ],
    links: setActiveLink(kase.links, "tasks"),
    data: {
      banner: kase.banner,
      case: {
        id: kase._id,
        caseRef: kase.caseRef,
        code: kase.workflowCode,
        submittedAt: getFormattedGBDate(kase.payload.submittedAt),
        currentStatus: kase.currentStatus,
        sbi: kase.payload.identifiers?.sbi,
        scheme: kase.payload.answers?.scheme,
        dateReceived: kase.dateReceived,
        assignedUser: kase.assignedUser,
        link: `/cases/${kase._id}`,
        stages: kase.stages,
        currentPhase: kase.currentPhase,
        currentStage: kase.currentStage,
      },
      stage,
      taskGroupCode,
      comment: noteComment,
      currentTask: {
        ...currentTask,
        link: `/cases/${kase._id}/tasks/${taskGroupCode}/${currentTask.code}`,
        status: currentTask.status === "complete" ? "COMPLETE" : "INCOMPLETE",
        isComplete: currentTask.status === "complete",
        canCompleteTask: checkTaskAccess(roles, currentTask.requiredRoles),
      },
    },
  };
};
