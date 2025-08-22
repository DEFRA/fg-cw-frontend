import { wreck } from "../../common/wreck.js";

export const findAll = async () => {
  const { payload } = await wreck.get("/cases");
  return payload;
};

export const findById = async (caseId) => {
  const { payload } = await wreck.get(`/cases/${caseId}`);
  return payload;
};

export const updateTaskStatus = async ({
  caseId,
  stageId,
  taskGroupId,
  taskId,
  isComplete,
  comment = null,
}) => {
  await wreck.patch(
    `/cases/${caseId}/stages/${stageId}/task-groups/${taskGroupId}/tasks/${taskId}/status`,
    {
      payload: {
        status: isComplete ? "complete" : "pending",
        comment: comment === "" ? null : comment,
      },
    },
  );
};

export const completeStage = async (caseId) => {
  await wreck.post(`/cases/${caseId}/stage`);
};

export const updateStageOutcome = async ({ caseId, ...payload }) => {
  await wreck.put(`/cases/${caseId}/stage/outcome`, { payload });
};

export const assignUserToCase = async ({ caseId, assignedUserId, notes }) => {
  await wreck.patch(`/cases/${caseId}/assigned-user`, {
    payload: { assignedUserId, notes },
  });
};

export const addNoteToCase = async ({ caseId, text }) => {
  await wreck.post(`/cases/${caseId}/notes`, {
    payload: { text },
  });
};
