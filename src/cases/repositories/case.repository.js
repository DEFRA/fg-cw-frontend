import { wreck } from "../../common/wreck.js";

export const findAll = async (authContext) => {
  const { payload } = await wreck.get("/cases", {
    headers: {
      authorization: `Bearer ${authContext.token}`,
    },
  });

  return payload;
};

export const findById = async (authContext, caseId) => {
  const { payload } = await wreck.get(`/cases/${caseId}`, {
    headers: {
      authorization: `Bearer ${authContext.token}`,
    },
  });
  return payload;
};

export const findTabById = async (authContext, caseId, tabId) => {
  const { payload } = await wreck.get(`/cases/${caseId}/tabs/${tabId}`, {
    headers: {
      authorization: `Bearer ${authContext.token}`,
    },
  });
  return payload;
};

export const updateTaskStatus = async (
  authContext,
  {
    caseId,
    phaseCode,
    stageCode,
    taskGroupCode,
    taskCode,
    status,
    completed,
    comment = null,
  },
) => {
  await wreck.patch(
    `/cases/${caseId}/phases/${phaseCode}/stages/${stageCode}/task-groups/${taskGroupCode}/tasks/${taskCode}/status`,
    {
      headers: {
        authorization: `Bearer ${authContext.token}`,
      },
      payload: {
        status,
        completed,
        comment: comment === "" ? null : comment,
      },
    },
  );
};

export const completeStage = async (authContext, caseId) => {
  await wreck.post(`/cases/${caseId}/stage`, {
    headers: {
      authorization: `Bearer ${authContext.token}`,
    },
  });
};

export const updateStageOutcome = async (
  authContext,
  { caseId, ...payload },
) => {
  await wreck.patch(`/cases/${caseId}/stage/outcome`, {
    headers: {
      authorization: `Bearer ${authContext.token}`,
    },
    payload,
  });
};

export const assignUserToCase = async (
  authContext,
  { caseId, assignedUserId, notes },
) => {
  await wreck.patch(`/cases/${caseId}/assigned-user`, {
    headers: {
      authorization: `Bearer ${authContext.token}`,
    },
    payload: { assignedUserId, notes },
  });
};

export const addNoteToCase = async (authContext, { caseId, text }) => {
  await wreck.post(`/cases/${caseId}/notes`, {
    headers: {
      authorization: `Bearer ${authContext.token}`,
    },
    payload: { text },
  });
};
