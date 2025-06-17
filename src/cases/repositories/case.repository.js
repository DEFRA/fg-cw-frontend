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
  return await wreck.patch(
    `/cases/${caseId}/stages/${stageId}/task-groups/${taskGroupId}/tasks/${taskId}/status`,
    {
      payload: { status: isComplete ? "complete" : "pending" },
    },
  );
};

export const completeStage = async (caseId) => {
  try {
    await wreck.post(`/cases/${caseId}/stage`);
  } catch (e) {
    if (e.data?.payload) {
      return { error: e.data.payload };
    }
    return { error: "Update failed" };
  }
};
