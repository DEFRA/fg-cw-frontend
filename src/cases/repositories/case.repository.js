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
}) => {
  await wreck.patch(
    `/cases/${caseId}/stages/${stageId}/task-groups/${taskGroupId}/tasks/${taskId}/status`,
    {
      payload: { status: isComplete ? "complete" : "pending" },
    },
  );
};

export const completeStage = async (caseId) => {
  await wreck.post(`/cases/${caseId}/stage`);
};

export const assignUserToCase = async ({ caseId, assignedUserId, notes }) => {
  await wreck.patch(`/cases/${caseId}/assigned-user`, {
    payload: { assignedUserId, notes },
  });
};

export const addNoteToCase = async ({ caseId, type, text }) => {
  await wreck.post(`/cases/${caseId}/notes`, {
    payload: { type, text },
  });
};
