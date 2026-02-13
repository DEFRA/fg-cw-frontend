import { wreck } from "../../common/wreck.js";

export const findAll = async (authContext, criteria) => {
  const params = criteria ? `?${new URLSearchParams(criteria)}` : "";
  const { payload } = await wreck.get(`/cases${params}`, {
    headers: {
      authorization: `Bearer ${authContext.token}`,
    },
  });

  return payload;
};

export const findById = async (authContext, caseId, tabId = null) => {
  const qs = tabId ? `?tabId=${tabId}` : "";
  const { payload } = await wreck.get(`/cases/${caseId}${qs}`, {
    headers: {
      authorization: `Bearer ${authContext.token}`,
    },
  });
  return payload;
};

export const findTabById = async (authContext, caseId, tabId, queryString) => {
  const qs = queryString ? `?${queryString}` : "";
  const { payload } = await wreck.get(`/cases/${caseId}/tabs/${tabId}${qs}`, {
    headers: {
      authorization: `Bearer ${authContext.token}`,
    },
    timeout: 10000,
  });
  return payload;
};

export const updateTaskStatus = async (
  authContext,
  { caseId, taskGroupCode, taskCode, status, completed, comment = null },
) => {
  await wreck.patch(
    `/cases/${caseId}/task-groups/${taskGroupCode}/tasks/${taskCode}/status`,
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

export const triggerPageAction = async (
  authContext,
  { caseId, actionCode },
) => {
  const { res, payload } = await wreck.post(`/cases/${caseId}/page-action`, {
    headers: {
      authorization: `Bearer ${authContext.token}`,
    },
    payload: { actionCode },
    timeout: 10000,
  });
  return { res, payload };
};
