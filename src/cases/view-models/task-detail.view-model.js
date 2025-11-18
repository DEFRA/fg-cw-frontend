import { setActiveLink } from "../../common/helpers/navigation-helpers.js";

export const hasAllRequiredRoles = (userRoles, allOf) => {
  return !allOf.length || allOf.every((role) => userRoles.includes(role));
};

export const hasAnyRequiredRole = (userRoles, anyOf) => {
  return !anyOf.length || anyOf.some((role) => userRoles.includes(role));
};

// eslint-disable-next-line complexity
export const checkTaskAccess = (appRoles, taskRequiredRoles) => {
  if (!taskRequiredRoles) {
    return true;
  }

  const { allOf = [], anyOf = [] } = taskRequiredRoles;

  return (
    hasAllRequiredRoles(Object.keys(appRoles), allOf) &&
    hasAnyRequiredRole(Object.keys(appRoles), anyOf)
  );
};

export const createTaskDetailViewModel = (kase, query, roles, errors) => {
  const stage = kase.stage;

  const { taskGroupCode, taskCode } = query;
  const currentGroup = stage.taskGroups.find((g) => g.code === taskGroupCode);
  const currentGroupTasks = currentGroup.tasks;
  const currentTask = currentGroupTasks.find((t) => t.code === taskCode);

  // get the comment / note if it exists.
  const currentTaskComment =
    kase.comments.find((c) => c.ref === currentTask.commentRef) ?? null;

  const canCompleteTask = checkTaskAccess(roles, currentTask.requiredRoles);

  // Check if stage is interactive, defaults to true for backwards compatibility
  const isInteractive = stage.interactive ?? true;

  return {
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
      caseId: kase._id,
      isInteractive,
      currentTask: {
        formAction: `/cases/${kase._id}/task-groups/${taskGroupCode}/tasks/${taskCode}/status`,
        description: currentTask.description,
        status: currentTask.status,
        statusOptions: currentTask.statusOptions,
        completed: currentTask.completed,
        commentInputDef: currentTask.commentInputDef,
        comment: currentTaskComment,
        canCompleteTask,
        requiredRoles: currentTask.requiredRoles,
        updatedBy: currentTask.updatedBy,
        updatedAt: currentTask.updatedAt,
      },
    },
  };
};
